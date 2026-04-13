import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeaderNav } from "@/components/PageHeaderNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryCode } from "@/lib/countries";
import { canAccessAlerts } from "@/lib/permissions";
import { requireSession } from "@/lib/server-auth";
import { fetchJson } from "@/lib/client";
import { Alert } from "@/types";

interface Props {
  params: Promise<{ countryId: CountryCode }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 10;

export default async function AlertsPage({ params, searchParams }: Props) {
  const session = await requireSession();
  const { countryId } = await params;
  const role = session.user?.role ?? "user";
  if (!canAccessAlerts(role, countryId)) {
    redirect(`/country/${countryId}`);
  }
  const query = await searchParams;
  const parsedPage = Number(query.page ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const offset = (page - 1) * PAGE_SIZE;
  const fetchedAlerts = await fetchJson<Alert[]>(
    `/api/countries/${countryId}/alerts?limit=${PAGE_SIZE + 1}&offset=${offset}`,
  );
  const hasNextPage = fetchedAlerts.length > PAGE_SIZE;
  const alerts = fetchedAlerts.slice(0, PAGE_SIZE);

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
        {alerts.length === 0 ? <p className="text-sm text-zinc-600">Aucune alerte sur cette page.</p> : null}
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        {page <= 1 ? (
          <Button size="sm" variant="outline" disabled>
            Precedent
          </Button>
        ) : (
          <Link href={`/country/${countryId}/alerts?page=${page - 1}`}>
            <Button size="sm" variant="outline">Precedent</Button>
          </Link>
        )}
        <span className="text-sm text-zinc-600">Page {page}</span>
        {!hasNextPage ? (
          <Button size="sm" variant="outline" disabled>
            Suivant
          </Button>
        ) : (
          <Link href={`/country/${countryId}/alerts?page=${page + 1}`}>
            <Button size="sm" variant="outline">Suivant</Button>
          </Link>
        )}
      </div>
    </main>
  );
}
