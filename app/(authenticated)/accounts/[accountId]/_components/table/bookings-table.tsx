import { DataTable } from "@/components/data-table/data-table";
import { useBookings } from "@/hooks/use-bookings";
import { useBookingsColumns } from "./columns";

export function BookingsTable({ accountId }: { accountId: string }) {
  const { data: bookingsData } = useBookings(accountId);
  const columns = useBookingsColumns();

  return <DataTable columns={columns} data={bookingsData || []} />;
}
