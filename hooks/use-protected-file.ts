// hooks/useFileToken.ts
import { pb } from "@/lib/pocketbase-client";
import { useQuery } from "@tanstack/react-query";
import { FileOptions, RecordModel } from "pocketbase";
import { useMemo } from "react";

const TOKEN_TTL_MS = 2 * 60 * 1000; // ca. 2 Min.

export function useFileToken() {
  return useQuery({
    queryKey: ["fileToken"],
    queryFn: () => pb.files.getToken(),
    // erneuere kurz bevor es abläuft
    staleTime: TOKEN_TTL_MS - 10_000,
    // im Hintergrund alle TOKEN_TTL_MS refreshen
    refetchInterval: TOKEN_TTL_MS - 20_000,
    refetchIntervalInBackground: true,
    retry: false,
  });
}

export function useProtectedUrl<T extends RecordModel>(
  record: T,
  fileField: (data: T) => string | null,
  options?: FileOptions
): string | null {
  const { data: token } = useFileToken();

  return useMemo(() => {
    const attachment = fileField(record);
    if (!attachment || !token) return null;

    return pb.files.getURL(record, attachment, { token, ...options });
  }, [fileField, record, token, options]);
}
