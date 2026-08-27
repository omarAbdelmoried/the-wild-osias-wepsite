import supabase from "@/shared/api/supabase";
import { isWithinInterval, eachDayOfInterval, addDays } from "date-fns";
import type {
  Booking,
  BookingCapacity,
  BookingWithCabin,
} from "@/features/reservation/types/booking";

export async function getBookings(
  guestId: number,
): Promise<BookingWithCabin[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, totalPrice, guestId, cabinId, cabins(name, image)",
    )
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return (data ?? []) as BookingWithCabin[];
}

export async function getBooking(id: number): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single<Booking>();

  if (error) {
    console.error(error);
    throw new Error("Booking could not get loaded");
  }

  return data as Booking;
}

export async function getBookedDatesByCabinId(
  cabinId: number,
): Promise<Date[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cabinId", cabinId)
    .in("status", ["unconfirmed", "checked-in"]);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  const bookedDates = (data ?? [])
    .map((booking: Booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate ?? 0),
        end: addDays(new Date(booking.endDate ?? 0), -1),
      });
    })
    .flat();

  return bookedDates;
}

export async function getBookedDatesByGuestId(
  guestId: number,
): Promise<Date[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("guestId", guestId)
    .in("status", ["unconfirmed", "checked-in"]);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  const bookedDates = (data ?? [])
    .map((booking: Booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate ?? 0),
        end: addDays(new Date(booking.endDate ?? 0), -1),
      });
    })
    .flat();

  return bookedDates;
}

export async function getCabinBookingsWithGuestCount(
  cabinId: number,
): Promise<BookingCapacity[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, startDate, endDate, numGuests, guestId, status")
    .eq("cabinId", cabinId)
    .in("status", ["unconfirmed", "checked-in"]);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }

  return (data ?? []) as BookingCapacity[];
}

export function calculateRemainingCapacity(
  cabinMaxCapacity: number,
  bookings: BookingCapacity[],
  selectedDate: string | Date,
): number {
  if (!selectedDate) return cabinMaxCapacity;

  const selectedDateObj = new Date(selectedDate);

  const bookedGuestsForDate = bookings.reduce((total, booking) => {
    const bookingStart = new Date(booking.startDate ?? 0);
    const bookingEnd = new Date(booking.endDate ?? 0);
    const bookingEndExclusive = addDays(bookingEnd, -1);

    if (
      isWithinInterval(selectedDateObj, {
        start: bookingStart,
        end: bookingEndExclusive,
      })
    ) {
      return total + (booking.numGuests ?? 0);
    }
    return total;
  }, 0);

  return Math.max(0, cabinMaxCapacity - bookedGuestsForDate);
}

export function calculateRemainingCapacityForRange(
  cabinMaxCapacity: number,
  bookings: BookingCapacity[],
  startDate: string | Date,
  endDate: string | Date,
): number {
  if (!startDate || !endDate) return cabinMaxCapacity;

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const daysInRange = eachDayOfInterval({
    start: startDateObj,
    end: addDays(endDateObj, -1),
  });

  if (daysInRange.length === 0) return cabinMaxCapacity;

  const capacitiesPerDay = daysInRange.map((date) =>
    calculateRemainingCapacity(cabinMaxCapacity, bookings, date),
  );

  return Math.min(...capacitiesPerDay);
}
