import CabinCard from "@/features/cabin/components/CabinCard";
import { getCabins } from "@/features/cabin/services/cabin.services";
async function CabinList({ capacityFilter }) {
  const cabins = await getCabins();
  if (!cabins) return null;
  const filters = {
    all: () => cabins,
    small: () => cabins.filter((cabin) => cabin.maxCapacity <= 2),
    medium: () =>
      cabins.filter(
        (cabin) => cabin.maxCapacity > 2 && cabin.maxCapacity <= 6,
      ),
    large: () => cabins.filter((cabin) => cabin.maxCapacity > 6),
  };

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
