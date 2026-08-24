import { getCountries } from "@/app/_lips/data-service";

async function SelectCountry({ defaultCountry, name, id, className }) {
  const countries = await getCountries();
  const flag =
    countries.data.objects.find(
      (country) => country.names.common === defaultCountry,
    )?.flag.emoji ?? "";

  return (
    <select
      name={name}
      id={id}
      defaultValue={`${defaultCountry}%${flag}`}
      className={className}
    >
      <option value="">Select country...</option>
      {countries?.data?.objects.map((c) => (
        <option
          key={c.names.common}
          value={`${c.names.common}%${c.flag.emoji}`}
        >
          {c.names.common}
        </option>
      ))}
    </select>
  );
}

export default SelectCountry;
