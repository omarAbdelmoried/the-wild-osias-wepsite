"use client";
import {
  differenceInDays,
  isPast,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useReservation } from "./ReservationContex";

function isAlreadyBooked(range, datesArr) {
  if(!range?.from || !range?.to) return null
  return (
    range.from &&
    range.to &&
    datesArr.some((date) =>
      isWithinInterval(date, { start: range.from, end: range.to })
    )
  );
}

function DateSelector({ guestsBookings, cabinBookings, settings, cabin }) {
  // we have bug need to fix is when user select the same day appear error
  const { range, setRange, resetRange } = useReservation();

  const { regularPrice, discount } = cabin;

  const displayRange = isAlreadyBooked(range, [
    ...guestsBookings,
    ...cabinBookings,
  ])
    ? {}
    : range;
  const numNights =
    displayRange?.from && displayRange?.to
      ? Math.max(differenceInDays(displayRange.to, displayRange.from), 1)
      : 0;

  const cabinPrice = (regularPrice - discount) * numNights;

  // SETTINGS
  const { minBookingLength, maxBookingLength } = settings;

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
        onSelect={setRange}
        selected={displayRange}
        month={new Date()}
        date={new Date()}
        year={new Date().getFullYear() + 5}
        animate
        captionLayout="dropdown"
        hideNavigation
        numberOfMonths={2}
        disabled={(curData) =>
          isPast(curData) ||
          guestsBookings.some((booking) => isSameDay(booking, curData)) ||
          cabinBookings.some((booking) => isSameDay(booking, curData))
        }
        classNames={{
          day: "rounded-full  hover:text-accent-500 transition-colors ",
          today: "",
          chevron: "fill-accent-400",
          months: "flex gap-4 flex-wrap justify-center",
          month: "flex-1",
          month_grid: "w-[100%] mb-2",
          range_start:
            "bg-blue rounded-full  hover:text-accent-200 transition-colors ",
          range_end:
            "bg-blue rounded-full  hover:text-accent-200 transition-colors",

          range_middle:
            "bg-blue rounded-full  hover:text-accent-200 transition-colors",
          rdp_months: "grid grid-cols-2",
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
