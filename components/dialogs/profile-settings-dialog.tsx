"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/hooks/use-auth-store";
import { pb } from "@/lib/pocketbase-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import nameInitials from "name-initials";
import { PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

export function ProfileSettingsDialog({ children }: PropsWithChildren) {
  const formSchema = z.object({
    avatar: z.instanceof(File).nullable().optional(),
    name: z.string(),
  });

  const [open, setOpen] = useState(false);
  const { record } = useAuthStore();
  const name = record?.name ?? undefined;
  const avatar =
    record?.avatar != null ? pb.files.getURL(record, record.avatar) : undefined;
  const initials = name === undefined ? "-" : nameInitials(name);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      avatar: undefined,
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (record == null) return;

    try {
      const updatedRecord = await pb
        .collection("users")
        .update(record.id, values);
      await pb.collection("users").authRefresh();
      document.cookie = pb.authStore.exportToCookie({
        httpOnly: false,
      });
      toast.success("Account aktualisiert");
      form.reset({ name: updatedRecord.name, avatar: undefined });
      setOpen(false);
    } catch {
      toast.error("Ein Fehler ist aufgetreten");
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
              <DialogTitle>Accounteinstellungen</DialogTitle>
              <DialogDescription>
                Bearbeite hier deinen Account. Klicke auf Speichern, wenn du
                fertig bist.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Profilbild</FormLabel>
                    <div className="flex gap-4 items-center">
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage
                          src={
                            value === undefined
                              ? avatar
                              : value === null
                              ? undefined
                              : URL.createObjectURL(value)
                          }
                          alt={name}
                        />
                        <AvatarFallback className="rounded-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-grow"
                        onClick={(e) => {
                          e.preventDefault();
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/jpeg, image/png";
                          input.onchange = (event) => {
                            const files = (event.target as HTMLInputElement)
                              .files;
                            if (files == null) return;
                            onChange(files[0]);
                          };
                          input.click();
                        }}
                      >
                        Bild auswählen
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="min-w-9"
                        onClick={(e) => {
                          e.preventDefault();
                          onChange(null);
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        disabled={isSubmitting}
                        {...field}
                      />
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
