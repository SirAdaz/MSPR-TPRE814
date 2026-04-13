import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryCode } from "@/lib/countries";
import { canAccessCountry } from "@/lib/permissions";
import { requireSession } from "@/lib/server-auth";

const countries: { id: CountryCode; name: string }[] = [
  { id: "BR", name: "Bresil" },
  { id: "EC", name: "Equateur" },
  { id: "CO", name: "Colombie" },
];

export default async function HomePage() {
  const session = await requireSession();
  const role = session.user?.role ?? "user";
  const allowedCountries = countries.filter((country) => canAccessCountry(role, country.id));

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Card className="bg-gradient-to-r from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="text-3xl">FutureKawa - Dashboard Siege</CardTitle>
          <p className="text-sm text-zinc-600">Suivi unifie des stocks, mesures et alertes par pays.</p>
        </CardHeader>
      </Card>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {allowedCountries.map((country) => (
          <Card key={country.id}>
            <CardHeader>
              <CardTitle>{country.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-600">Acceder aux lots et alertes.</p>
              <Link href={`/country/${country.id}`}>
                <Button size="sm">Ouvrir</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
      {allowedCountries.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">
          Votre role actuel ne permet pas d&apos;acceder aux donnees pays. Contactez un administrateur.
        </p>
      ) : null}
    </main>
  );
}
