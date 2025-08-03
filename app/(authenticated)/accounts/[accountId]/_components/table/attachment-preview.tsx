/* eslint-disable @next/next/no-img-element */
import { useProtectedUrl } from "@/hooks/use-protected-file";
import { Booking } from "@/lib/models";
import { File } from "lucide-react";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export function AttachmentPreview({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);

  const fileUrl = useProtectedUrl(booking, (b) => b.attachment, {
    thumb: "100x100",
  });
  const fullFileUrl = useProtectedUrl(booking, (b) => b.attachment);

  if (!fileUrl || !fullFileUrl) return null;

  // If the file is an image, display it directly. If it is a PDF, display
  // A placeholder icon.
  return (
    <>
      <Lightbox
        open={open}
        carousel={{ finite: true }}
        close={() => setOpen(false)}
        slides={[
          {
            src: fullFileUrl,
            alt: booking.attachment || "Attachment",
          },
        ]}
      />
      {booking.attachment?.endsWith(".pdf") ? (
        <a href={fullFileUrl} target="_blank" rel="noopener noreferrer">
          <div className="size-8 bg-muted rounded-sm flex items-center justify-center">
            <File className="size-4 text-muted-foreground" />
          </div>

          <span className="sr-only">Anhang: {booking.attachment}</span>
        </a>
      ) : (
        <button onClick={() => setOpen(true)} className="flex items-center">
          <img
            src={fileUrl}
            alt="Attachment preview"
            className="size-8 rounded"
          />
        </button>
      )}
    </>
  );
}
