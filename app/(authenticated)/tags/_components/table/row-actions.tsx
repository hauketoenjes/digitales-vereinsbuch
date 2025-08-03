import { DeleteTagDialog } from "@/components/dialogs/delete-tag-dialog";
import { UpsertTagDialog } from "@/components/dialogs/upsert-tag-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tag } from "@/lib/models";
import { MoreHorizontal, Pen, Trash } from "lucide-react";

export function RowActions({ tag }: { tag: Tag }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <UpsertTagDialog id={tag.id}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pen className="size-4" />
            <span>Tag bearbeiten</span>
          </DropdownMenuItem>
        </UpsertTagDialog>
        <DeleteTagDialog id={tag.id}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Trash className="size-4" />
            <span>Tag Löschen</span>
          </DropdownMenuItem>
        </DeleteTagDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
