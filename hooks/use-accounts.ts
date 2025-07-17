// Hook functions for managing 'Account' data using React Query and PocketBase
import { Account } from "@/lib/models";
import { pb } from "@/lib/pocketbase-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query key used for caching and invalidating account-related queries
export const useAccountsKey = ["accounts"] as const;

// Hook to fetch the full list of accounts from the PocketBase collection
export function useAccounts() {
  return useQuery({
    queryKey: [useAccountsKey],
    queryFn: async () => pb.collection<Account>("accounts").getFullList(),
  });
}

// Hook to fetch a single account by ID
// Will only run if the ID is provided
export function useAccount(id: string | null) {
  return useQuery({
    queryKey: [useAccountsKey, id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      return pb.collection<Account>("accounts").getOne(id);
    },
    enabled: !!id, // Only run the query if id is not null
  });
}

// Hook to create or update an account
// Pass "create" or "update" as the mode
export function useAccountMutation(mode: "create" | "update") {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, Partial<Account>>({
    mutationFn: async (data) => {
      if (mode === "create") {
        return pb.collection<Account>("accounts").create(data);
      } else if (mode === "update") {
        if (!data.id) throw new Error("ID is required for update");
        return pb.collection<Account>("accounts").update(data.id, data);
      }
      return Promise.reject(new Error("Invalid mode"));
    },
    onSuccess: () => {
      // Invalidate account queries to refresh cached data
      queryClient.invalidateQueries({ queryKey: [useAccountsKey] });
    },
  });
}

// Hook to delete an account by ID
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) throw new Error("ID is required");
      return pb.collection<Account>("accounts").delete(id);
    },
    onSuccess: () => {
      // Invalidate account queries to refresh cached data
      queryClient.invalidateQueries({ queryKey: [useAccountsKey] });
    },
  });
}
