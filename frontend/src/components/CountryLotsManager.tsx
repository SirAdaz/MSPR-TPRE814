"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lot } from "@/types";

type Props = {
  countryId: string;
};

type LotForm = {
  lot_uid: string;
  warehouse_id: number;
  storage_date: string;
  status: string;
};
const PAGE_SIZE = 10;

const initialForm: LotForm = {
  lot_uid: "",
  warehouse_id: 1,
  storage_date: new Date().toISOString().slice(0, 10),
  status: "conforme",
};

export function CountryLotsManager({ countryId }: Props) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [lotUidToDelete, setLotUidToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [form, setForm] = useState<LotForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  async function loadLots() {
    setLoading(true);
    setError(null);
    try {
      const offset = page * PAGE_SIZE;
      const response = await fetch(
        `/api/countries/${countryId}/lots?limit=${PAGE_SIZE + 1}&offset=${offset}&sort=storage_date&order=asc`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as Lot[];
      setHasNextPage(data.length > PAGE_SIZE);
      setLots(data.slice(0, PAGE_SIZE));
    } catch {
      setError("Impossible de charger les lots.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLots();
  }, [countryId, page]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch(`/api/countries/${countryId}/lots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setError("Creation echouee.");
      return;
    }
    setForm(initialForm);
    if (page === 0) {
      await loadLots();
      return;
    }
    setPage(0);
  }

  async function handleDelete(lotUid: string) {
    setError(null);
    const response = await fetch(`/api/countries/${countryId}/lots/${lotUid}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError("Suppression echouee.");
      return;
    }
    if (page > 0 && lots.length === 1) {
      setPage((prev) => prev - 1);
      return;
    }
    await loadLots();
  }

  async function handleUpdate(lotUid: string, status: string, storageDate: string) {
    setError(null);
    const response = await fetch(`/api/countries/${countryId}/lots/${lotUid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, storage_date: storageDate }),
    });
    if (!response.ok) {
      setError("Mise a jour echouee.");
      return;
    }
    setEditingUid(null);
    await loadLots();
  }

  async function confirmDelete() {
    if (!lotUidToDelete) {
      return;
    }
    await handleDelete(lotUidToDelete);
    setLotUidToDelete(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un lot</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
            <Input
              placeholder="Lot UID"
              value={form.lot_uid}
              onChange={(event) => setForm((prev) => ({ ...prev, lot_uid: event.target.value }))}
              required
            />
            <Input
              type="number"
              min={1}
              value={form.warehouse_id}
              onChange={(event) => setForm((prev) => ({ ...prev, warehouse_id: Number(event.target.value) }))}
              required
            />
            <Input
              type="date"
              value={form.storage_date}
              onChange={(event) => setForm((prev) => ({ ...prev, storage_date: event.target.value }))}
              required
            />
            <Select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="conforme">conforme</option>
              <option value="alerte">alerte</option>
              <option value="perime">perime</option>
            </Select>
            <Button className="md:col-span-4" type="submit">Ajouter</Button>
          </form>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot UID</TableHead>
                <TableHead>Entrepot</TableHead>
                <TableHead>Date stockage</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>Chargement...</TableCell>
                </TableRow>
              ) : (
                lots.map((lot) => (
                  <LotRow
                    key={lot.id}
                    lot={lot}
                    editingUid={editingUid}
                    onStartEdit={setEditingUid}
                    onSave={handleUpdate}
                    onRequestDelete={setLotUidToDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((prev) => prev - 1)}>
              Precedent
            </Button>
            <span className="text-sm text-zinc-600">Page {page + 1}</span>
            <Button size="sm" variant="outline" disabled={!hasNextPage} onClick={() => setPage((prev) => prev + 1)}>
              Suivant
            </Button>
          </div>
        </CardContent>
      </Card>
      {lotUidToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirmer la suppression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-600">
                Etes-vous sur de vouloir supprimer ce lot ? Cette action est irreversible.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setLotUidToDelete(null)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={() => void confirmDelete()}>
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

type LotRowProps = {
  lot: Lot;
  editingUid: string | null;
  onStartEdit: (uid: string) => void;
  onSave: (lotUid: string, status: string, storageDate: string) => Promise<void>;
  onRequestDelete: (lotUid: string) => void;
};

function LotRow({ lot, editingUid, onStartEdit, onSave, onRequestDelete }: LotRowProps) {
  const [editStatus, setEditStatus] = useState(lot.status);
  const [editDate, setEditDate] = useState(lot.storage_date);
  const isEditing = editingUid === lot.lot_uid;

  return (
    <TableRow>
      <TableCell>{lot.lot_uid}</TableCell>
      <TableCell>{lot.warehouse_id}</TableCell>
      <TableCell>
        {isEditing ? (
          <Input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} />
        ) : (
          lot.storage_date
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Select value={editStatus} onChange={(event) => setEditStatus(event.target.value)}>
            <option value="conforme">conforme</option>
            <option value="alerte">alerte</option>
            <option value="perime">perime</option>
          </Select>
        ) : (
          lot.status
        )}
      </TableCell>
      <TableCell className="space-x-2">
        {isEditing ? (
          <Button size="sm" onClick={() => void onSave(lot.lot_uid, editStatus, editDate)}>Sauver</Button>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => onStartEdit(lot.lot_uid)} aria-label="Modifier">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onRequestDelete(lot.lot_uid)} aria-label="Supprimer">
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </TableCell>
    </TableRow>
  );
}
