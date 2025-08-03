/// <reference path="../pb_data/types.d.ts" />

// register "GET /hello/{name}" route (allowed for everyone)
routerAdd("GET", "/pdf-gen", async (e) => {
  if (!e.auth) {
    return e.json(401, { error: "Unauthorized" });
  }

  try {
    const {
      PDFDocument,
      StandardFonts,
      rgb,
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
        };
      };
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

    // Get the bookings for the specified date range and account
    let bookings = $app.findRecordsByFilter(
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

    // Create the PDF document
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // TODO Add PDF File

    const pdfBytes = await pdfDoc.save();
    return e.blob(200, "application/pdf", pdfBytes);
  } catch (err) {
    console.error("Error in PDF generation:", err);
    return e.json(500, { error: "Internal Server Error" });
  }
});
