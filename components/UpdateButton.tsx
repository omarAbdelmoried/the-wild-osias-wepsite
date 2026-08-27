"use client";
import { useFormStatus } from "react-dom";
import SpinnerMini from "./SpinnerMini";

function UpdateButton() {
  const { pending: isPending } = useFormStatus();
  return (
    <button className="bg-accent-500 px-8 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300">
      {isPending ? (
        <span className="mx-auto">
            <SpinnerMini />
        </span>
      ) : (
        " Update reservation"
      )}
    </button>
  );
}

export default UpdateButton;
