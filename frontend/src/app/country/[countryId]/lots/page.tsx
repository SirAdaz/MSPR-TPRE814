import { redirect } from "next/navigation";

import { CountryLotsManager } from "@/components/CountryLotsManager";
import { PageHeaderNav } from "@/components/PageHeaderNav";
import { CountryCode } from "@/lib/countries";
import { canAccessLots } from "@/lib/permissions";
import { requireSession } from "@/lib/server-auth";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
}

export default async function LotsPage({ params }: Props) {
  const session = await requireSession();
  const { countryId } = await params;
  const role = session.user?.role ?? "user";
  if (!canAccessLots(role, countryId)) {
    redirect(`/country/${countryId}`);
  }

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
