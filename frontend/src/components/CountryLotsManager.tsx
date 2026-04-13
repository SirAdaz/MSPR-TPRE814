"use client";

import { FormEvent, useEffect, useState } from "react";

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
  const [form, setForm] = useState<LotForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  async function loadLots() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/countries/${countryId}/lots`, { cache: "no-store" });
      const data = (await response.json()) as Lot[];
      setLots(data);
    } catch {
      setError("Impossible de charger les lots.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLots();
  }, [countryId]);

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
    await loadLots();
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

  return (
    <div className="space-y-6">
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Ajouter un lot</h2>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
            <input
              className="input input-bordered"
              placeholder="Lot UID"
              value={form.lot_uid}
              onChange={(event) => setForm((prev) => ({ ...prev, lot_uid: event.target.value }))}
              required
            />
            <input
              className="input input-bordered"
              type="number"
              min={1}
              value={form.warehouse_id}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, warehouse_id: Number(event.target.value) }))
              }
              required
            />
            <input
              className="input input-bordered"
              type="date"
              value={form.storage_date}
              onChange={(event) => setForm((prev) => ({ ...prev, storage_date: event.target.value }))}
              required
            />
            <select
              className="select select-bordered"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="conforme">conforme</option>
              <option value="alerte">alerte</option>
              <option value="perime">perime</option>
            </select>
            <button className="btn btn-primary md:col-span-4" type="submit">
              Ajouter
            </button>
          </form>
          {error ? <p className="text-error">{error}</p> : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-box bg-base-200 p-3">
        <table className="table">
          <thead>
            <tr>
              <th>Lot UID</th>
              <th>Entrepot</th>
              <th>Date stockage</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Chargement...</td>
              </tr>
            ) : (
              lots.map((lot) => (
                <LotRow
                  key={lot.id}
                  lot={lot}
                  editingUid={editingUid}
                  onStartEdit={setEditingUid}
                  onSave={handleUpdate}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type LotRowProps = {
  lot: Lot;
  editingUid: string | null;
  onStartEdit: (uid: string) => void;
  onSave: (lotUid: string, status: string, storageDate: string) => Promise<void>;
  onDelete: (lotUid: string) => Promise<void>;
};

function LotRow({ lot, editingUid, onStartEdit, onSave, onDelete }: LotRowProps) {
  const [editStatus, setEditStatus] = useState(lot.status);
  const [editDate, setEditDate] = useState(lot.storage_date);
  const isEditing = editingUid === lot.lot_uid;

  return (
    <tr>
      <td>{lot.lot_uid}</td>
      <td>{lot.warehouse_id}</td>
      <td>
        {isEditing ? (
          <input
            className="input input-bordered input-sm"
            type="date"
            value={editDate}
            onChange={(event) => setEditDate(event.target.value)}
          />
        ) : (
          lot.storage_date
        )}
      </td>
      <td>
        {isEditing ? (
          <select
            className="select select-bordered select-sm"
            value={editStatus}
            onChange={(event) => setEditStatus(event.target.value)}
          >
            <option value="conforme">conforme</option>
            <option value="alerte">alerte</option>
            <option value="perime">perime</option>
          </select>
        ) : (
          lot.status
        )}
      </td>
      <td className="space-x-2">
        {isEditing ? (
          <button className="btn btn-xs btn-success" onClick={() => void onSave(lot.lot_uid, editStatus, editDate)}>
            Sauver
          </button>
        ) : (
          <button className="btn btn-xs btn-info" onClick={() => onStartEdit(lot.lot_uid)}>
            Modifier
          </button>
        )}
        <button className="btn btn-xs btn-error" onClick={() => void onDelete(lot.lot_uid)}>
          Supprimer
        </button>
      </td>
    </tr>
  );
}
