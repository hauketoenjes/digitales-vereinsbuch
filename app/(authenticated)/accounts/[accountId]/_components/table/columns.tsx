import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks/use-tags";
import { Booking } from "@/lib/models";
import { cn } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { AttachmentPreview } from "./attachment-preview";
import { RowActions } from "./row-actions";

const columnHelper = createColumnHelper<Booking>();

export function useBookingsColumns() {
  const { data: tagsData, isLoading: isLoadingTags } = useTags();

  return [
    columnHelper.accessor("amount", {
      header: (ctx) => (
        <DataTableColumnHeader column={ctx.column} title={"Betrag"} />
      ),
      cell: (info) => (
        <p
          className={cn("tabular-nums", {
            "text-red-600": info.getValue() < 0,
            "text-green-600": info.getValue() >= 0,
          })}
        >
          {info.getValue().toLocaleString(undefined, {
            style: "currency",
            currency: "EUR",
          })}
        </p>
      ),
    }),
    columnHelper.accessor("description", {
      header: (ctx) => (
        <DataTableColumnHeader column={ctx.column} title={"Beschreibung"} />
      ),
      cell: (info) => <p className="line-clamp-1">{info.getValue() || "-"}</p>,
    }),
    columnHelper.accessor("date", {
      header: (ctx) => (
        <DataTableColumnHeader column={ctx.column} title={"Datum"} />
      ),
      cell: (info) => (
        <div>
          <p>
            {new Date(info.getValue()).toLocaleDateString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(info.getValue()).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    }),

    columnHelper.accessor("tagIds", {
      enableSorting: false,
      enableHiding: false,
      header: (ctx) => (
        <DataTableColumnHeader column={ctx.column} title={"Tags"} />
      ),
      cell: (info) => {
        const tags = info.getValue();
        if (!tags || tags.length === 0) return null;

        return (
          <div className="flex flex-wrap gap-1 max-w-64">
            {tags.map((tagId) => {
              const tag = tagsData?.find((t) => t.id === tagId);
              return (
                <Badge key={tagId} variant="secondary">
                  {isLoadingTags ? "Lade..." : tag ? tag.name : "Unbekannt"}
                </Badge>
              );
            })}
          </div>
        );
      },
    }),
    columnHelper.accessor("attachment", {
      enableSorting: false,
      enableHiding: false,
      header: (ctx) => (
        <DataTableColumnHeader column={ctx.column} title={"Anhang"} />
      ),
      cell: (info) => <AttachmentPreview booking={info.row.original} />,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>Aktionen</span>,
      cell: (info) => <RowActions booking={info.row.original} />,
    }),
  ];
}
