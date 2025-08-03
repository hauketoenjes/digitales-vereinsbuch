import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Tag } from "@/lib/models";
import { createColumnHelper } from "@tanstack/react-table";
import { RowActions } from "./row-actions";

const columnHelper = createColumnHelper<Tag>();

export function useTagsColumns() {
  return [
    columnHelper.accessor("name", {
      header: (ctx) => (
        <DataTableColumnHeader column={ctx.column} title={"Name"} />
      ),
      cell: (info) => <p className="line-clamp-1">{info.getValue() || "-"}</p>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>Aktionen</span>,
      cell: (info) => <RowActions tag={info.row.original} />,
    }),
  ];
}
