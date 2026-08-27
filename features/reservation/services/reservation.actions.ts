"use server";

import { auth } from "@/features/authontaction/services/auth";
import { getCabin } from "@/features/cabin/services/cabin.services";
import supabase from "@/shared/api/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  calculateRemainingCapacityForRange,
  getBookings,
  getCabinBookingsWithGuestCount,
} from "@/features/reservation/services/reservation.data.services";
import { getSettings } from "@/shared/api/settings";

type ReservationRequest = {
  startDate: string | Date;
  endDate: string | Date;
  numNights: number;
  cabinPrice: number;
  cabinId: number;
  remainingCapacity?: number;
};

export async function handelDeleteReservation(bookingId: number) {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) throw new Error("You are not logged in");

  const userId = Number(session?.user?.id);
  if (!Number.isFinite(userId)) throw new Error("Invalid user session");

  const reservations = await getBookings(userId);
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

export async function handelCreateReservation(
  reservationData: ReservationRequest,
  formData: FormData,
) {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) throw new Error("You are not logged in");

  const userId = Number(session?.user?.id);
  if (!Number.isFinite(userId)) throw new Error("Invalid user session");

  const settings = await getSettings();

  const { breakfastPrice } = settings;
  const { startDate, endDate, numNights, cabinPrice, cabinId } =
    reservationData;

  const numGuests = Number(formData.get("numGuests"));
  const cabin = await getCabin(cabinId);
  const cabinMaxCapacity = cabin.maxCapacity ?? 0;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!Number.isInteger(numGuests) || numGuests < 1) {
    throw new Error("The number of guests must be at least one");
  }
  if (numGuests > cabinMaxCapacity) {
    throw new Error("This cabin cannot accommodate this number of guests.");
  }
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end
  ) {
    throw new Error("The check-out date must be after the check-in date.");
  }

  // Backend validation: Re-check remaining capacity to prevent race conditions
  // Multiple users could try to book simultaneously, so we must verify on the backend
  const cabinBookingsWithGuests = await getCabinBookingsWithGuestCount(cabinId);
  const actualRemainingCapacity = calculateRemainingCapacityForRange(
    cabinMaxCapacity,
    cabinBookingsWithGuests,
    startDate,
    endDate,
  );

  if (numGuests > actualRemainingCapacity) {
    throw new Error(
      `Only ${actualRemainingCapacity} ${
        actualRemainingCapacity === 1 ? "guest" : "guests"
      } available for the selected dates. Someone may have booked the remaining capacity.`,
    );
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
    guestId: userId,
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
      if (error.message.includes("exceed this cabin capacity")) {
        throw new Error(
          "The selected dates do not have enough capacity. Someone may have booked the remaining space.",
        );
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

export async function handelEditReservation(formData: FormData) {
  const { numGuests, observations, bookingId } = Object.fromEntries(formData);

  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) throw new Error("You are not logged in");

  const userId = Number(session?.user?.id);
  if (!Number.isFinite(userId)) throw new Error("Invalid user session");

  const reservations = await getBookings(userId);
  const ids = reservations.map((r) => r.id);
  const bookingIdNum = Number(bookingId);
  if (!ids.includes(bookingIdNum))
    throw new Error("You are not allowed to edit this reservation");

  const numGuestsNum = Number(numGuests);

  // Get the current booking to validate against remaining capacity
  // excluding this booking's current guest count
  const currentBooking = reservations.find((r) => r.id === bookingIdNum);
  if (!currentBooking) throw new Error("Booking not found");

  const cabinId = currentBooking.cabinId;
  if (cabinId === null || cabinId === undefined) {
    throw new Error("Booking is missing a cabin");
  }

  const cabin = await getCabin(cabinId);
  const cabinMaxCapacity = cabin.maxCapacity ?? 0;

  // Validate that numGuests doesn't exceed cabin max capacity
  if (numGuestsNum > cabinMaxCapacity) {
    throw new Error("This cabin cannot accommodate this number of guests.");
  }

  // Get all cabin bookings EXCEPT this one to check remaining capacity
  const allCabinBookings = await getCabinBookingsWithGuestCount(cabinId);
  const otherBookings = allCabinBookings.filter((b) => b.id !== bookingIdNum);

  // Calculate remaining capacity excluding this booking
  const remainingCapacityForEdit = calculateRemainingCapacityForRange(
    cabinMaxCapacity,
    otherBookings,
    currentBooking.startDate ?? new Date(0),
    currentBooking.endDate ?? new Date(0),
  );

  // Check if new guest count would exceed remaining capacity + current booking
  const currentGuestCount = currentBooking.numGuests ?? 0;
  const maxAllowedGuests = remainingCapacityForEdit + currentGuestCount;
  if (numGuestsNum > maxAllowedGuests) {
    throw new Error(
      `Only ${maxAllowedGuests} guests can be accommodated for these dates.`,
    );
  }

  const updatedFields = {
    numGuests: numGuestsNum,
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
  redirect("/account/reservations");
}
