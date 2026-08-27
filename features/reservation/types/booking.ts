export type BookingStatus = "unconfirmed" | "checked-in" | (string & {});

export type Booking = {
  id: number;
  created_at: string;
  startDate: string | null;
  endDate: string | null;
  numNights: number | null;
  numGuests: number | null;
  cabinPrice: number | null;
  extrasPrice: number | null;
  totalPrice: number | null;
  status: BookingStatus | null;
  hasBreakfast: boolean | null;
  isPaid: boolean | null;
  observations: string | null;
  cabinId: number | null;
  guestId: number | null;
};

export type BookingWithCabin = Pick<
  Booking,
  | "id"
  | "created_at"
  | "startDate"
  | "endDate"
  | "numNights"
  | "numGuests"
  | "totalPrice"
  | "guestId"
  | "cabinId"
> & {
  cabins?:
    | {
        name: string | null;
        image: string | null;
      }
    | Array<{
        name: string | null;
        image: string | null;
      }>
    | null;
};

export type BookingCapacity = Pick<
  Booking,
  "id" | "startDate" | "endDate" | "numGuests" | "guestId" | "status"
>;

export type CreateBookingInput = Omit<
  Booking,
  "id" | "created_at" | "status" | "isPaid" | "extrasPrice" | "totalPrice"
> & {
  extrasPrice: number;
  totalPrice: number;
  status: "unconfirmed";
  isPaid: false;
};
