"use client";

import { FormEvent, useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

type UserRecord = {
  id: string;
  email: string;
  role?: string;
  name?: string | null;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [email, setEmail] = useState("user@futurekawa.local");
  const [password, setPassword] = useState("User123!");
  const [name, setName] = useState("Nouveau User");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [error, setError] = useState<string | null>(null);

  async function refreshUsers() {
    const result = await authClient.admin.listUsers({ query: { limit: 100 } });
    if (result.error) {
      setError(result.error.message ?? "Impossible de charger les users");
      return;
    }
    setUsers((result.data?.users ?? []) as UserRecord[]);
  }

  useEffect(() => {
    void refreshUsers();
  }, []);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const result = await authClient.admin.createUser({ email, password, name, role });
    if (result.error) {
      setError(result.error.message ?? "Creation impossible");
      return;
    }
    await refreshUsers();
  }

  async function deleteUser(userId: string) {
    const result = await authClient.admin.removeUser({ userId });
    if (result.error) {
      setError(result.error.message ?? "Suppression impossible");
      return;
    }
    await refreshUsers();
  }

  async function setUserRole(userId: string, newRole: "user" | "admin") {
    const result = await authClient.admin.setRole({ userId, role: newRole });
    if (result.error) {
      setError(result.error.message ?? "Modification role impossible");
      return;
    }
    await refreshUsers();
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin - Utilisateurs & Roles</h1>
      <form className="card bg-base-200 shadow-sm" onSubmit={createUser}>
        <div className="card-body grid gap-3 md:grid-cols-4">
          <input className="input input-bordered" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nom" />
          <input className="input input-bordered" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" type="email" />
          <input className="input input-bordered" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Mot de passe" type="password" />
            <select
              className="select select-bordered"
              value={role}
              onChange={(e)=>setRole(e.target.value as "user" | "admin")}
            >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button className="btn btn-primary md:col-span-4" type="submit">Ajouter utilisateur</button>
        </div>
      </form>

      {error ? <p className="text-error">{error}</p> : null}

      <div className="overflow-x-auto rounded-box bg-base-200 p-3">
        <table className="table">
          <thead><tr><th>Email</th><th>Nom</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name ?? "-"}</td>
                <td>{user.role ?? "user"}</td>
                <td className="space-x-2">
                  <button className="btn btn-xs" onClick={() => void setUserRole(user.id, "user")}>Role user</button>
                  <button className="btn btn-xs btn-secondary" onClick={() => void setUserRole(user.id, "admin")}>Role admin</button>
                  <button className="btn btn-xs btn-error" onClick={() => void deleteUser(user.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
