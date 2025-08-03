/* eslint-disable @next/next/no-img-element */
import { useProtectedUrl } from "@/hooks/use-protected-file";
import { Booking } from "@/lib/models";
import { File } from "lucide-react";

export function AttachmentPreview({ booking }: { booking: Booking }) {
  const fileUrl = useProtectedUrl(booking, (b) => b.attachment, {
    thumb: "100x100",
  });
  const fullFileUrl = useProtectedUrl(booking, (b) => b.attachment);

  if (!fileUrl || !fullFileUrl) return null;

  // If the file is an image, display it directly. If it is a PDF, display
  // A placeholder icon.
  return (
    <a href={fullFileUrl} target="_blank" rel="noopener noreferrer">
      {booking.attachment?.endsWith(".pdf") ? (
        <div className="size-8 bg-muted rounded-sm flex items-center justify-center">
          <File className="size-4 text-muted-foreground" />
        </div>
      ) : (
        <img
          src={fileUrl}
          alt="Attachment preview"
          className="size-8 rounded"
        />
      )}
      <span className="sr-only">Anhang: {booking.attachment}</span>
    </a>
  );
}
