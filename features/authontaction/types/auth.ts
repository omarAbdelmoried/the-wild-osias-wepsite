import type { Guest } from "@/features/gustes/types/guest";

export type AppUser = Pick<Guest, "id" | "email" | "fullName"> & {
  name?: string | null;
  image?: string | null;
};

export type AppSession = {
  user: AppUser;
};

export type AuthSessionUser = {
  id: number;
  email: string | null;
  name?: string | null;
};
