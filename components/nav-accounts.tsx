"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAccounts } from "@/hooks/use-accounts";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UpsertAccountDialog } from "./dialogs/upsert-account-dialog";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function NavAccounts() {
  const pathname = usePathname();
  const { data, isLoading } = useAccounts();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Konten</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          <>
            <SidebarMenuItem>
              <Skeleton className="w-full h-8 bg-neutral-200" />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Skeleton className="w-full h-8 bg-neutral-200" />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Skeleton className="w-full h-8 bg-neutral-200" />
            </SidebarMenuItem>
          </>
        ) : (
          (data ?? []).map((account) => (
            <SidebarMenuItem key={account.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(`/accounts/${account.id}`)}
              >
                <Link href={`/accounts/${account.id}`}>
                  <span>{account.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
        <UpsertAccountDialog id={null}>
          <SidebarMenuItem className="mt-4">
            <Button
              variant="default"
              className="w-full justify-start cursor-pointer"
            >
              <Plus />
              <span>Neues Konto anlegen</span>
            </Button>
          </SidebarMenuItem>
        </UpsertAccountDialog>
      </SidebarMenu>
    </SidebarGroup>
  );
}
