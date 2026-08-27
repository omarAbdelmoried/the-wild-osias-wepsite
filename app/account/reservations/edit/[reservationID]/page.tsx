import { ReservationEdit } from "@/features/reservation/components/ReservationEdit";

async function Page({ params }) {
  const reservationID = Number(params.reservationID);

  return <ReservationEdit reservationID={reservationID} />;
}
export default Page;
