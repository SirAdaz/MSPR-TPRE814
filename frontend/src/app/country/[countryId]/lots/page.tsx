import { CountryLotsManager } from "@/components/CountryLotsManager";
import { PageHeaderNav } from "@/components/PageHeaderNav";
import { CountryCode } from "@/lib/countries";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
}

export default async function LotsPage({ params }: Props) {
  const { countryId } = await params;

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
      <div className="mt-6">
        <CountryLotsManager countryId={countryId} />
      </div>
    </main>
  );
}
