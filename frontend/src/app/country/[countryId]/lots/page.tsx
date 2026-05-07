import { redirect } from "next/navigation";

import { CountryLotsManager } from "@/components/CountryLotsManager";
import { PageHeaderNav } from "@/components/PageHeaderNav";
import { WarehouseFilterSelect } from "@/components/WarehouseFilterSelect";
import { CountryCode } from "@/lib/countries";
import { fetchJson } from "@/lib/client";
import { canAccessLots } from "@/lib/permissions";
import { requireSession } from "@/lib/server-auth";
import { Warehouse } from "@/types";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
  searchParams: Promise<{ warehouseId?: string }>;
}

export default async function LotsPage({ params, searchParams }: Props) {
  const session = await requireSession();
  const { countryId } = await params;
  const query = await searchParams;
  const selectedWarehouseId = query.warehouseId ? Number(query.warehouseId) : null;
  const role = session.user?.role ?? "user";
  if (!canAccessLots(role, countryId)) {
    redirect(`/country/${countryId}`);
  }
  const warehouses = await fetchJson<Warehouse[]>(`/api/countries/${countryId}/warehouses`);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <PageHeaderNav
        backHref={`/country/${countryId}`}
        backLabel={`Pays ${countryId}`}
        items={[
          { label: "Accueil", href: "/" },
          { label: `Pays ${countryId}`, href: `/country/${countryId}` },
          { label: "Lots" },
        ]}
      />
      <h1 className="text-3xl font-bold">Lots - {countryId}</h1>
      <div className="mt-6 space-y-3">
        <p className="text-sm text-zinc-600">Filtrer les lots par entrepot.</p>
        <WarehouseFilterSelect warehouses={warehouses} selectedWarehouseId={selectedWarehouseId} />
      </div>
      <div className="mt-6">
        <CountryLotsManager
          countryId={countryId}
          selectedWarehouseId={Number.isFinite(selectedWarehouseId) && selectedWarehouseId ? selectedWarehouseId : null}
        />
      </div>
    </main>
  );
}
