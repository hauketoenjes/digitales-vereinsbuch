import { useDeleteAccountMutation } from "@/hooks/use-accounts";
import { useRouter } from "next/navigation";
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

export function DeleteAccountDialog({
  id,
  children,
}: PropsWithChildren<{
  id: string | null;
}>) {
  const [open, setOpen] = useState(false);
  const deleteAccount = useDeleteAccountMutation();
  const router = useRouter();

  async function onDelete() {
    if (!id) return;

    try {
      await deleteAccount.mutateAsync(id);
      toast.success("Konto erfolgreich gelöscht");
      // Optionally, redirect to the dashboard or another page
      router.push("/dashboard");
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
          <AlertDialogTitle>Konto löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Bist du sicher, dass du dieses Konto löschen möchtest? Diese Aktion
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
