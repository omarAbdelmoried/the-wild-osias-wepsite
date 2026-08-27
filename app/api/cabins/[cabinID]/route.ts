import { getCabin } from "@/features/cabin/services/cabin.services";
import { getBookedDatesByCabinId } from "@/features/reservation/services/reservation.data.services";

export async function GET(req, { params }) {
  try {
    const { cabinID: id } = params;
    const [cabin, bookings] = await Promise.all([
      getCabin(id),
      getBookedDatesByCabinId(id),
    ]);
    return Response.json({ cabin, bookings });
  } catch {
    return Response.json({ message: "Cabin could not get loaded" });
  }
}
