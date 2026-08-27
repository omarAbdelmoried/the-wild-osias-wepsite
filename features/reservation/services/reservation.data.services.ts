import supabase from "@/shared/api/supabase";
import { eachDayOfInterval, addDays, format } from "date-fns";
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
        start: dateKeyToDate(booking.startDate),
        end: addDays(dateKeyToDate(booking.endDate), -1),
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

  const selectedDateKey = toDateKey(selectedDate);

  const bookedGuestsForDate = bookings.reduce((total, booking) => {
    const bookingStartKey = toDateKey(booking.startDate);
    const bookingEndKey = toDateKey(booking.endDate);

    if (selectedDateKey >= bookingStartKey && selectedDateKey < bookingEndKey) {
      return total + (booking.numGuests ?? 0);
    }
    return total;
  }, 0);

  return Math.max(0, cabinMaxCapacity - bookedGuestsForDate);
}

function toDateKey(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return format(value, "yyyy-MM-dd");
}

function dateKeyToDate(value: string | Date | null | undefined): Date {
  const [year, month, day] = toDateKey(value).split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function calculateRemainingCapacityForRange(
  cabinMaxCapacity: number,
  bookings: BookingCapacity[],
  startDate: string | Date,
  endDate: string | Date,
): number {
  if (!startDate || !endDate) return cabinMaxCapacity;

  const daysInRange = eachDayOfInterval({
    start: dateKeyToDate(startDate),
    end: addDays(dateKeyToDate(endDate), -1),
  });

  if (daysInRange.length === 0) return cabinMaxCapacity;

  const capacitiesPerDay = daysInRange.map((date) =>
    calculateRemainingCapacity(cabinMaxCapacity, bookings, date),
  );

  return Math.min(...capacitiesPerDay);
}
