import { getBookedDatesByCabinId, getCabin } from "@/app/_lips/data-service";

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
