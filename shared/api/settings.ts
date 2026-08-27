import supabase from "./supabase";
import type { AppSettings } from "@/shared/types/settings";

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .single<AppSettings>();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data as AppSettings;
}
