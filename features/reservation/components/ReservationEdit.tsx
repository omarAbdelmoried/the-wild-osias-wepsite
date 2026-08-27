import UpdateButton from "@/components/UpdateButton";
import { getCabin } from "@/features/cabin/services/cabin.services";
import { handelEditReservation } from "@/features/reservation/services/reservation.actions";
import { getBooking } from "@/features/reservation/services/reservation.data.services";
export async function ReservationEdit({
  reservationID,
}: {
  reservationID: number;
}) {
  const { cabinId } = await getBooking(reservationID);

  const { maxCapacity } = await getCabin(cabinId);

  const { numGuests, observations } = await getBooking(reservationID);

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Edit Reservation #{reservationID}
      </h2>

      <form
        action={handelEditReservation}
        className="bg-primary-900 py-8 px-4 sm:px-8 md:px-12 text-lg flex gap-6 flex-col"
      >
        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            defaultValue={numGuests}
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

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            defaultValue={observations}
            name="observations"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
          />
        </div>
        <input type="hidden" name="bookingId" value={reservationID} />

        <div className="flex justify-end items-center gap-6">
          <UpdateButton />
        </div>
      </form>
    </div>
  );
}
