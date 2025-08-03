import useAuthStore from "@/hooks/use-auth-store";
import { pb } from "@/lib/pocketbase-client";
import { useRouter } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { PropsWithChildren, useMemo, useState } from "react";
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
import { Input } from "../ui/input";

export function DeleteProfileDialog({ children }: PropsWithChildren) {
  const { record } = useAuthStore();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const isConfirmed = useMemo(
    () => confirmationText === record?.name,
    [confirmationText, record?.name]
  );

  async function onDelete() {
    if (!record?.id) return;

    try {
      await pb.collection("users").delete(record!.id);
      pb.authStore.clear();
      document.cookie = pb.authStore.exportToCookie({
        httpOnly: false,
      });
      toast.success("Profil erfolgreich gelöscht");
      router.push("/login");
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
          <AlertDialogTitle>Profil löschen?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Bist du sicher, dass du dein Profil löschen möchtest? Diese Aktion
              kann nicht rückgängig gemacht werden. Alle zugehörigen Daten gehen
              verloren.
            </p>

            <div className="border-destructive border p-4 rounded">
              <p className="text-destructive mb-2">
                Gib &quot;{record?.name}&quot; ein, um zu bestätigen, dass du
                dein Profil löschen möchtest.
              </p>
              <Input
                type="text"
                className="text-black"
                placeholder={`Bestätige mit "${record?.name}"`}
                onChange={(e) => {
                  setConfirmationText(e.target.value);
                }}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={onDelete}
            disabled={!isConfirmed}
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
