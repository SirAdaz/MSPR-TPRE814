import { ReadingChart } from "@/components/ReadingChart";
import { PageHeaderNav } from "@/components/PageHeaderNav";
import { Card, CardContent } from "@/components/ui/card";
import { CountryCode } from "@/lib/countries";
import { requireSession } from "@/lib/server-auth";
import { fetchJson } from "@/lib/client";
import { SensorReading } from "@/types";

interface Props {
  params: Promise<{ countryId: CountryCode; lotId: string }>;
}

export default async function LotDetailPage({ params }: Props) {
  await requireSession();
  const { countryId, lotId } = await params;
  const readings = await fetchJson<SensorReading[]>(`/api/countries/${countryId}/readings?warehouse_id=1`);

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
      <Card className="mt-6">
        <CardContent className="pt-6">
          <ReadingChart readings={readings} />
        </CardContent>
      </Card>
    </main>
  );
}
