import { ReadingChart } from "@/components/ReadingChart";
import { CountryCode, countryApiMap } from "@/lib/countries";
import { fetchJson } from "@/lib/client";
import { SensorReading } from "@/types";

interface Props {
  params: Promise<{ countryId: CountryCode; lotId: string }>;
}

export default async function LotDetailPage({ params }: Props) {
  const { countryId, lotId } = await params;
  const baseUrl = countryApiMap[countryId] ?? countryApiMap.BR;
  const readings = await fetchJson<SensorReading[]>(`${baseUrl}/api/v1/readings?warehouse_id=1`);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Lot {lotId} - {countryId}</h1>
      <div className="mt-6 rounded-box bg-base-200 p-4">
        <ReadingChart readings={readings} />
      </div>
    </main>
  );
}
