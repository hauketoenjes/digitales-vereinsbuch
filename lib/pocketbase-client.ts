import PocketBase from "pocketbase";
import { pocketbaseUrl } from "./constants";

export const pb = new PocketBase(pocketbaseUrl);

if (typeof document !== "undefined")
  pb.authStore.loadFromCookie(document?.cookie ?? "");
