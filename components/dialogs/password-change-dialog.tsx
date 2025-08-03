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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/hooks/use-auth-store";
import { pb } from "@/lib/pocketbase-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
  .object({
    oldPassword: z.string(),
    password: z.string().min(8, {
      message: "Das Passwort muss mindestens 8 Zeichen lang sein",
    }),
    passwordConfirm: z.string().min(8, {
      message: "Das Passwort muss mindestens 8 Zeichen lang sein",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });

export function PasswordChangeDialog({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const { record } = useAuthStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { isSubmitting, isDirty, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (record == null) return;

    try {
      await pb.collection("users").update(record.id, {
        oldPassword: values.oldPassword,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
      });
      toast.success("Passwort aktualisiert. Bitte logge dich erneut ein.");
      form.reset();
      setOpen(false);
      router.push("/login");
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
              <DialogTitle>Passwort ändern</DialogTitle>
              <DialogDescription>
                Um dein Passwort zu ändern, gib dein altes und neues Passwort
                ein. Das Passwort muss mindestens 8 Zeichen lang sein.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altes Passwort</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        autoComplete="current-password"
                        autoFocus
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neues Passwort</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        autoComplete="new-password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neues Passwort bestätigen</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={isSubmitting || !isDirty || !isValid}
                type="submit"
              >
                Speichern & Ausloggen
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
