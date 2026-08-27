"use server";
import DateSelector from "@/components/DateSelector";
import ReservationForm from "./ReservationForm";
import LoginMessage from "@/components/LoginMessage";
import SignInButton from "@/components/SignInButton";
import {
  getBookedDatesByGuestId,
  getCabinBookingsWithGuestCount,
} from "../services/reservation.data.services";
import { getSettings } from "@/shared/api/settings";
import { auth } from "@/features/authontaction/services/auth";

async function Reservation({ cabin }) {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center h-full ">
        <p className="text-lg text-primary-200 my-4">
          Please log in to make a reservation.
        </p>
        <SignInButton />
      </div>
    );
  }

  const [cabinBookingsWithGuests, guestsBookings, settings] = await Promise.all(
    [
      getCabinBookingsWithGuestCount(cabin.id),
      getBookedDatesByGuestId(Number(session.user.id)),
      getSettings(),
    ],
  );

  return (
    <div className="grid max-md:grid-cols-1 max-md:gap-4 grid-cols-2 border border-primary-800 min-h-[400px] p-3  mt-10 ">
      <DateSelector
        cabin={cabin}
        settings={settings}
        cabinBookingsWithGuests={cabinBookingsWithGuests}
        guestsBookings={guestsBookings}
      />
      {session?.user?.name ? (
        <ReservationForm
          cabin={cabin}
          user={session?.user}
          cabinBookingsWithGuests={cabinBookingsWithGuests}
        />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}

export default Reservation;
