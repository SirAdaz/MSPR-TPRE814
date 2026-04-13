export type CountryCode = "BR" | "EC" | "CO";

export const countryApiMap: Record<CountryCode, string> = {
  BR: process.env.BACKEND_BR_URL ?? "http://backend-br:8000",
  EC: process.env.BACKEND_EC_URL ?? "http://backend-ec:8000",
  CO: process.env.BACKEND_CO_URL ?? "http://backend-co:8000",
};
