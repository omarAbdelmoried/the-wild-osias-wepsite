import { Suspense } from "react";
import Spinner from "@/app/_components/Spinner";
import CabinList from "../_components/CabinList";
import Filter from "../_components/Filter";
export const metadata = {
  title: "cabins",
};
export default async function Page({ searchParams }) {
  const capacityFilter = searchParams?.capacity ?? "all";
  // CHANGE

  return (
    <div>
      <h1 className="text-4xl mb-5 text-accent-400 font-medium">
        Our Luxury Cabins
      </h1>
      <p className="text-primary-200 text-lg mb-10">
        Cozy yet luxurious cabins, located right in the heart of the Italian
        Dolomites. Imagine waking up to beautiful mountain views, spending your
        days exploring the dark forests around, or just relaxing in your private
        hot tub under the stars. Enjoy nature's beauty in your own little home
        away from home. The perfect spot for a peaceful, calm vacation. Welcome
        to paradise.
      </p>
      <Suspense fallback={<Spinner />} key={capacityFilter}>
        <div className="flex justify-end mb-5">
          <Filter
            options={[
              {
                label: "All cabins",
                value: "all",
              },
              {
                label: "1-3 guests",
                value: "small",
              },
              {
                label: "3-6 guests",
                value: "medium",
              },
              {
                label: "More than 6 guests",
                value: "large",
              },
            ]}
            defaultValue={capacityFilter}
            paramsName="capacity"
          />
        </div>

        <CabinList capacityFilter={capacityFilter} />
      </Suspense>
    </div>
  );
}
