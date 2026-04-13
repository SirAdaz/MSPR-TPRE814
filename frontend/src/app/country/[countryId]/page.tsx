import Link from "next/link";

import { PageHeaderNav } from "@/components/PageHeaderNav";
import { Button } from "@/components/ui/button";
import { CountryCode } from "@/lib/countries";
import { requireSession } from "@/lib/server-auth";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
}

export default async function CountryPage({ params }: Props) {
  await requireSession();
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
        <Link href={`/country/${countryId}/lots`}><Button>Lots</Button></Link>
        <Link href={`/country/${countryId}/alerts`}><Button variant="secondary">Alertes</Button></Link>
      </div>
    </main>
  );
}
