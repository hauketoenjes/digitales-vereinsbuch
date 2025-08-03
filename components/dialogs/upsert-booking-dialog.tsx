import useAuthStore from "@/hooks/use-auth-store";
import { useBooking, useBookingMutation } from "@/hooks/use-bookings";
import { useTags } from "@/hooks/use-tags";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Trash } from "lucide-react";
import { ClientResponseError } from "pocketbase";
import { PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { MultiSelect } from "../multi-select-tags";
import { Button } from "../ui/button";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Textarea } from "../ui/textarea";

export function UpsertBookingDialog({
  id,
  accountId,
  children,
}: PropsWithChildren<{ id: string | null; accountId: string }>) {
  const formSchema = z.object({
    date: z.date(),
    amount: z.number(),
    description: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
    attachment: z.instanceof(File).nullable().optional(),
    // TODO: Add the rest
  });

  const [open, setOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { data } = useBooking(id);
  const { record: authRecord } = useAuthStore();
  const { data: tagData } = useTags();

  const createBooking = useBookingMutation("create");
  const updateBooking = useBookingMutation("update");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      date: data?.date ? new Date(data.date) : new Date(),
      amount: data?.amount ?? 0,
      description: data?.description ?? "",
      tagIds: data?.tagIds ?? [],
      attachment: data?.attachment
        ? new File([], data?.attachment ?? "")
        : undefined,
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (id) {
        await updateBooking.mutateAsync({
          id,
          description: values.description,
          amount: values.amount,
          date: values.date.toISOString(),
          tagIds: values.tagIds,
          attachment: values.attachment,
        });
      } else {
        await createBooking.mutateAsync({
          accountId,
          ownerId: authRecord?.id ?? "",
          description: values.description,
          amount: values.amount,
          date: values.date.toISOString(),
          tagIds: values.tagIds,
          attachment: values.attachment,
        });
      }

      toast.success("Buchung erfolgreich gespeichert");
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
                {id ? "Buchung bearbeiten" : "Buchung erstellen"}
              </DialogTitle>
              <DialogDescription>
                {id
                  ? "Gib die Buchungsdetails ein, um eine bestehende Buchung zu bearbeiten."
                  : "Gib die Buchungsdetails ein, um eine neue Buchung zu erstellen."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Betrag</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="decimal"
                          pattern="^-?[0-9]+([.,][0-9]{1,2})?$"
                          placeholder="0,00"
                          defaultValue={
                            field.value !== undefined
                              ? field.value.toLocaleString("de-DE", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : ""
                          }
                          onBlur={(e) => {
                            const raw = e.currentTarget.value.replace(",", ".");
                            const num = parseFloat(raw);
                            field.onChange(isNaN(num) ? 0 : num);
                          }}
                          disabled={isSubmitting}
                          className="w-full pr-10 border bg-background px-3 py-2"
                        />
                        <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          €
                        </span>
                      </div>
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
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Buchungsdatum</FormLabel>
                    <div className="flex gap-4">
                      <Popover
                        open={datePickerOpen}
                        onOpenChange={setDatePickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                field.value.toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })
                              ) : (
                                <span>Wähle ein Datum</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        disabled={isSubmitting}
                        type="time"
                        id="time-picker"
                        step="1"
                        value={field.value?.toLocaleTimeString(undefined, {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                        onChange={(e) => {
                          const [hours, minutes, seconds] = e.target.value
                            .split(":")
                            .map(Number);
                          const newDate = new Date(field.value || new Date());
                          newDate.setHours(hours, minutes, seconds);
                          field.onChange(newDate);
                        }}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attachment"
                render={({ field: { value } }) => (
                  <FormItem>
                    <FormLabel>Anhang</FormLabel>
                    <div className="flex gap-4 items-center">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-grow"
                        onClick={(e) => {
                          e.preventDefault();
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept =
                            "image/jpeg, image/png, image/webp, application/pdf";
                          input.onchange = (event) => {
                            const files = (event.target as HTMLInputElement)
                              .files;
                            if (files == null) return;
                            form.setValue("attachment", files[0], {
                              shouldDirty: true,
                            });
                          };
                          input.click();
                        }}
                      >
                        Anhang auswählen
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="min-w-9"
                        onClick={(e) => {
                          e.preventDefault();
                          form.setValue("attachment", null, {
                            shouldDirty: true,
                          });
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                    <div className="mt-2">
                      {value && (
                        <p className="text-sm text-muted-foreground">
                          {value.name}{" "}
                          {value.size > 0 &&
                            `(${(value.size / (1024 * 1024)).toFixed(2)} MB)`}
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tagIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={
                          tagData?.map((tag) => ({
                            label: tag.name,
                            value: tag.id,
                          })) ?? []
                        }
                        placeholder="Tags auswählen"
                        defaultValue={field.value}
                        onValueChange={field.onChange}
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
