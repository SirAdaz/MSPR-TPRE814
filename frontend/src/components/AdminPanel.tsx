"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Admin - Utilisateurs & Roles</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={createUser}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" type="password" />
            <Select value={role} onChange={(e) => setRole(e.target.value as "user" | "admin")}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </Select>
            <Button className="md:col-span-4" type="submit">Ajouter utilisateur</Button>
          </form>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Nom</TableHead><TableHead>Role</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name ?? "-"}</TableCell>
                  <TableCell>{user.role ?? "user"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => void setUserRole(user.id, "user")}>Role user</Button>
                    <Button size="sm" variant="secondary" onClick={() => void setUserRole(user.id, "admin")}>Role admin</Button>
                    <Button size="sm" variant="destructive" onClick={() => void deleteUser(user.id)}>Supprimer</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
