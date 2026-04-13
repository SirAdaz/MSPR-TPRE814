import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeaderNav } from "@/components/PageHeaderNav";
import { Button } from "@/components/ui/button";
import { CountryCode } from "@/lib/countries";
import { canAccessAlerts, canAccessCountry, canAccessLots } from "@/lib/permissions";
import { requireSession } from "@/lib/server-auth";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
}

export default async function CountryPage({ params }: Props) {
  const session = await requireSession();
  const { countryId } = await params;
  const role = session.user?.role ?? "user";
  if (!canAccessCountry(role, countryId)) {
    redirect("/");
  }
  const showLots = canAccessLots(role, countryId);
  const showAlerts = canAccessAlerts(role, countryId);

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
        {showLots ? <Link href={`/country/${countryId}/lots`}><Button>Lots</Button></Link> : null}
        {showAlerts ? (
          <Link href={`/country/${countryId}/alerts`}><Button variant="secondary">Alertes</Button></Link>
        ) : null}
      </div>
    </main>
  );
}
