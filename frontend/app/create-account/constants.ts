/** ISO 3166-1 alpha-2 — used with flag CDN (https://flagcdn.com) */
export type CountryOption = {
  code: string;
  country: string;
  iso2: string;
};

export const countryCodes: CountryOption[] = [
  { code: "+91", country: "India", iso2: "in" },
  { code: "+1", country: "USA", iso2: "us" },
  { code: "+44", country: "UK", iso2: "gb" },
  { code: "+61", country: "Australia", iso2: "au" },
  { code: "+971", country: "UAE", iso2: "ae" },
  { code: "+966", country: "Saudi Arabia", iso2: "sa" },
  { code: "+65", country: "Singapore", iso2: "sg" },
  { code: "+60", country: "Malaysia", iso2: "my" },
];
