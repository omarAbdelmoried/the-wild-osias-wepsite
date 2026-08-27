"use client";
import { differenceInDays } from "date-fns";
// import { handelCreateReservation } from "@/app/_lips/actions";
import { useReservation } from "@/features/reservation/context/ReservationContex";
import { useFormStatus } from "react-dom";
import SpinnerMini from "@/components/SpinnerMini";
// import { calculateRemainingCapacityForRange } from "@/app/_lips/data-service";
import { useMemo } from "react";
import { calculateRemainingCapacityForRange } from "../services/reservation.data.services";
import { handelCreateReservation } from "../services/reservation.actions";
import Image from "next/image";

function ReservationForm({ cabin, user, cabinBookingsWithGuests }) {
  const { id: cabinId, maxCapacity, regularPrice: cabinPrice } = cabin;
  const { range, resetRange } = useReservation();
  const { pending: isPending } = useFormStatus();

  const startDate = range?.from;
  const endDate = range?.to;
  const numNights = differenceInDays(endDate, startDate);

  // Calculate remaining capacity for the selected date range
  const remainingCapacity = useMemo(() => {
    if (!startDate || !endDate) return maxCapacity;
    return calculateRemainingCapacityForRange(
      maxCapacity,
      cabinBookingsWithGuests,
      startDate,
      endDate,
    );
  }, [startDate, endDate, maxCapacity, cabinBookingsWithGuests]);

  const bookedDate = {
    startDate,
    endDate,
    numNights,
    cabinPrice,
    cabinId,
    maxCapacity,
    remainingCapacity,
  };

  const handelCreateReservationWithDate = handelCreateReservation.bind(
    null,
    bookedDate,
  );

  return (
    <div className="scale-[1.01] flex flex-col">
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex justify-between items-center">
        <p>Logged in as</p>

        <div className="flex gap-4 items-center">
          <Image
            width={40}
            height={40}
            // Important to display google profile images
            referrerPolicy="no-referrer"
            className="h-8 rounded-full"
            src={user.image}
            alt={user.name}
          />
          <p>{user.name}</p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          const form = event.currentTarget;
          const numGuests = Number(new FormData(form).get("numGuests"));
          const guestField = form.elements.namedItem("numGuests");

          if (!(guestField instanceof HTMLSelectElement)) return;

          guestField.setCustomValidity("");
          if (!startDate || !endDate) {
            event.preventDefault();
            guestField.setCustomValidity(
              "Select check-in and check-out dates.",
            );
          } else if (endDate <= startDate) {
            event.preventDefault();
            guestField.setCustomValidity(
              "The check-out date must be after the check-in date.",
            );
          } else if (numGuests > remainingCapacity) {
            event.preventDefault();
            guestField.setCustomValidity(
              `Only ${remainingCapacity} ${
                remainingCapacity === 1 ? "guest" : "guests"
              } available for these dates.`,
            );
          }

          if (guestField.validationMessage) guestField.reportValidity();
        }}
        action={(formData) => {
          handelCreateReservationWithDate(formData);

          resetRange();
        }}
        className="bg-primary-900 py-10 px-16 text-lg flex gap-5 flex-col flex-1"
      >
        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: remainingCapacity }, (_, i) => i + 1).map(
              (x) => (
                <option value={x} key={x}>
                  {x} {x === 1 ? "guest" : "guests"}
                </option>
              ),
            )}
          </select>
          {remainingCapacity < maxCapacity && remainingCapacity > 0 && (
            <p className="text-sm text-primary-400">
              {remainingCapacity} of {maxCapacity} guests available for selected
              dates
            </p>
          )}
          {remainingCapacity === 0 && (
            <p className="text-sm text-red-400">
              No capacity available for selected dates
            </p>
          )}
        </div>

        <div className="space-y-2 flex items-center gap-4 ">
          <input
            type="checkbox"
            name="hasBreakfast"
            id="hasBreakfast"
            className="px-7 py-3 bg-primary-200 text-primary-800 w-6 h-6 shadow-sm rounded-sm"
          />
          <label htmlFor="hasBreakfast">Will you need breakfast?</label>
        </div>

        <div className="space-y-2 ">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            placeholder="Any pets, allergies, special requirements, etc.?"
          />
        </div>

        <div className="flex justify-end items-center gap-6">
          {!(startDate && endDate) ? (
            <p className="text-primary-300 text-base">
              Start by selecting dates
            </p>
          ) : remainingCapacity === 0 ? (
            <p className="text-red-400 text-base font-semibold">
              No availability for selected dates
            </p>
          ) : (
            <button
              disabled={!range?.from || !range?.to || remainingCapacity === 0}
              className="bg-accent-500 px-8 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
            >
              {isPending ? (
                <span className="mx-auto">
                  <SpinnerMini />
                </span>
              ) : (
                "Reserve now"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;
