import { CountryCode } from "@/lib/countries";

const COUNTRY_EXPLOITATION_ROLE: Record<CountryCode, string> = {
  BR: "responsable_exploitation_br",
  EC: "responsable_exploitation_ec",
  CO: "responsable_exploitation_co",
};

function isGlobalRole(role: string): boolean {
  return ["admin", "siege", "responsable_entrepot", "equipe_qualite", "equipe_supply_chain"].includes(role);
}

export function canAccessCountry(role: string, countryId: CountryCode): boolean {
  if (isGlobalRole(role)) {
    return true;
  }
  return role === COUNTRY_EXPLOITATION_ROLE[countryId];
}

export function canAccessLots(role: string, countryId: CountryCode): boolean {
  if (["admin", "siege", "responsable_entrepot", "equipe_supply_chain"].includes(role)) {
    return true;
  }
  return role === COUNTRY_EXPLOITATION_ROLE[countryId];
}

export function canAccessAlerts(role: string, countryId: CountryCode): boolean {
  if (["admin", "siege", "equipe_qualite", "equipe_supply_chain"].includes(role)) {
    return true;
  }
  return role === COUNTRY_EXPLOITATION_ROLE[countryId];
}

export function canAccessAdmin(role: string, email: string): boolean {
  return role === "admin" || email === (process.env.DEFAULT_ADMIN_EMAIL ?? "admin@futurekawa.local");
}
