"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type ReservationContextType = {
  range: DateRange;
  setRange: React.Dispatch<React.SetStateAction<DateRange>>;
  resetRange: () => void;
};

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined,
);

const initialState: DateRange = {
  from: undefined,
  to: undefined,
};

function ReservationProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<DateRange>(initialState);
  const resetRange = () => setRange(initialState);

  return (
    <ReservationContext.Provider value={{ range, setRange, resetRange }}>
      {children}
    </ReservationContext.Provider>
  );
}

function useReservation() {
  const context = useContext(ReservationContext);

  if (context === undefined)
    throw new Error("useReservation must be used within a ReservationProvider");

  return context;
}

export { ReservationProvider, useReservation };
