import { auth } from "../_lips/auth";
import {
  getBookedDatesByCabinId,
  getBookedDatesByGuestId,
  getSettings,
} from "../_lips/data-service";
import DateSelector from "./DateSelector";
import ReservationForm from "./ReservationForm";
import LoginMessage from "./LoginMessage";
import SignInButton from "./SignInButton";

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

  const [cabinBookings, guestsBookings, settings] = await Promise.all([
    getBookedDatesByCabinId(cabin.id),
    getBookedDatesByGuestId(session.user.id),
    getSettings(),
  ]);

  return (
    <div className="grid max-md:grid-cols-1 max-md:gap-4 grid-cols-2 border border-primary-800 min-h-[400px] p-3  mt-10 ">
      <DateSelector
        cabin={cabin}
        settings={settings}
        cabinBookings={cabinBookings}
        guestsBookings={guestsBookings}
      />
      {session?.user?.name ? (
        <ReservationForm cabin={cabin} user={session?.user} />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}

export default Reservation;
