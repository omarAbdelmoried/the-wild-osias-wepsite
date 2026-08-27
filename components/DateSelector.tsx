"use client";
import { differenceInDays, isPast, isWithinInterval } from "date-fns";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useReservation } from "@/features/reservation/context/ReservationContex";
import { calculateRemainingCapacity } from "@/features/reservation/services/reservation.data.services";
import type { BookingCapacity } from "@/features/reservation/types/booking";
import type { Cabin } from "@/features/cabin/types/cabin";
import type { AppSettings } from "@/shared/types/settings";

type DateSelectorProps = {
  guestsBookings: readonly Date[];
  cabinBookingsWithGuests: BookingCapacity[];
  settings: AppSettings;
  cabin: Cabin;
};

function isAlreadyBooked(
  range: DateRange | undefined,
  datesArr: readonly Date[],
): boolean {
  if (!range?.from || !range?.to) return false;
  return datesArr.some((date) =>
    isWithinInterval(date, { start: range.from, end: range.to }),
  );
}

function DateSelector({
  guestsBookings,
  cabinBookingsWithGuests,
  settings,
  cabin,
}: DateSelectorProps) {
  const { range, setRange, resetRange } = useReservation();
  const handleSelect = (selectedRange: DateRange | undefined) => {
    setRange({
      from: selectedRange?.from,
      to: selectedRange?.to,
    });
  };
  const { regularPrice, discount, maxCapacity } = cabin;

  const displayRange: DateRange | undefined = isAlreadyBooked(
    range,
    guestsBookings,
  )
    ? undefined
    : range;
  const numNights =
    displayRange?.from && displayRange?.to
      ? Math.max(differenceInDays(displayRange.to, displayRange.from), 1)
      : 0;

  const cabinPrice = (regularPrice - discount) * numNights;

  // SETTINGS
  const { minBookingLength, maxBookingLength } = settings;

  // Helper function to determine the remaining capacity for a date
  const getDateCapacityStatus = (date: Date) => {
    const remaining = calculateRemainingCapacity(
      maxCapacity,
      cabinBookingsWithGuests,
      date,
    );
    return {
      remaining,
      isFullyBooked: remaining === 0,
      isPartiallyBooked: remaining > 0 && remaining < maxCapacity,
      isAvailable: remaining === maxCapacity,
    };
  };

  return (
    <div className="flex flex-col justify-between">
      <p className="text-2xl font-semibold pt-4 pr-4 text-accent-500 capitalize text-right">
        Select dates
      </p>
      <DayPicker
        className="flex pt-4 place-self-center"
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
          if (isPast(curDate)) return true;

          const capacityStatus = getDateCapacityStatus(curDate);
          // Only disable if fully booked
          return capacityStatus.isFullyBooked;
        }}
        classNames={{
          day: "rounded-full hover:text-accent-500 transition-colors",
          today: "",
          chevron: "fill-accent-400",
          months: "flex gap-4 flex-wrap justify-center",
          month: "flex-1",
          month_grid: "w-[100%] mb-2",
          range_start:
            "bg-blue rounded-full hover:text-accent-200 transition-colors",
          range_end:
            "bg-blue rounded-full hover:text-accent-200 transition-colors",
          range_middle:
            "bg-blue rounded-full hover:text-accent-200 transition-colors",
          day_disabled: "opacity-50 cursor-not-allowed",
        }}
        modifiers={{
          fullyBooked: (date) => getDateCapacityStatus(date).isFullyBooked,
          partiallyBooked: (date) =>
            getDateCapacityStatus(date).isPartiallyBooked,
        }}
        modifiersClassNames={{
          fullyBooked: "bg-red-600 text-white font-semibold",
          partiallyBooked: "bg-yellow-500 text-primary-900 font-semibold",
        }}
        modifiersStyles={{
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
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${regularPrice - discount}</span>
                <span className="line-through font-semibold text-primary-700">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span className="">/night</span>
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
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={() => resetRange()}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
