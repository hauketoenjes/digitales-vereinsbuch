import { getAuthStore } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";

export default async function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthStore();

  if (auth !== null) {
    redirect("/dashboard");
  }

  return children;
}
