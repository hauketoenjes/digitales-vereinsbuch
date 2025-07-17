import { useAccount, useAccountMutation } from "@/hooks/use-accounts";
import useAuthStore from "@/hooks/use-auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientResponseError } from "pocketbase";
import { PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export function UpsertAccountDialog({
  id,
  children,
}: PropsWithChildren<{ id: string | null }>) {
  const formSchema = z.object({
    name: z.string().min(1, "Name ist erforderlich"),
    description: z.string().optional(),
  });

  const [open, setOpen] = useState(false);

  const { data } = useAccount(id);
  const { record: authRecord } = useAuthStore();

  const createAccount = useAccountMutation("create");
  const updateAccount = useAccountMutation("update");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: data?.name ?? "",
      description: data?.description ?? "",
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (id) {
        await updateAccount.mutateAsync({
          id,
          name: values.name,
          description: values.description,
        });
      } else {
        await createAccount.mutateAsync({
          name: values.name,
          ownerId: authRecord?.id ?? "",
          description: values.description,
        });
      }

      toast.success("Konto erfolgreich gespeichert");
      form.reset();
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
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          form.reset();
        }
        setOpen(value);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            className="flex flex-col gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogHeader>
              <DialogTitle>
                {id ? "Konto bearbeiten" : "Konto erstellen"}
              </DialogTitle>
              <DialogDescription>
                {id
                  ? "Bearbeite die Kontodetails und speichere die Änderungen."
                  : "Gib die Kontodetails ein, um ein neues Konto zu erstellen."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button disabled={isSubmitting || !isDirty} type="submit">
                Speichern
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
