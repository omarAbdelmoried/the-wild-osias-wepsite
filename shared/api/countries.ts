export async function getCountries() {
  try {
    const res = await fetch("https://api.restcountries.com/countries/v5", {
      headers: {
        Authorization: `Bearer ${process.env.REST_COUNTRIES_API_KEY}`,
      },
    });
    const countries = await res.json();
    return countries;
  } catch {
    throw new Error("Could not fetch countries");
  }
}
