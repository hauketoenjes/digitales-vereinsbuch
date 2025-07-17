import { pb } from "./pocketbase-client";

/**
 * Login a user with email and password and store the auth data in a cookie.
 *
 * @param email The email of the user
 * @param password The password of the user
 */
export async function pocketbaseLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    await pb.collection("users").authWithPassword(email, password);
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
  } catch (e) {
    throw e;
  }
}

export async function pocketbaseRegister({
  name,
  email,
  password,
  passwordConfirm,
}: {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}) {
  try {
    await pb.collection("users").create({
      name,
      email,
      password,
      passwordConfirm,
    });
    await pb.collection("users").authWithPassword(email, password);
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
  } catch (e) {
    throw e;
  }
}
