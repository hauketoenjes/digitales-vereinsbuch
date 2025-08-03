import { useDeleteTagMutation } from "@/hooks/use-tags";
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

export function DeleteTagDialog({
  id,
  children,
}: PropsWithChildren<{
  id: string | null;
}>) {
  const [open, setOpen] = useState(false);
  const deleteTag = useDeleteTagMutation();

  async function onDelete() {
    if (!id) return;

    try {
      await deleteTag.mutateAsync(id);
      toast.success("Tag erfolgreich gelöscht");
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
          <AlertDialogTitle>Tag löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Bist du sicher, dass du diesen Tag löschen möchtest? Diese Aktion
            kann nicht rückgängig gemacht werden. Alle zugehörigen Buchungen und
            Daten gehen verloren.
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
