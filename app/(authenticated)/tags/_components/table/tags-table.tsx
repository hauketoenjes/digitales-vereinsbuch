import { DataTable } from "@/components/data-table/data-table";
import { useTags } from "@/hooks/use-tags";
import { useTagsColumns } from "./columns";

export function TagsTable() {
  const { data: tagsData } = useTags();
  const columns = useTagsColumns();

  return <DataTable columns={columns} data={tagsData || []} />;
}
