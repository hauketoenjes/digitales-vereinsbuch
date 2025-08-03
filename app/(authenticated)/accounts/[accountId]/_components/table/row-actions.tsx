import { DeleteBookingDialog } from "@/components/dialogs/delete-booking-dialog";
import { UpsertBookingDialog } from "@/components/dialogs/upsert-booking-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Booking } from "@/lib/models";
import { MoreHorizontal, Pen, Trash } from "lucide-react";

export function RowActions({ booking }: { booking: Booking }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <UpsertBookingDialog id={booking.id} accountId={booking.accountId}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pen className="size-4" />
            <span>Buchung bearbeiten</span>
          </DropdownMenuItem>
        </UpsertBookingDialog>
        <DeleteBookingDialog id={booking.id}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Trash className="size-4" />
            <span>Buchung Löschen</span>
          </DropdownMenuItem>
        </DeleteBookingDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
