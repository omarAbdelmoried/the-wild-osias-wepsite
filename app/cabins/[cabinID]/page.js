import { getCabin, getCabins } from "@/app/_lips/data-service";

import Reservation from "@/app/_components/Reservation";
import { Suspense } from "react";
import Spinner from "@/app/_components/Spinner";
import Cabin from "@/app/_components/Cabin";
import ReservationReminder from "@/app/_components/ReservationReminder";
import { ReservationProvider } from "@/app/_components/ReservationContex";
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
    <div className="max-w-6xl mx-auto mt-8">
      <Cabin cabin={cabin} />
      <div>
        <h2 className="text-5xl font-semibold text-center text-accent-400">
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
