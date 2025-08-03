"use client";

import {
  ChevronsUpDown,
  LockKeyhole,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Trash,
  UserPen,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useAuthStore from "@/hooks/use-auth-store";
import { pb } from "@/lib/pocketbase-client";
import nameInitials from "name-initials";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { DeleteProfileDialog } from "./dialogs/delete-profile-dialog";
import { PasswordChangeDialog } from "./dialogs/password-change-dialog";
import { ProfileSettingsDialog } from "./dialogs/profile-settings-dialog";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { record } = useAuthStore();
  const { setTheme } = useTheme();

  const avatar =
    record?.avatar != null ? pb.files.getURL(record, record.avatar) : undefined;
  const name = record?.name ?? "-";
  const email = record?.email ?? "-";
  const initials = nameInitials(name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <ProfileSettingsDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <UserPen />
                  Accounteinstellungen
                </DropdownMenuItem>
              </ProfileSettingsDialog>
              <PasswordChangeDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <LockKeyhole />
                  Passwort ändern
                </DropdownMenuItem>
              </PasswordChangeDialog>
              <DeleteProfileDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash />
                  Account löschen
                </DropdownMenuItem>
              </DeleteProfileDialog>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="dark:hidden" />
                <Moon className="hidden dark:block" />
                <span>Darstellung</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun />
                    <span>Hell</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon />
                    <span>Dunkel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem
              onClick={() => {
                pb.authStore.clear();
                document.cookie = pb.authStore.exportToCookie({
                  httpOnly: false,
                });
                router.push("/login");
              }}
            >
              <LogOut />
              Ausloggen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
