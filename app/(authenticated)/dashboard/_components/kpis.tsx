import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBookings } from "@/hooks/use-bookings";

export function Kpis() {
  const { data: allBookings } = useBookings(null);

  const totalAmount = allBookings?.reduce(
    (sum, booking) => sum + (booking.amount || 0),
    0
  );
  const expensesThisMonth = allBookings
    ?.filter(
      (booking) =>
        new Date(booking.date).getMonth() === new Date().getMonth() &&
        new Date(booking.date).getFullYear() === new Date().getFullYear() &&
        booking.amount < 0
    )
    .reduce((sum, booking) => sum + (booking.amount || 0), 0);
  const incomeThisMonth = allBookings
    ?.filter(
      (booking) =>
        new Date(booking.date).getMonth() === new Date().getMonth() &&
        new Date(booking.date).getFullYear() === new Date().getFullYear() &&
        booking.amount >= 0
    )
    .reduce((sum, booking) => sum + (booking.amount || 0), 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardDescription>Gesamtsaldo</CardDescription>
          <CardTitle className={"text-2xl font-semibold tabular-nums"}>
            {totalAmount?.toLocaleString(undefined, {
              style: "currency",
              currency: "EUR",
            })}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Ausgaben diesen Monat</CardDescription>
          <CardTitle className={"text-2xl font-semibold tabular-nums"}>
            {expensesThisMonth?.toLocaleString(undefined, {
              style: "currency",
              currency: "EUR",
            })}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Einnahmen diesen Monat</CardDescription>
          <CardTitle className={"text-2xl font-semibold tabular-nums"}>
            {incomeThisMonth?.toLocaleString(undefined, {
              style: "currency",
              currency: "EUR",
            })}
          </CardTitle>
        </CardHeader>
      </Card>
    </>
  );
}
