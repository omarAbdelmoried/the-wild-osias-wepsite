"use client";

import { useOptimistic } from "react";
import ReservationCard from "./ReservationCard";
import { handelDeleteReservation } from "@/app/_lips/actions";

 function ReservationList({ bookings }) {
  // CHANGE
  const [optimisticBookings, deleteBooking] = useOptimistic(
    bookings,
    (optimisticBookings, bookingId) => {
      return optimisticBookings.filter((booking) => booking.id !== bookingId);
    }
  );

  async function handleDelete(id) {
    deleteBooking(id);
    await handelDeleteReservation(id);
  }

  return (
    <ul className="space-y-6">
      {optimisticBookings.map((booking) => (
        <ReservationCard
          booking={booking}
          key={booking.id}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

export default ReservationList;
