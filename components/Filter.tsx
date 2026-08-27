"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type FilterOption = {
  label: string;
  value: string;
};

type FilterProps = {
  options: readonly FilterOption[];
  defaultValue: string;
  paramsName: string;
};

type ButtonProps = {
  handleFilter: (filter: string) => void;
  activeFilter: string;
  filter: string;
  children: ReactNode;
};

function Filter({ options, defaultValue, paramsName }: FilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeFilter = searchParams.get(paramsName) || defaultValue;
  function handleFilter(filter: string): void {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set(paramsName, filter);
    router.replace(`${pathname}?${currentParams.toString()}`);
  }
  return (
    <div className="flex flex-wrap gap-1 items-center border-2 border-primary-800">
      {options.map((filter) => (
        <Button
          key={filter.value}
          handleFilter={handleFilter}
          activeFilter={activeFilter}
          filter={filter.value}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

function Button({ handleFilter, activeFilter, filter, children }: ButtonProps) {
  return (
    <button
      className={`px-3 sm:px-5 py-2 text-sm sm:text-base hover:bg-primary-700 hover:text-primary-50 transition-colors ${activeFilter === filter ? "bg-primary-800" : ""}`}
      onClick={() => handleFilter(filter)}
    >
      {children}
    </button>
  );
}

export default Filter;
