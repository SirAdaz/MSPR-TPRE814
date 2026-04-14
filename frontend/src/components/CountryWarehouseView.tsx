"use client";

import { FormEvent, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert, Lot, Warehouse } from "@/types";

type WarehouseForm = {
  name: string;
  ideal_temp: string;
  ideal_humidity: string;
  temp_tolerance: string;
  humidity_tolerance: string;
};

type Props = {
  countryId: string;
  warehouses: Warehouse[];
  selectedWarehouseId: number | null;
  lots: Lot[];
  alerts: Alert[];
  canManage: boolean;
};

const DEFAULT_FORM: WarehouseForm = {
  name: "",
  ideal_temp: "",
  ideal_humidity: "",
  temp_tolerance: "",
  humidity_tolerance: "",
};

export function CountryWarehouseView({
  countryId,
  warehouses,
  selectedWarehouseId,
  lots,
  alerts,
  canManage,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<WarehouseForm>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedWarehouse = useMemo(
    () => warehouses.find((warehouse) => warehouse.id === selectedWarehouseId) ?? null,
    [warehouses, selectedWarehouseId],
  );

  function onWarehouseChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete("warehouseId");
    } else {
      params.set("warehouseId", value);
    }
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
  }

  async function handleCreateWarehouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || warehouses.length === 0) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/countries/${countryId}/warehouses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exploitation_id: warehouses[0].exploitation_id,
          name: form.name,
          ideal_temp: Number(form.ideal_temp),
          ideal_humidity: Number(form.ideal_humidity),
          temp_tolerance: Number(form.temp_tolerance),
          humidity_tolerance: Number(form.humidity_tolerance),
        }),
      });
      if (!response.ok) {
        setError("Creation de l'entrepot echouee.");
        return;
      }
      setForm(DEFAULT_FORM);
      router.refresh();
    } catch {
      setError("Creation de l'entrepot echouee.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Selection d&apos;entrepot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={selectedWarehouseId?.toString() ?? ""}
            onChange={(event) => onWarehouseChange(event.target.value)}
          >
            <option value="">Tous les entrepots</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} (#{warehouse.id})
              </option>
            ))}
          </Select>
          {selectedWarehouse ? (
            <p className="text-sm text-zinc-600">
              Seuils {selectedWarehouse.name} - Temp {selectedWarehouse.ideal_temp} +/- {selectedWarehouse.temp_tolerance}
              {" "} C, Humidite {selectedWarehouse.ideal_humidity} +/- {selectedWarehouse.humidity_tolerance}%
            </p>
          ) : (
            <p className="text-sm text-zinc-600">
              Vue globale sur tous les entrepots du pays.
            </p>
          )}
        </CardContent>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un entrepot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-zinc-500">Les champs avec <span className="text-red-600">*</span> sont obligatoires.</p>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreateWarehouse}>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-700">Nom de l&apos;entrepot <span className="text-red-600">*</span></span>
                <Input
                  placeholder="Ex: Warehouse BR-C"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-700">Temperature ideale (C) <span className="text-red-600">*</span></span>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 18.5"
                  value={form.ideal_temp}
                  onChange={(event) => setForm((prev) => ({ ...prev, ideal_temp: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-700">Humidite ideale (%) <span className="text-red-600">*</span></span>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 60"
                  value={form.ideal_humidity}
                  onChange={(event) => setForm((prev) => ({ ...prev, ideal_humidity: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-700">Tolerance temperature (C) <span className="text-red-600">*</span></span>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 3"
                  value={form.temp_tolerance}
                  onChange={(event) => setForm((prev) => ({ ...prev, temp_tolerance: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-zinc-700">Tolerance humidite (%) <span className="text-red-600">*</span></span>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 5"
                  value={form.humidity_tolerance}
                  onChange={(event) => setForm((prev) => ({ ...prev, humidity_tolerance: event.target.value }))}
                  required
                />
              </label>
              <Button className="md:col-span-2" type="submit" disabled={submitting}>
                {submitting ? "Creation..." : "Ajouter l'entrepot"}
              </Button>
            </form>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lots de l&apos;entrepot</CardTitle>
          </CardHeader>
          <CardContent>
            {lots.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucun lot pour ce filtre.</p>
            ) : (
              <ul className="space-y-2 text-sm text-zinc-700">
                {lots.map((lot) => (
                  <li key={lot.id} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2">
                    <span>{lot.lot_uid}</span>
                    <span className="text-zinc-500">{lot.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes de l&apos;entrepot</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucune alerte pour ce filtre.</p>
            ) : (
              <ul className="space-y-2 text-sm text-zinc-700">
                {alerts.map((alert) => (
                  <li key={alert.id} className="rounded-md border border-zinc-200 px-3 py-2">
                    <p className="font-medium">{alert.alert_type}</p>
                    <p className="text-zinc-500">{alert.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
