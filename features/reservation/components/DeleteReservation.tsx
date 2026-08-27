"use client";

import { TrashIcon } from "@heroicons/react/24/solid";
import { useTransition } from "react";
import SpinnerMini from "@/components/SpinnerMini";

type DeleteReservationProps = {
  bookingId: number;
  onDelete: (bookingId: number) => void;
};

function DeleteReservation({ bookingId, onDelete }: DeleteReservationProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(bookingId: number) {
    if (window.confirm("Are you sure you want to delete this reservation?"))
      startTransition(() => onDelete(bookingId));
  }

  return (
    <button
      onClick={() => handleDelete(bookingId)}
      className="group flex items-center gap-2 uppercase text-xs font-bold text-primary-300 flex-grow px-3 hover:bg-accent-600 transition-colors hover:text-primary-900"
    >
      <TrashIcon className="h-5 w-5 text-primary-600 group-hover:text-primary-800 transition-colors" />
      <span className="mt-1">
        {isPending ? (
          <span>
            <SpinnerMini />
          </span>
        ) : (
          "Delete"
        )}
      </span>
    </button>
  );
}

export default DeleteReservation;
