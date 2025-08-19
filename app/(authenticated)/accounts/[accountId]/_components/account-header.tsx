"use client";

import { DeleteAccountDialog } from "@/components/dialogs/delete-account-dialog";
import { DownloadPdfDialog } from "@/components/dialogs/download-pdf-dialog";
import { UpsertAccountDialog } from "@/components/dialogs/upsert-account-dialog";
import { UpsertBookingDialog } from "@/components/dialogs/upsert-booking-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/hooks/use-accounts";
import { useBookings } from "@/hooks/use-bookings";
import { cn } from "@/lib/utils";
import { Download, Pen, Trash } from "lucide-react";

export function AccountHeader({ accountId }: { accountId: string }) {
  const { data: accountData, isLoading: isLoadingAccount } =
    useAccount(accountId);
  const { data: bookingsData } = useBookings(accountId);

  const currentBalance = bookingsData?.reduce(
    (total, booking) => total + booking.amount,
    0
  );

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>
          {isLoadingAccount ? (
            <Skeleton className="w-32 h-4" />
          ) : (
            accountData?.name
          )}
        </CardTitle>
        <CardDescription>
          {isLoadingAccount ? (
            <Skeleton className="mt-2 h-4 w-48" />
          ) : (
            accountData?.description || "Keine Beschreibung verfügbar"
          )}
        </CardDescription>
        <CardAction className="flex items-center space-x-2">
          <UpsertAccountDialog id={accountId}>
            <Button variant="outline" size="icon">
              <Pen />
            </Button>
          </UpsertAccountDialog>
          <DeleteAccountDialog id={accountId}>
            <Button variant="outline" size="icon">
              <Trash />
            </Button>
          </DeleteAccountDialog>
          <DownloadPdfDialog accountId={accountId}>
            <Button variant="outline" size="icon">
              <Download />
            </Button>
          </DownloadPdfDialog>
          <UpsertBookingDialog id={null} accountId={accountId}>
            <Button>Neue Buchung</Button>
          </UpsertBookingDialog>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Kontostand</p>
        {isLoadingAccount ? (
          <Skeleton className="mt-2 h-8 w-32" />
        ) : (
          <p
            className={cn("text-xl font-semibold tabular-nums", {
              "text-red-600": (currentBalance ?? 0) < 0,
              "text-green-600": (currentBalance ?? 0) >= 0,
            })}
          >
            {(currentBalance !== undefined ? currentBalance : 0).toLocaleString(
              undefined,
              {
                style: "currency",
                currency: "EUR",
              }
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
