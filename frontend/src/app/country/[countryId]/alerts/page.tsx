import { CountryCode, countryApiMap } from "@/lib/countries";
import { fetchJson } from "@/lib/client";
import { Alert } from "@/types";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
}

export default async function AlertsPage({ params }: Props) {
  const { countryId } = await params;
  const baseUrl = countryApiMap[countryId] ?? countryApiMap.BR;
  const alerts = await fetchJson<Alert[]>(`${baseUrl}/api/v1/alerts`);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Alertes - {countryId}</h1>
      <ul className="mt-6 space-y-2">
        {alerts.map((alert) => (
          <li className="alert alert-warning" key={alert.id}>{alert.alert_type}: {alert.message}</li>
        ))}
      </ul>
    </main>
  );
}
