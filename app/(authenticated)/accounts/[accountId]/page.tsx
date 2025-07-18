"use client";

import { useAccount } from "@/hooks/use-accounts";
import { useRouter } from "next/navigation";
import { use, useRef } from "react";
import { toast } from "sonner";
import { AccountHeader } from "./_components/account-header";

export default function Page({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = use(params);
  const { error } = useAccount(accountId);

  // If there is an error, navigate to the dashboard and show a toast
  const router = useRouter();
  const hasHandledErrorRef = useRef(false);

  if (error && !hasHandledErrorRef.current) {
    hasHandledErrorRef.current = true;
    router.push("/dashboard");
    //Optionally, you can show a toast notification here
    toast.error(
      "Das Konto konnte nicht geladen werden. Bitte versuche es später erneut."
    );
  }

  return <AccountHeader accountId={accountId} />;
}
