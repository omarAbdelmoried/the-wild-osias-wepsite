"use client";
import { differenceInDays } from "date-fns";
import { handelCreateReservation } from "../_lips/actions";
import { useReservation } from "./ReservationContex";
import { useFormStatus } from "react-dom";
import SpinnerMini from "./SpinnerMini";

function ReservationForm({ cabin, user }) {
  // CHANGE
  const { id: cabinId, maxCapacity, regularPrice: cabinPrice } = cabin;
  const { range, resetRange } = useReservation();
  const { pending: isPending } = useFormStatus();

  const startDate = range?.from;
  const endDate = range?.to;
  const numNights = differenceInDays(endDate, startDate);

  const bookedDate = {
    startDate,
    endDate,
    numNights,
    cabinPrice,
    cabinId,
    maxCapacity,
  };

  const handelCreateReservationWithDate = handelCreateReservation.bind(
    null,
    bookedDate
  );

  return (
    <div className="scale-[1.01] flex flex-col">
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex justify-between items-center">
        <p>Logged in as</p>

        <div className="flex gap-4 items-center">
          <img
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
          const guestField = form.elements.numGuests;

          guestField.setCustomValidity("");
          if (!startDate || !endDate) {
            event.preventDefault();
            guestField.setCustomValidity("Select check-in and check-out dates.");
          } else if (endDate <= startDate) {
            event.preventDefault();
            guestField.setCustomValidity(
              "The check-out date must be after the check-in date."
            );
          } else if (numGuests > maxCapacity) {
            event.preventDefault();
            guestField.setCustomValidity(
              "This cabin cannot accommodate this number of guests."
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
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
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
          ) : (
            <button
              disabled={!range?.from || !range?.to}
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
