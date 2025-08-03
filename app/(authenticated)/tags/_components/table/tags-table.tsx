import { DataTable } from "@/components/data-table/data-table";
import { UpsertTagDialog } from "@/components/dialogs/upsert-tag-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTags } from "@/hooks/use-tags";
import { useMemo, useState } from "react";
import { useTagsColumns } from "./columns";

export function TagsTable() {
  const { data: tagsData } = useTags();
  const [searchTerm, setSearchTerm] = useState("");
  const columns = useTagsColumns();

  const filteredData = useMemo(() => {
    return tagsData?.filter((tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tagsData, searchTerm]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between ">
        <Input
          placeholder="Suche Tags..."
          className="w-64 mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center space-x-2">
          <UpsertTagDialog id={null}>
            <Button className="mb-4">Tag erstellen</Button>
          </UpsertTagDialog>
        </div>
      </div>
      <DataTable columns={columns} data={filteredData || []} />
    </div>
  );
}
