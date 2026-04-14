import Link from "next/link";
import { redirect } from "next/navigation";

import { CountryWarehouseView } from "@/components/CountryWarehouseView";
import { PageHeaderNav } from "@/components/PageHeaderNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryCode } from "@/lib/countries";
import { canAccessAlerts, canAccessCountry, canAccessLots, canManageWarehouses } from "@/lib/permissions";
import { requireSession } from "@/lib/server-auth";
import { fetchJson } from "@/lib/client";
import { Alert, Lot, Warehouse } from "@/types";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
  searchParams: Promise<{ warehouseId?: string }>;
}

export default async function CountryPage({ params, searchParams }: Props) {
  const session = await requireSession();
  const { countryId } = await params;
  const query = await searchParams;
  const selectedWarehouseId = query.warehouseId ? Number(query.warehouseId) : null;
  const role = session.user?.role ?? "user";
  if (!canAccessCountry(role, countryId)) {
    redirect("/");
  }
  const showLots = canAccessLots(role, countryId);
  const showAlerts = canAccessAlerts(role, countryId);
  const canManage = canManageWarehouses(role, countryId);
  const warehouses = await fetchJson<Warehouse[]>(`/api/countries/${countryId}/warehouses`);
  const warehouseFilter = Number.isFinite(selectedWarehouseId) && selectedWarehouseId ? `&warehouse_id=${selectedWarehouseId}` : "";
  const [lots, alerts] = await Promise.all([
    showLots
      ? fetchJson<Lot[]>(`/api/countries/${countryId}/lots?limit=5&offset=0&sort=storage_date&order=asc${warehouseFilter}`)
      : Promise.resolve([]),
    showAlerts
      ? fetchJson<Alert[]>(`/api/countries/${countryId}/alerts?limit=5&offset=0${warehouseFilter}`)
      : Promise.resolve([]),
  ]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <PageHeaderNav
        backHref="/"
        backLabel="Dashboard"
        items={[
          { label: "Accueil", href: "/" },
          { label: `Pays ${countryId}` },
        ]}
      />
      <h1 className="text-3xl font-bold">Pays {countryId}</h1>
      <p className="mt-2 text-sm text-zinc-600">Vue consolidee pour acceder rapidement aux operations utiles.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lots</span>
              {showLots ? (
                <Link href={`/country/${countryId}/lots`}>
                  <Button size="sm">Ouvrir</Button>
                </Link>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showLots ? (
              <p className="text-sm text-zinc-500">Vous n&apos;avez pas le droit d&apos;acceder aux lots.</p>
            ) : lots.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucun lot disponible.</p>
            ) : (
              <ul className="space-y-2 text-sm text-zinc-700">
                {lots.map((lot) => (
                  <li key={lot.id} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2">
                    <span>{lot.lot_uid}</span>
                    <span className="text-zinc-500">{lot.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Alertes</span>
              {showAlerts ? (
                <Link href={`/country/${countryId}/alerts`}>
                  <Button size="sm" variant="secondary">Ouvrir</Button>
                </Link>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAlerts ? (
              <p className="text-sm text-zinc-500">Vous n&apos;avez pas le droit d&apos;acceder aux alertes.</p>
            ) : alerts.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucune alerte active.</p>
            ) : (
              <ul className="space-y-2 text-sm text-zinc-700">
                {alerts.map((alert) => (
                  <li key={alert.id} className="rounded-md border border-zinc-200 px-3 py-2">
                    <p className="font-medium">{alert.alert_type}</p>
                    <p className="text-zinc-500">{alert.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      <CountryWarehouseView
        countryId={countryId}
        warehouses={warehouses}
        selectedWarehouseId={selectedWarehouseId}
        lots={lots}
        alerts={alerts}
        canManage={canManage}
      />
    </main>
  );
}
