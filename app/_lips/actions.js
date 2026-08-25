"use server";
import { auth, signIn, signOut } from "@/app/_lips/auth";
import { getBookings, getCabin, getSettings, updateGuest } from "./data-service";
import supabase from "./supabase";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

export async function login() {
  return await signIn("google", { redirectTo: "/cabins" });
}

export async function logout() {
  return await signOut({ redirectTo: "/" });
}

export async function updateProfileGuest(formData) {
  /**
 {
  id: 363,
  created_at: '2025-09-17T03:46:18.20546+00:00',
  fullName: 'Omar Abdulmorid',
  email: 'omarelmangermff@gmail.com',
  nationality: null,
  countryFlag: null,
  nationalID: null
} 
 */
  const session = await auth();
  if (!session.user.email) throw new Error("You are not logged in");

  const [nationality, countryFlag] = formData.get("nationality").split("%");
  const nationalID = formData.get("nationalID");
  if (!/^[A-Za-z0-9]{6,12}$/.test(nationalID))
    throw new Error("Invalid national ID");

  const updatedFields = {
    nationality,
    countryFlag,
    nationalID,
  };

  const { data, error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", session.user.id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");

  return data;
}

export async function handelDeleteReservation(bookingId) {
  const session = await auth();
  if (!session.user.email) throw new Error("You are not logged in");

  const reservations = await getBookings(session.user.id);
  const ids = reservations.map((r) => r.id);
  if (!ids.includes(bookingId))
    throw new Error("You are not allowed to delete this reservation");

  const { data, error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
  return data;
}

export async function handelCreateReservation(reservationData, formData) {
  const session = await auth();
  if (!session.user.email) throw new Error("You are not logged in");

  const settings = await getSettings();

  const { breakfastPrice } = settings;
  const { startDate, endDate, numNights, cabinPrice, cabinId } =
    reservationData;

  const numGuests = Number(formData.get("numGuests"));
  const cabin = await getCabin(cabinId);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!Number.isInteger(numGuests) || numGuests < 1) {
    throw new Error("The number of guests must be at least one");
  }
  if (numGuests > cabin.maxCapacity) {
    throw new Error("This cabin cannot accommodate this number of guests.");
  }
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end
  ) {
    throw new Error("The check-out date must be after the check-in date.");
  }

  const hasBreakfast = formData.get("hasBreakfast") === "on";
  const observations = formData.get("observations");

  const extrasPrice = hasBreakfast ? breakfastPrice * numNights : 0;
  const totalPrice = cabinPrice * numNights + extrasPrice;
  const status = "unconfirmed";
  const isPaid = false;

  const reservationDataFormatted = {
    startDate,
    endDate,
    numNights,
    numGuests,
    extrasPrice,
    totalPrice,
    status,
    hasBreakfast,
    isPaid,
    cabinPrice,
    cabinId,
    observations,
    guestId: session.user.id,
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert([reservationDataFormatted])
    // So that the newly created object gets returned!
    .select()
    .single();

  if (error) {
    console.error(error);
    if (error.code === "23P01") {
      throw new Error("This cabin is already booked for the selected dates.");
    }
    if (error.code === "P0001") {
      if (error.message.includes("cannot accommodate")) {
        throw new Error("This cabin cannot accommodate this number of guests.");
      }
      if (error.message.includes("check-out date")) {
        throw new Error("The check-out date must be after the check-in date.");
      }
      throw new Error(error.message);
    }
    if (error.code === "23503") {
      throw new Error("The selected cabin does not exist.");
    }
    throw new Error("Booking could not be created");
  }

  revalidatePath("/cabins/" + cabinId);
  revalidatePath("/account/reservations");
  redirect("/cabins/thankyou");
}

export async function handelEditReservation(formData) {
  const { numGuests, observations, bookingId } = Object.fromEntries(formData);

  console.log(numGuests, observations, bookingId);
  const session = await auth();
  if (!session.user.email) throw new Error("You are not logged in");

  const reservations = await getBookings(session.user.id);
  const ids = reservations.map((r) => r.id);
  if (!ids.includes(Number(bookingId)))
    throw new Error("You are not allowed to edit this reservation");

  const updatedFields = {
    numGuests,
    observations,
  };

  const { error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  revalidatePath("/account/reservations/edit/" + bookingId);
  revalidatePath("/account/reservations");
  redirect("/account/reservations", RedirectType.replace);
}
