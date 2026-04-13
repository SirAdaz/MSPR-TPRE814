import { CountryCode } from "@/lib/countries";
import { requireSession } from "@/lib/server-auth";
import { fetchJson } from "@/lib/client";
import { Alert } from "@/types";
import { PageHeaderNav } from "@/components/PageHeaderNav";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
}

export default async function AlertsPage({ params }: Props) {
  await requireSession();
  const { countryId } = await params;
  const alerts = await fetchJson<Alert[]>(`/api/countries/${countryId}/alerts`);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <PageHeaderNav
        backHref={`/country/${countryId}`}
        backLabel={`Pays ${countryId}`}
        items={[
          { label: "Accueil", href: "/" },
          { label: `Pays ${countryId}`, href: `/country/${countryId}` },
          { label: "Alertes" },
        ]}
      />
      <h1 className="text-3xl font-bold">Alertes - {countryId}</h1>
      <ul className="mt-6 space-y-2">
        {alerts.map((alert) => (
          <li className="alert alert-warning" key={alert.id}>{alert.alert_type}: {alert.message}</li>
        ))}
      </ul>
    </main>
  );
}
