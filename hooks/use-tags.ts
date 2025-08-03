import { Tag } from "@/lib/models";
import { pb } from "@/lib/pocketbase-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTagsKey = ["tags"] as const;

// Hook to fetch the full list of tags from the PocketBase collection
export function useTags() {
  return useQuery({
    queryKey: [useTagsKey],
    queryFn: async () => pb.collection<Tag>("tags").getFullList(),
  });
}

export function useTag(id: string | null) {
  return useQuery({
    queryKey: [useTagsKey, id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      return pb.collection<Tag>("tags").getOne(id);
    },
    enabled: !!id, // Only run the query if id is not null
  });
}

export function useTagMutation(mode: "create" | "update") {
  const queryClient = useQueryClient();

  return useMutation<Tag, Error, Partial<Tag>>({
    mutationFn: async (data) => {
      if (mode === "create") {
        return pb.collection<Tag>("tags").create(data);
      } else if (mode === "update") {
        if (!data.id) throw new Error("ID is required for update");
        return pb.collection<Tag>("tags").update(data.id, data);
      }
      return Promise.reject(new Error("Invalid mode"));
    },
    onSuccess: () => {
      // Invalidate tags queries to refresh cached data
      queryClient.invalidateQueries({ queryKey: [useTagsKey] });
    },
  });
}

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) throw new Error("ID is required");
      return pb.collection<Tag>("tags").delete(id);
    },
    onSuccess: () => {
      // Invalidate tags queries to refresh cached data
      queryClient.invalidateQueries({ queryKey: [useTagsKey] });
    },
  });
}
