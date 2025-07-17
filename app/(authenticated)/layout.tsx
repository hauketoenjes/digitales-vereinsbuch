import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAuthStore } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function AuthenticatedLayout({
  children,
}: PropsWithChildren) {
  const auth = await getAuthStore();

  if (auth === null) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
