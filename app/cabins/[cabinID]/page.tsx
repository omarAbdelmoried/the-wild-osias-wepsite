import { Suspense } from "react";
import Reservation from "@/features/reservation/components/Reservation";
import Cabin from "@/features/cabin/components/Cabin";
import ReservationReminder from "@/features/reservation/components/ReservationReminder";

import Spinner from "@/components/Spinner";
import { getCabin, getCabins } from "@/features/cabin/services/cabin.services";
export async function generateMetadata({ params }) {
  const cabin = await getCabin(params.cabinID);
  const { name } = cabin;
  return {
    title: `Cabin ${name}`,
  };
}

// This function gets called at build time to made page static

export async function generateStaticParams() {
  const cabins = await getCabins();
  const ids = cabins.map((cabin) => ({
    cabinID: String(cabin.id),
  }));
  return ids;
}

async function Page({ params }) {
  const cabin = await getCabin(params.cabinID);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-6">
      <Cabin cabin={cabin} />
      <div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-accent-400">
          Reserve {cabin.name} today. Pay on arrival.
        </h2>
        <Suspense fallback={<Spinner />}>
          <Reservation cabin={cabin} />
        </Suspense>
        <ReservationReminder />
      </div>
    </div>
  );
}

export default Page;
