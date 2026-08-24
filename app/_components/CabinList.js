import CabinCard from "@/app/_components/CabinCard";
import { getCabins } from "@/app/_lips/data-service";

async function CabinList({ capacityFilter }) {
  const cabins = await getCabins();
  if (!cabins) return null;
  const filters =
    {
      all: () => cabins,
      small: () => cabins.filter((cabin) => cabin.maxCapacity <= 2),
      medium: () =>
        cabins.filter(
          (cabin) => cabin.maxCapacity > 2 && cabin.maxCapacity <= 6,
        ),
      large: () => cabins.filter((cabin) => cabin.maxCapacity > 6),
    } || cabins;
  console.log("capacityFilter", capacityFilter);
  console.log("filteredCabins", cabins);

  const filterByCapacity = (filters[capacityFilter] || filters.all)();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-12 xl:gap-14">
      {filterByCapacity.map((cabin) => (
        <CabinCard cabin={cabin} key={cabin.id} />
      ))}
    </div>
  );
}

export default CabinList;
