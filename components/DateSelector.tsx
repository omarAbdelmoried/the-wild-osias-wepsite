"use client";

import { differenceInDays, isBefore, startOfToday, format } from "date-fns";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { useReservation } from "@/features/reservation/context/ReservationContex";
import { calculateRemainingCapacity } from "@/features/reservation/services/reservation.data.services";

import type { BookingCapacity } from "@/features/reservation/types/booking";
import type { Cabin } from "@/features/cabin/types/cabin";
import type { AppSettings } from "@/shared/types/settings";

type DateSelectorProps = {
  cabinBookingsWithGuests: BookingCapacity[];
  settings: AppSettings;
  cabin: Cabin;
  currentGuestId: number;
};

type DateCapacityStatus = {
  remaining: number;
  isBookedByMe: boolean;
  isFullyBooked: boolean;
  isPartiallyBooked: boolean;
};

function DateSelector({
  cabinBookingsWithGuests,
  settings,
  cabin,
  currentGuestId,
}: DateSelectorProps) {
  const { range, setRange, resetRange } = useReservation();

  const { regularPrice, discount, maxCapacity } = cabin;
  const { minBookingLength, maxBookingLength } = settings;

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setRange({
      from: selectedRange?.from,
      to: selectedRange?.to,
    });
  };

  const displayRange = range;

  const numNights =
    displayRange?.from && displayRange?.to
      ? Math.max(differenceInDays(displayRange.to, displayRange.from), 1)
      : 0;

  const currentPrice = regularPrice - discount;
  const cabinPrice = currentPrice * numNights;

  const availabilityCache = new Map<string, DateCapacityStatus>();

  const getDateCapacityStatus = (date: Date): DateCapacityStatus => {
    const key = format(date, "yyyy-MM-dd");

    const cached = availabilityCache.get(key);

    if (cached) return cached;

    const remaining = calculateRemainingCapacity(
      maxCapacity,
      cabinBookingsWithGuests,
      date,
    );

    const isBookedByMe = cabinBookingsWithGuests.some(
      (booking) =>
        booking.guestId === currentGuestId &&
        key >= (booking.startDate ?? "").slice(0, 10) &&
        key < (booking.endDate ?? "").slice(0, 10),
    );

    const status: DateCapacityStatus = {
      remaining,
      isBookedByMe,
      isFullyBooked: remaining === 0,
      isPartiallyBooked: remaining > 0 && remaining < maxCapacity,
    };

    availabilityCache.set(key, status);

    return status;
  };

  return (
    <div className="flex flex-col justify-between">
      <p className="pt-4 pr-4 text-right text-2xl font-semibold capitalize text-accent-500">
        Select dates
      </p>

      <DayPicker
        className="flex place-self-center pt-4"
        mode="range"
        min={minBookingLength}
        max={maxBookingLength}
        onSelect={handleSelect}
        selected={displayRange}
        month={new Date()}
        endMonth={new Date(new Date().getFullYear() + 5, 11, 31)}
        animate
        captionLayout="dropdown"
        hideNavigation
        numberOfMonths={2}
        disabled={(curDate) => {
          if (isBefore(curDate, startOfToday())) {
            return true;
          }

          const status = getDateCapacityStatus(curDate);

          if (status.isBookedByMe) {
            return true;
          }

          return status.isFullyBooked;
        }}
        classNames={{
          day: "rounded-full transition-colors hover:text-accent-500",

          today: "",

          chevron: "fill-accent-400",

          months: "flex flex-wrap justify-center gap-4",

          month: "flex-1",

          month_grid: "w-[100%] mb-2",

          range_start:
            "bg-blue rounded-full hover:text-accent-200 transition-colors",

          range_end:
            "bg-blue rounded-full hover:text-accent-200 transition-colors",

          range_middle:
            "bg-blue rounded-full hover:text-accent-200 transition-colors",

          day_disabled: "cursor-not-allowed opacity-50",

          day_button:
            "flex h-[40px] w-[40px] items-center justify-center rounded-full",
        }}
        modifiers={{
          bookedByMe: (date) => getDateCapacityStatus(date).isBookedByMe,

          fullyBooked: (date) => {
            const status = getDateCapacityStatus(date);

            return status.isFullyBooked && !status.isBookedByMe;
          },

          partiallyBooked: (date) => {
            const status = getDateCapacityStatus(date);

            return status.isPartiallyBooked && !status.isBookedByMe;
          },
        }}
        modifiersClassNames={{
          bookedByMe: "bg-violet-600 text-white font-semibold",

          fullyBooked: "bg-red-600 text-white font-semibold",

          partiallyBooked: "bg-yellow-500 text-primary-900 font-semibold",
        }}
        modifiersStyles={{
          bookedByMe: {
            backgroundColor: "#7c3aed",
            color: "white",
            cursor: "not-allowed",
          },

          fullyBooked: {
            backgroundColor: "#dc2626",
            color: "white",
            cursor: "not-allowed",
            opacity: 0.6,
          },

          partiallyBooked: {
            backgroundColor: "#eab308",
            color: "#1a1a1a",
            fontWeight: "600",
          },
        }}
      />

      <div className="flex items-center justify-between px-8 bg-accent-500 text-primary-800 h-[72px]">
        <div className="flex items-baseline gap-6">
          <p className="flex items-baseline gap-2">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${currentPrice}</span>

                <span className="font-semibold text-primary-700 line-through">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}

            <span>/night</span>
          </p>

          {numNights ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>

              <p>
                <span className="text-lg font-bold uppercase">Total</span>{" "}
                <span className="text-2xl font-semibold">${cabinPrice}</span>
              </p>
            </>
          ) : null}
        </div>

        {range?.from || range?.to ? (
          <button
            type="button"
            onClick={resetRange}
            className="border border-primary-800 px-4 py-2 text-sm font-semibold transition-colors hover:bg-primary-800 hover:text-accent-500"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
