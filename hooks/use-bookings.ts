import { Booking } from "@/lib/models";
import { pb } from "@/lib/pocketbase-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useBookingsKey = ["bookings"] as const;

// Hook to fetch the full list of bookings from the PocketBase collection
export function useBookings(accountId: string | null) {
  return useQuery({
    queryKey: [useBookingsKey, accountId],
    queryFn: async () => {
      const options: Record<string, string> = {};
      if (accountId) {
        options.filter = `accountId="${accountId}"`;
      }
      return pb.collection<Booking>("bookings").getFullList(options);
    },
  });
}

export function useBooking(id: string | null) {
  return useQuery({
    queryKey: [useBookingsKey, id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      return pb.collection<Booking>("bookings").getOne(id);
    },
    enabled: !!id, // Only run the query if id is not null
  });
}

// Hook to create or update a booking
export function useBookingMutation(mode: "create" | "update") {
  const queryClient = useQueryClient();

  return useMutation<
    Booking,
    Error,
    Partial<
      Omit<Booking, "attachment"> & { attachment: File | null | undefined }
    >
  >({
    mutationFn: async (data) => {
      if (mode === "create") {
        return pb.collection<Booking>("bookings").create(data);
      } else if (mode === "update") {
        if (!data.id) throw new Error("ID is required for update");
        return pb.collection<Booking>("bookings").update(data.id, data);
      }
      return Promise.reject(new Error("Invalid mode"));
    },
    onSuccess: () => {
      // Invalidate bookings queries to refresh cached data
      queryClient.invalidateQueries({ queryKey: [useBookingsKey] });
    },
  });
}

export function useDeleteBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) throw new Error("ID is required");
      return pb.collection<Booking>("bookings").delete(id);
    },
    onSuccess: () => {
      // Invalidate bookings queries to refresh cached data
      queryClient.invalidateQueries({ queryKey: [useBookingsKey] });
    },
  });
}
