import supabase from "@/shared/api/supabase";
import type {
  Cabin,
  CabinPrice,
  CabinSummary,
} from "@/features/cabin/types/cabin";
import { notFound } from "next/navigation";

export async function getCabin(id: number): Promise<Cabin> {
  const { data, error } = await supabase
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single<Cabin>();

  if (error) {
    console.error(error);
    notFound();
  }

  return data as Cabin;
}

export async function getCabinPrice(id: number): Promise<CabinPrice> {
  const { data, error } = await supabase
    .from("cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single<CabinPrice>();

  if (error) {
    console.error(error);
  }

  return data as CabinPrice;
}

export const getCabins = async function (): Promise<CabinSummary[]> {
  const { data, error } = await supabase
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");
  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return (data ?? []) as CabinSummary[];
};
