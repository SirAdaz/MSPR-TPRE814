import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryCode } from "@/lib/countries";
import { canAccessAlerts, canAccessCountry, canAccessLots } from "@/lib/permissions";
import { requireSession } from "@/lib/server-auth";
import { fetchJson } from "@/lib/client";
import { Alert, Lot } from "@/types";

const countries: { id: CountryCode; name: string }[] = [
  { id: "BR", name: "Bresil" },
  { id: "EC", name: "Equateur" },
  { id: "CO", name: "Colombie" },
];

export default async function HomePage() {
  const session = await requireSession();
  const role = session.user?.role ?? "user";
  const allowedCountries = countries.filter((country) => canAccessCountry(role, country.id));
  const previews = await Promise.all(
    allowedCountries.map(async (country) => {
      const [lots, alerts] = await Promise.all([
        canAccessLots(role, country.id)
          ? fetchJson<Lot[]>(`/api/countries/${country.id}/lots?limit=3&offset=0&sort=storage_date&order=asc`)
          : Promise.resolve([]),
        canAccessAlerts(role, country.id)
          ? fetchJson<Alert[]>(`/api/countries/${country.id}/alerts?limit=3&offset=0`)
          : Promise.resolve([]),
      ]);
      return {
        countryId: country.id,
        canViewLots: canAccessLots(role, country.id),
        canViewAlerts: canAccessAlerts(role, country.id),
        lots,
        alerts,
      };
    }),
  );
  const previewMap = new Map(previews.map((item) => [item.countryId, item]));

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Card className="bg-gradient-to-r from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="text-3xl">FutureKawa - Dashboard Siege</CardTitle>
          <p className="text-sm text-zinc-600">Suivi unifie des stocks, mesures et alertes par pays.</p>
        </CardHeader>
      </Card>
      <section className="mt-8 grid gap-4 md:grid-cols-1 xl:grid-cols-2">
        {allowedCountries.map((country) => (
          <Card key={country.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{country.name}</span>
                <span className="text-sm font-normal text-zinc-500">{country.id}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-600">Acces direct par domaine sans etape intermediaire.</p>
              <div className="flex flex-wrap gap-2">
                {previewMap.get(country.id)?.canViewLots ? (
                  <Link href={`/country/${country.id}/lots`}>
                    <Button size="sm">Voir les lots</Button>
                  </Link>
                ) : null}
                {previewMap.get(country.id)?.canViewAlerts ? (
                  <Link href={`/country/${country.id}/alerts`}>
                    <Button size="sm" variant="secondary">Voir les alertes</Button>
                  </Link>
                ) : null}
                <Link href={`/country/${country.id}`}>
                  <Button size="sm" variant="outline">Vue pays</Button>
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 p-3">
                  <p className="mb-2 text-sm font-medium">Derniers lots</p>
                  {previewMap.get(country.id)?.lots.length ? (
                    <ul className="space-y-1 text-sm text-zinc-600">
                      {previewMap.get(country.id)?.lots.map((lot) => <li key={lot.id}>{lot.lot_uid} - {lot.status}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500">Pas d&apos;acces ou aucune donnee.</p>
                  )}
                </div>
                <div className="rounded-lg border border-zinc-200 p-3">
                  <p className="mb-2 text-sm font-medium">Dernieres alertes</p>
                  {previewMap.get(country.id)?.alerts.length ? (
                    <ul className="space-y-1 text-sm text-zinc-600">
                      {previewMap.get(country.id)?.alerts.map((alert) => <li key={alert.id}>{alert.alert_type}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500">Pas d&apos;acces ou aucune alerte.</p>
                  )}
                </div>
              </div>
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
