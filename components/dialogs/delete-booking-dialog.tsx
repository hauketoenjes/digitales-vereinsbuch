import { useDeleteBookingMutation } from "@/hooks/use-bookings";
import { ClientResponseError } from "pocketbase";
import { PropsWithChildren, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { buttonVariants } from "../ui/button";

export function DeleteBookingDialog({
  id,
  children,
}: PropsWithChildren<{
  id: string | null;
}>) {
  const [open, setOpen] = useState(false);
  const deleteBooking = useDeleteBookingMutation();

  async function onDelete() {
    if (!id) return;

    try {
      await deleteBooking.mutateAsync(id);
      toast.success("Konto erfolgreich gelöscht");
      setOpen(false);
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 0) {
        toast.error("Keine Verbindung zum Server");
      } else {
        toast.error("Ein Fehler ist aufgetreten");
      }
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Buchung löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Bist du sicher, dass du diese Buchung löschen möchtest? Diese Aktion
            kann nicht rückgängig gemacht werden. Alle zugehörigen Daten gehen
            verloren.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={onDelete}
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
