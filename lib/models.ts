import { RecordModel } from "pocketbase";

/**
 * Represents an account in the system.
 */
export type Account = RecordModel & {
  name: string;
  description: string | null;
  ownerId: string;
  created: string;
  updated: string;
};

/**
 * Represents a booking belonging to an account.
 */
export type Booking = RecordModel & {
  date: string;
  amount: number;
  description: string | null;
  attachement: string | null;
  accountId: string;
  tagIds: string[];
  created: string;
  updated: string;
};

/**
 * Represents a tag that can be associated with bookings.
 */
export type Tag = RecordModel & {
  name: string;
  ownerId: string;
  created: string;
  updated: string;
};
