import { getCountries } from "@/shared/api/countries";

type SelectCountryProps = {
  defaultCountry: string;
  name: string;
  id: string;
  className?: string;
};

async function SelectCountry({
  defaultCountry,
  name,
  id,
  className,
}: SelectCountryProps) {
  const response = await getCountries();

  const countries = response?.data?.objects ?? [];
  const flag =
    countries.find((country) => country?.names?.common === defaultCountry)?.flag
      ?.emoji ?? "";

  return (
    <select
      name={name}
      id={id}
      defaultValue={`${defaultCountry}%${flag}`}
      className={className}
    >
      <option value="">Select country...</option>
      {countries.map((country) => (
        <option
          key={
            country?.codes?.alpha_2 ?? country?.uuid ?? country?.names?.common
          }
          value={`${country?.names?.common ?? ""}%${country?.flag?.url_png || country?.flag?.emoji || ""}`}
        >
          {country?.names?.common ?? "Unknown country"}
        </option>
      ))}
    </select>
  );
}

export default SelectCountry;
