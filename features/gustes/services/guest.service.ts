"use server";
import supabase from "@/shared/api/supabase";
import type {
  Guest,
  GuestInsert,
  GuestProfileUpdate,
} from "@/features/gustes/types/guest";
import { auth } from "@/features/authontaction/services/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileGuest(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.email) throw new Error("You are not logged in");

  const userId = Number(session?.user?.id);
  if (!Number.isFinite(userId)) throw new Error("Invalid user session");

  const nationalityValue = String(formData.get("nationality") ?? "");
  const [nationality, countryFlag] = nationalityValue.split("%");
  const nationalID = String(formData.get("nationalID") ?? "");
  if (!/^[A-Za-z0-9]{6,12}$/.test(nationalID))
    throw new Error("Invalid national ID");

  const updatedFields: GuestProfileUpdate = {
    nationality,
    countryFlag,
    nationalID,
  };

  const { error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", userId);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

export async function createGuest(newGuest: GuestInsert): Promise<Guest> {
  const { data, error } = await supabase
    .from("guests")
    .insert([newGuest])
    .select()
    .single<Guest>();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be created");
  }
  return data as Guest;
}

export async function getGuest(email: string): Promise<Guest | null> {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("email", email)
    .maybeSingle<Guest>();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be loaded");
  }

  return data ?? null;
}
