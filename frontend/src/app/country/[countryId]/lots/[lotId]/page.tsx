import { redirect } from "next/navigation";

import { ReadingChart } from "@/components/ReadingChart";
import { PageHeaderNav } from "@/components/PageHeaderNav";
import { Card, CardContent } from "@/components/ui/card";
import { CountryCode } from "@/lib/countries";
import { canAccessLots } from "@/lib/permissions";
import { requireSession } from "@/lib/server-auth";
import { fetchJson } from "@/lib/client";
import { Lot, SensorReading } from "@/types";

interface Props {
  params: Promise<{ countryId: CountryCode; lotId: string }>;
}

export default async function LotDetailPage({ params }: Props) {
  const session = await requireSession();
  const { countryId, lotId } = await params;
  const role = session.user?.role ?? "user";
  if (!canAccessLots(role, countryId)) {
    redirect(`/country/${countryId}`);
  }
  const lot = await fetchJson<Lot>(`/api/countries/${countryId}/lots/${lotId}`);
  const fromStorageDate = `${lot.storage_date}T00:00:00`;
  const readings = await fetchJson<SensorReading[]>(
    `/api/countries/${countryId}/readings?warehouse_id=${lot.warehouse_id}&from=${encodeURIComponent(fromStorageDate)}`,
  );

  return (
    <main className="mx-auto max-w-4xl p-6">
      <PageHeaderNav
        backHref={`/country/${countryId}/lots`}
        backLabel="Liste des lots"
        items={[
          { label: "Accueil", href: "/" },
          { label: `Pays ${countryId}`, href: `/country/${countryId}` },
          { label: "Lots", href: `/country/${countryId}/lots` },
          { label: `Lot ${lotId}` },
        ]}
      />
      <h1 className="text-3xl font-bold">Lot {lotId} - {countryId}</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Courbes filtrees depuis la date de stockage ({lot.storage_date}) pour l&apos;entrepot #{lot.warehouse_id}.
      </p>
      <Card className="mt-6">
        <CardContent className="pt-6">
          <ReadingChart readings={readings} />
        </CardContent>
      </Card>
    </main>
  );
}
