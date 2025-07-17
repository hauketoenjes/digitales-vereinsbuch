"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/hooks/use-accounts";
import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = use(params);
  const { data, isLoading } = useAccount(accountId);

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {isLoading ? (
          <Skeleton className="w-32" />
        ) : data ? (
          data.name
        ) : (
          "Konto nicht gefunden"
        )}
      </h1>
      {isLoading ? (
        <Skeleton className="mt-4 h-8 w-48" />
      ) : (
        <p className="mt-2 text-gray-600 ">
          {data?.description || "Keine Beschreibung verfügbar"}
        </p>
      )}
    </div>
  );
}
