"use server";

import { signIn, signOut } from "./auth";

export async function login(formData: FormData) {
  const requestedPath = String(formData.get("callbackUrl") || "/cabins");
  const redirectTo = requestedPath.startsWith("/") && !requestedPath.startsWith("//")
    ? requestedPath
    : "/cabins";
  return await signIn("google", { redirectTo });
}

export async function logout() {
  return await signOut({ redirectTo: "/" });
}
