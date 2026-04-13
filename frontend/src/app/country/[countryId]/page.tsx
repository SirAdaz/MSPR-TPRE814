import Link from "next/link";

import { PageHeaderNav } from "@/components/PageHeaderNav";
import { CountryCode } from "@/lib/countries";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
}

export default async function CountryPage({ params }: Props) {
  const { countryId } = await params;

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
      <div className="mt-6 flex gap-3">
        <Link className="btn btn-primary" href={`/country/${countryId}/lots`}>Lots</Link>
        <Link className="btn btn-secondary" href={`/country/${countryId}/alerts`}>Alertes</Link>
      </div>
    </main>
  );
}
