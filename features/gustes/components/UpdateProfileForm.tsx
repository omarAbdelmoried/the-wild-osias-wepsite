"use client";

import type { ReactNode } from "react";
import { updateProfileGuest } from "@/features/gustes/services/guest.service";
import type { Guest } from "@/features/gustes/types/guest";
import { useFormStatus } from "react-dom";
import Image from "next/image";

type UpdateProfileFormProps = {
  children: ReactNode;
  guest: Guest;
};

function UpdateProfileForm({ children, guest }: UpdateProfileFormProps) {
  const { fullName, email, countryFlag, nationalID } = guest;
  /**
   * {
  id: 485,
  created_at: '2026-08-23T17:52:48.091981+00:00',
  fullName: 'Omar Abdulmorid',
  email: 'omarelmangermff@gmail.com',
  nationality: 'Aruba',
  countryFlag: '🇦🇼',
  nationalID: 'A12345678901'
}
   */
  return (
    <form
      className="bg-primary-900 py-8 px-4 sm:px-8 md:px-12 text-lg flex gap-6 flex-col"
      action={updateProfileGuest}
    >
      <div className="space-y-2">
        <label>Full name</label>
        <input
          name="fullName"
          defaultValue={fullName}
          disabled
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <label>Email address</label>
        <input
          name="email"
          defaultValue={email}
          disabled
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="nationality">Where are you from?</label>
          {countryFlag.startsWith("http") ? (
            <Image
              width={20}
              height={20}
              referrerPolicy="no-referrer"
              src={countryFlag}
              alt="Country flag"
              className="h-5 rounded-sm"
            />
          ) : (
            <span className="text-2xl">{countryFlag ?? "🏁"}</span>
          )}
        </div>

        {children}
      </div>

      <div className="space-y-2">
        <label htmlFor="nationalID">National ID number</label>
        <input
          defaultValue={nationalID}
          name="nationalID"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
        />
      </div>

      <div className="flex justify-end items-center gap-6">
        <Button />
      </div>
    </form>
  );
}

function Button() {
  const { pending: isPending } = useFormStatus();

  return (
    <button
      className="bg-accent-500 px-8 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
      disabled={isPending}
    >
      {isPending ? `Update profile...` : "Update profile"}
    </button>
  );
}

export default UpdateProfileForm;
