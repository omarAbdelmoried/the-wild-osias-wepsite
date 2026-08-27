import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import CabinList from "../../features/cabin/components/CabinList";
import Filter from "@/components/Filter";
import { CabinsPage } from "@/features/cabin/components/cabinsPage";
export const metadata = {
  title: "cabins",
};
export default async function Page({ searchParams }) {
  const capacityFilter = searchParams?.capacity ?? "all";
  // CHANGE

  return <CabinsPage capacityFilter={capacityFilter} />;
}
