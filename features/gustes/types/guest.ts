export type Guest = {
  id: number;
  created_at: string;
  fullName: string | null;
  email: string | null;
  nationality: string | null;
  countryFlag: string | null;
  nationalID: string | null;
};

export type GuestInsert = Pick<Guest, "email" | "fullName"> &
  Partial<Pick<Guest, "nationality" | "countryFlag" | "nationalID">>;

export type GuestProfileUpdate = Pick<
  Guest,
  "nationality" | "countryFlag" | "nationalID"
>;
