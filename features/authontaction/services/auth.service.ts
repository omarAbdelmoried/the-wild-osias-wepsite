"use server";

import { signIn, signOut } from "./auth";

export async function login() {
  return await signIn("google", { redirectTo: "/cabins" });
}

export async function logout() {
  return await signOut({ redirectTo: "/" });
}
