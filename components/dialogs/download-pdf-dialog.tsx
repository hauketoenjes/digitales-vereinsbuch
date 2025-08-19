"use client";

import { formatISO } from "date-fns";
import { saveAs } from "file-saver";
import { PropsWithChildren, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { useBookings } from "@/hooks/use-bookings";
import { pocketbaseUrl } from "@/lib/constants";
import { pb } from "@/lib/pocketbase-client";
import { Button, buttonVariants } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export function DownloadPdfDialog({
  accountId,
  children,
}: PropsWithChildren<{
  accountId: string | null;
}>) {
  const { data: bookingsData } = useBookings(accountId);

  // Derive array of booking dates as Date objects
  const bookingDates = useMemo(() => {
    if (!bookingsData) return [];
    return bookingsData.map((b) => new Date(b.date));
  }, [bookingsData]);

  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const disabled = useMemo(
    () => !accountId || !range?.from || !range?.to,
    [accountId, range]
  );

  function resetRange() {
    setRange({ from: undefined, to: undefined });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      resetRange();
    }
  }

  async function onGenerate() {
    if (!accountId || !range?.from || !range?.to) return;
    setOpen(false);
    toast.promise(
      (async () => {
        const body = {
          accountId,
          fromDate: formatISO(range.from!, { representation: "complete" }),
          toDate: formatISO(range.to!, { representation: "complete" }),
        } as const;

        const resp = await fetch(`${pocketbaseUrl}/pdf-gen`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${pb.authStore.token}`,
          },
          body: JSON.stringify(body),
        });

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }

        const blob = await resp.blob();

        const fileBlob =
          blob instanceof Blob
            ? blob
            : new Blob([blob], { type: "application/pdf" });

        const filename = `report-${accountId}-${formatISO(range.from!, {
          representation: "date",
        })}-${formatISO(range.to!, { representation: "date" })}.pdf`;
        saveAs(fileBlob, filename);
      })(),
      {
        loading: "PDF-Report wird erstellt…",
        success: "PDF-Report wurde generiert und heruntergeladen.",
        error: "Erstellung fehlgeschlagen. Bitte später erneut versuchen.",
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>PDF-Report erstellen</DialogTitle>
          <DialogDescription>
            Wähle den Zeitraum aus, für den der Report generiert werden soll.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex justify-center overflow-x-auto">
          <div>
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={range}
              onSelect={(selected) => {
                if (!selected) {
                  setRange(undefined);
                  return;
                }
                const { from, to } = selected;
                let normalizedFrom = from ? new Date(from) : undefined;
                let normalizedTo = to ? new Date(to) : undefined;
                if (normalizedFrom) {
                  normalizedFrom.setHours(0, 0, 0, 0);
                }
                if (normalizedTo) {
                  normalizedTo.setHours(23, 59, 59, 999);
                }
                setRange({ from: normalizedFrom, to: normalizedTo });
              }}
              initialFocus
              modifiers={{ booked: bookingDates }}
              modifiersClassNames={{
                booked:
                  "relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-green-500",
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            className={buttonVariants({ variant: "default" })}
            disabled={disabled}
            onClick={onGenerate}
          >
            Report generieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
