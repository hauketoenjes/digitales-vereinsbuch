/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/pdf-gen", async (e) => {
  if (!e.auth) {
    return e.json(401, { error: "Unauthorized" });
  }

  try {
    const {
      PDFDocument,
      StandardFonts,
      rgb,
      degrees,
    } = require("pdf-lib/dist/pdf-lib.js");

    // fetch-Shim
    if (!globalThis.fetch) {
      globalThis.fetch = (url, options = {}) => {
        const cfg = {
          url,
          method: options.method || "GET",
          body: options.body || "",
          headers: options.headers || {},
          timeout: options.timeout || 60,
        };
        const res = $http.send(cfg);
        return {
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(res.json),
          text: () => {
            // res.body liefert ein Array von Bytes
            if (Array.isArray(res.body)) {
              let str = "";
              for (const byte of res.body) {
                str += String.fromCharCode(byte);
              }
              return Promise.resolve(str);
            }
            return Promise.resolve(res.raw);
          },
          arrayBuffer: () => {
            // Verwende res.body für die Bytes
            const bytes = Array.isArray(res.body)
              ? res.body
              : Array.from(res.raw, (c) => c.charCodeAt(0));
            return Promise.resolve(Uint8Array.from(bytes).buffer);
          },
          headers: {
            get: (headerName) => {
              const h = Object.entries(res.headers || {}).find(
                ([key]) => key.toLowerCase() === headerName.toLowerCase()
              );
              return h ? h[1] : null;
            },
          },
        };
      };
    }

    // Shim setTimeout and clearTimeout for pdf-lib compatibility
    if (typeof globalThis.setTimeout === "undefined") {
      globalThis.setTimeout = (fn, delay, ...args) => {
        fn(...args);
        return 0;
      };
    }
    if (typeof globalThis.clearTimeout === "undefined") {
      globalThis.clearTimeout = (id) => {};
    }

    // Get the required data from the request body
    const requestData = new DynamicModel({
      fromDate: "",
      toDate: "",
      accountId: "",
    });
    e.bindBody(requestData);

    if (
      !requestData.fromDate ||
      !requestData.toDate ||
      !requestData.accountId
    ) {
      return e.json(400, {
        error: "Missing required fields: fromDate, toDate, accountId",
      });
    }

    const bookings = await $app.findRecordsByFilter(
      "bookings",
      `date >= {:fromDate} && date <= {:toDate} && accountId.ownerId = {:userId} && accountId = {:accountId}`,
      "date",
      100_000,
      0,
      {
        fromDate: requestData.fromDate,
        toDate: requestData.toDate,
        userId: e.auth.id,
        accountId: requestData.accountId,
      }
    );
    // Flatten records to plain objects for reliable field access
    const rawBookings = JSON.parse(JSON.stringify(bookings));

    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );
    const helveticaObliqueFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaOblique
    );
    // Initialize PocketBase filesystem for attachments
    const fsys = $app.newFilesystem();

    // Helper to format dates as DD.MM.YYYY
    function formatDateGerman(dateInput) {
      const d = new Date(dateInput);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }

    const pageSize = [595.28, 841.89]; // A4 size (points)
    const fontSize = 12;
    const now = formatDateGerman(new Date());

    // Group bookings by date
    const bookingsByDate = {};
    rawBookings.forEach((b) => {
      const dateKey = formatDateGerman(b.date);
      if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
      bookingsByDate[dateKey].push(b);
    });
    const dateKeys = Object.keys(bookingsByDate).sort((a, b) => {
      const [d1, m1, y1] = a.split(".").map(Number);
      const [d2, m2, y2] = b.split(".").map(Number);
      return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
    });

    // Prefetch all attachments in parallel
    const attachmentBuffers = {};
    await Promise.all(
      dateKeys.flatMap((dateKey) =>
        bookingsByDate[dateKey]
          .filter((b) => b.attachment)
          .map(async (booking) => {
            const url = [
              $app.settings().meta.appURL,
              "api/files",
              bookings.find((b2) => b2.id === booking.id).baseFilesPath(),
              booking.attachment,
            ].join("/");
            const res = await fetch(url);
            if (!res.ok) {
              throw new Error(`Failed to fetch attachment ${booking.id}`);
            }
            const buffer = await res.arrayBuffer();
            const contentType = res.headers.get("content-type") || "";
            attachmentBuffers[booking.id] = { buffer, contentType };
          })
      )
    );

    const totalPages = dateKeys.length;
    for (let pageIndex = 0; pageIndex < dateKeys.length; pageIndex++) {
      const dateKey = dateKeys[pageIndex];
      const dayBookings = bookingsByDate[dateKey];
      const page = pdfDoc.addPage(pageSize);
      const { width, height } = page.getSize();
      // Page header bar
      const headerHeight = 60;
      page.drawRectangle({
        x: 0,
        y: height - headerHeight,
        width: width,
        height: headerHeight,
        color: rgb(0.15, 0.32, 0.48),
      });
      // Tag title on header
      page.drawText(`Tag: ${dateKey}`, {
        x: 50,
        y: height - 40,
        size: 18,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1),
      });
      // Page number on header
      page.drawText(`Seite: ${pageIndex + 1}/${totalPages}`, {
        x: width - 100,
        y: height - 40,
        size: 12,
        font: helveticaObliqueFont,
        color: rgb(1, 1, 1),
      });
      // Starting Y after header
      let cursorY = height - headerHeight - 20;
      dayBookings.forEach((booking, bookingIndex) => {
        page.drawText(`Buchung ${bookingIndex + 1}:`, {
          x: 50,
          y: cursorY,
          size: fontSize,
          font: helveticaBoldFont,
        });
        cursorY -= 20;
        page.drawText(`Betrag: ${booking.amount.toFixed(2)} EUR`, {
          x: 70,
          y: cursorY,
          size: fontSize,
          font: helveticaFont,
        });
        cursorY -= 15;
        page.drawText(
          `Beschreibung: ${booking.description || "Keine Beschreibung"}`,
          {
            x: 70,
            y: cursorY,
            size: fontSize,
            font: helveticaFont,
          }
        );
        cursorY -= 25;
        if (booking.attachment) {
          page.drawText(`Anhang ID: ${dateKey}-${bookingIndex + 1}`, {
            x: 70,
            y: cursorY,
            size: fontSize,
            font: helveticaObliqueFont,
            color: rgb(0.15, 0.32, 0.48),
          });
          cursorY -= 20;
        }
      });
      // Attachments placeholders (only bookings with attachments)
      const attachments = dayBookings.filter((b) => b.attachment);
      if (attachments.length > 0) {
        page.drawText("Belege:", {
          x: 50,
          y: cursorY,
          size: fontSize,
          font: helveticaBoldFont,
        });
        cursorY -= 20;
        attachments.forEach((booking, idx) => {
          const placeholderId = `${dateKey}-${idx + 1}`;
          page.drawText(`[Attachment ID ${placeholderId}]`, {
            x: 70,
            y: cursorY,
            size: fontSize,
            font: helveticaObliqueFont,
          });
          cursorY -= 20;
        });
      }
      // Embed image attachments immediately after this group
      for (
        let bookingIndex = 0;
        bookingIndex < dayBookings.length;
        bookingIndex++
      ) {
        const booking = dayBookings[bookingIndex];
        if (booking.attachment) {
          const imgPage = pdfDoc.addPage(pageSize);
          const { width: iw, height: ih } = imgPage.getSize();
          // Attachment page header
          imgPage.drawText(`Anhang ${dateKey}-${bookingIndex + 1}`, {
            x: 50,
            y: ih - 50,
            size: fontSize,
            font: helveticaBoldFont,
            color: rgb(0.15, 0.32, 0.48),
          });
          // Use prefetched attachment buffer
          try {
            const { buffer: dataImg, contentType } =
              attachmentBuffers[booking.id];
            if (booking.attachment.toLowerCase().endsWith(".pdf")) {
              // Embed PDF
              const attachedPdf = await PDFDocument.load(dataImg);
              const attachedPages = await pdfDoc.copyPages(
                attachedPdf,
                attachedPdf.getPageIndices()
              );
              attachedPages.forEach((p) => pdfDoc.addPage(p));
            } else {
              // Embed image full-page below header
              let embeddedImage;
              if (contentType === "image/png") {
                embeddedImage = await pdfDoc.embedPng(dataImg);
              } else {
                embeddedImage = await pdfDoc.embedJpg(dataImg);
              }
              const margin = 50;
              const titleOffset = 40;
              const maxW = iw - margin * 2;
              const maxH = ih - margin * 2 - titleOffset;
              const scale = Math.min(
                maxW / embeddedImage.width,
                maxH / embeddedImage.height
              );
              const drawW = embeddedImage.width * scale;
              const drawH = embeddedImage.height * scale;
              imgPage.drawImage(embeddedImage, {
                x: (iw - drawW) / 2,
                y: margin,
                width: drawW,
                height: drawH,
              });
            }
          } catch (e) {
            imgPage.drawText("Fehler beim Laden des Anhangs.", {
              x: 50,
              y: ih / 2,
              size: fontSize,
              font: helveticaFont,
            });
          }
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    // Close filesystem
    fsys.close();
    return e.blob(200, "application/pdf", pdfBytes);
  } catch (err) {
    console.error("Error in PDF generation:", err);
    return e.json(500, { error: "Internal Server Error" });
  }
});
