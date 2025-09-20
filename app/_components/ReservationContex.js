"use client";
import { createContext, useContext, useState } from "react";

const reservationContext = createContext();

const initialState = {
  from: undefined,
  to: undefined,
};
function ReservationProvider({ children }) {
  const [range, setRange] = useState(initialState);
  const resetRange = () => setRange(initialState);
  return (
    <reservationContext.Provider value={{ range, setRange, resetRange }}>
      {children}
    </reservationContext.Provider>
  );
}

function useReservation() {
  const date = useContext(reservationContext);

  if (date === undefined)
    throw new Error("useReservation must be used within a ReservationProvider");

  return date;
}

export { ReservationProvider, useReservation };
