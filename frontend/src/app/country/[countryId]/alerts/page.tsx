import { PageHeaderNav } from "@/components/PageHeaderNav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryCode } from "@/lib/countries";
import { requireSession } from "@/lib/server-auth";
import { fetchJson } from "@/lib/client";
import { Alert } from "@/types";

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
      <div className="mt-6 space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{alert.alert_type}</span>
                <Badge variant="warning">Alerte</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>{alert.message}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
