import useAuthStore from "@/hooks/use-auth-store";
import { useTag, useTagMutation } from "@/hooks/use-tags";
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

export function UpsertTagDialog({
  id,
  children,
}: PropsWithChildren<{
  id: string | null;
}>) {
  const formSchema = z.object({
    name: z.string().min(1, "Name ist erforderlich"),
  });
  const [open, setOpen] = useState<boolean>(false);

  const { data } = useTag(id);
  const { record: authRecord } = useAuthStore();

  const createTag = useTagMutation("create");
  const updateTag = useTagMutation("update");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: data?.name ?? "",
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (id) {
        await updateTag.mutateAsync({
          id,
          name: values.name,
        });
      } else {
        await createTag.mutateAsync({
          name: values.name,
          ownerId: authRecord?.id ?? "",
        });
      }

      toast.success("Tag erfolgreich gespeichert");
      form.reset();
      setOpen?.(false);
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
        console.log("Dialog open state changed:", value);
        if (!value) {
          form.reset();
        }
        setOpen?.(value);
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
                {id ? "Tag bearbeiten" : "Tag erstellen"}
              </DialogTitle>
              <DialogDescription>
                {id
                  ? "Bearbeite die Tagdetails und speichere die Änderungen."
                  : "Gib die Tagdetails ein, um ein neues Tag zu erstellen."}
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
