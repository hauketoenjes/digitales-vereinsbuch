import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { pocketbaseUrl } from "./constants";

/**
 * Always returns a new instance of PocketBase for server side usage.
 *
 * @returns PocketBase instance for server-side usage
 */
export const getServerSidePocketbase = () => new PocketBase(pocketbaseUrl);

/**
 * Get the auth store from the cookie.
 *
 * @returns The auth store from the cookie or null if not found
 */
export const getAuthStore = async () => {
  const pb = getServerSidePocketbase();
  const cookie = (await cookies()).get("pb_auth");

  if (!cookie) {
    return null;
  }

  const encodedRequestCookie = `${encodeURIComponent(
    "pb_auth"
  )}=${encodeURIComponent(cookie.value)}`;
  pb.authStore.loadFromCookie(encodedRequestCookie);

  return pb.authStore;
};
