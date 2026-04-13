import { LotList } from "@/components/LotList";
import { CountryCode, countryApiMap } from "@/lib/countries";
import { fetchJson } from "@/lib/client";
import { Lot } from "@/types";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
}

export default async function LotsPage({ params }: Props) {
  const { countryId } = await params;
  const baseUrl = countryApiMap[countryId] ?? countryApiMap.BR;
  const lots = await fetchJson<Lot[]>(`${baseUrl}/api/v1/lots?sort=storage_date&order=asc`);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Lots - {countryId}</h1>
      <div className="mt-6">
        <LotList lots={lots} />
      </div>
    </main>
  );
}
