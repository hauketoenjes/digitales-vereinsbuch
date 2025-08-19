import { DataTable } from "@/components/data-table/data-table";
import { useBookings } from "@/hooks/use-bookings";
import { useTags } from "@/hooks/use-tags";
import { FilterFn } from "@tanstack/react-table";
import { useState } from "react";
import { useBookingsColumns } from "./columns";

export function BookingsTable({ accountId }: { accountId: string }) {
  const { data: bookingsData } = useBookings(accountId);
  const { data: tagsData } = useTags();
  const columns = useBookingsColumns();
  const [globalFilter, setGlobalFilter] = useState("");

  const globalFilterFn: FilterFn<any> = (row, _columnId, filterValue) => {
    const q = String(filterValue ?? "")
      .toLowerCase()
      .trim();
    if (!q) return true;
    const b = row.original ?? {};
    const parts: string[] = [];
    if (b.description) parts.push(String(b.description));
    if (b.amount !== undefined && b.amount !== null)
      parts.push(String(b.amount));
    if (b.date) {
      try {
        const d = new Date(b.date);
        parts.push(d.toLocaleDateString());
        parts.push(d.toLocaleTimeString());
      } catch {}
    }
    if (Array.isArray(b.tagIds) && tagsData) {
      for (const id of b.tagIds) {
        const tag = tagsData.find((t) => t.id === id);
        if (tag?.name) parts.push(tag.name);
      }
    }
    return parts.some((s) => s.toLowerCase().includes(q));
  };

  return (
    <div>
      <input
        type="text"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search..."
        className="mb-2 w-full max-w-sm rounded border px-2 py-1"
      />
      <DataTable
        columns={columns}
        data={bookingsData || []}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        globalFilterFn={globalFilterFn}
      />
    </div>
  );
}
