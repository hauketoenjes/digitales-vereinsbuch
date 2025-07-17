import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a date string based on the user's locale setting.
 * @param isoDate - The ISO date string to format.
 * @returns The formatted date string in the user's locale style (e.g., "DD.MM.YYYY" for de-DE, "MM/DD/YYYY" for en-US).
 */
export function formatLocalizedDate(isoDate: string): string {
  // Split the ISO string into numeric [year, month, day]
  const [year, month, day] = isoDate.split("-").map(Number);

  // Construct a Date object (monthIndex is zero-based)
  const date = new Date(year, month - 1, day);

  // Define formatting options: 2-digit day, 2-digit month, numeric year
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  // Use default locale (undefined) to respect browser/user settings
  return new Intl.DateTimeFormat(undefined, options).format(date);
}
