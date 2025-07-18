import { Booking } from "@/lib/models";
import { pb } from "@/lib/pocketbase-client";
import { useQuery } from "@tanstack/react-query";

export const useBookingsKey = ["bookings"] as const;

// Hook to fetch the full list of bookings from the PocketBase collection
export function useBookings(accountId: string) {
  return useQuery({
    queryKey: [useBookingsKey, accountId],
    queryFn: async () =>
      pb
        .collection<Booking>("bookings")
        .getFullList({ filter: `accountId="${accountId}"` }),
  });
}
