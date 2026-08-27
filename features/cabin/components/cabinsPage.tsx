import Spinner from "@/components/Spinner";
import Filter from "@/components/Filter";
import React, { Suspense } from "react";
import CabinList from "./CabinList";

export const CabinsPage = ({ capacityFilter }: { capacityFilter: string }) => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl mb-4 sm:mb-5 text-accent-400 font-medium">
        Our Luxury Cabins
      </h1>
      <p className="text-primary-200 text-lg mb-7 sm:mb-10 max-w-4xl">
        Cozy yet luxurious cabins, located right in the heart of the Italian
        Dolomites. Imagine waking up to beautiful mountain views, spending your
        days exploring the dark forests around, or just relaxing in your private
        hot tub under the stars. Enjoy nature&apos;s beauty in your own little
        home away from home. The perfect spot for a peaceful, calm vacation.
        Welcome to paradise.
      </p>
      <Suspense fallback={<Spinner />} key={capacityFilter}>
        <div className="flex justify-start sm:justify-end mb-4 sm:mb-5">
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
};
