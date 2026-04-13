"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";

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

const ROLE_OPTIONS = [
  { value: "responsable_exploitation_br", label: "Responsable d’exploitation (Brésil)" },
  { value: "responsable_exploitation_ec", label: "Responsable d’exploitation (Équateur)" },
  { value: "responsable_exploitation_co", label: "Responsable d’exploitation (Colombie)" },
  { value: "responsable_entrepot", label: "Responsable d’entrepôt" },
  { value: "equipe_qualite", label: "Équipe Qualité" },
  { value: "equipe_supply_chain", label: "Équipe Supply Chain" },
  { value: "siege", label: "Siège" },
  { value: "admin", label: "Admin" },
] as const;
const PAGE_SIZE = 10;

export default function AdminPanel() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [email, setEmail] = useState("user@futurekawa.local");
  const [password, setPassword] = useState("User123!");
  const [name, setName] = useState("Nouveau User");
  const [role, setRole] = useState<string>("siege");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<string>("siege");
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshUsers() {
    const result = await authClient.admin.listUsers({
      query: { limit: PAGE_SIZE + 1, offset: page * PAGE_SIZE },
    });
    if (result.error) {
      setError(result.error.message ?? "Impossible de charger les users");
      return;
    }
    const allUsers = (result.data?.users ?? []) as UserRecord[];
    setHasNextPage(allUsers.length > PAGE_SIZE);
    setUsers(allUsers.slice(0, PAGE_SIZE));
  }

  useEffect(() => {
    void refreshUsers();
  }, [page]);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const accessRole: "user" | "admin" = role === "admin" ? "admin" : "user";
    const result = await authClient.admin.createUser({ email, password, name, role: accessRole });
    if (result.error) {
      setError(result.error.message ?? "Creation impossible");
      return;
    }
    if (result.data?.user?.id && role !== accessRole) {
      const customRoleResult = await authClient.admin.updateUser({
        userId: result.data.user.id,
        data: { role },
      });
      if (customRoleResult.error) {
        setError(customRoleResult.error.message ?? "Mise a jour du role metier impossible");
      }
    }
    setEmail("user@futurekawa.local");
    setPassword("User123!");
    setName("Nouveau User");
    setRole("siege");
    if (page === 0) {
      await refreshUsers();
      return;
    }
    setPage(0);
  }

  async function deleteUser(userId: string) {
    const result = await authClient.admin.removeUser({ userId });
    if (result.error) {
      setError(result.error.message ?? "Suppression impossible");
      return;
    }
    await refreshUsers();
  }

  function startEdit(user: UserRecord) {
    setEditingUserId(user.id);
    setEditEmail(user.email);
    setEditName(user.name ?? "");
    setEditRole(user.role ?? "siege");
  }

  function cancelEdit() {
    setEditingUserId(null);
    setEditEmail("");
    setEditName("");
    setEditRole("siege");
  }

  async function saveEdit(userId: string) {
    setError(null);
    const accessRole: "user" | "admin" = editRole === "admin" ? "admin" : "user";
    const accessRoleResult = await authClient.admin.setRole({ userId, role: accessRole });
    if (accessRoleResult.error) {
      setError(accessRoleResult.error.message ?? "Mise a jour du role d'acces impossible");
      return;
    }

    const updateResult = await authClient.admin.updateUser({
      userId,
      data: { email: editEmail, name: editName, role: editRole },
    });
    if (updateResult.error) {
      setError(updateResult.error.message ?? "Mise a jour impossible");
      return;
    }

    cancelEdit();
    await refreshUsers();
  }

  async function confirmDelete() {
    if (!userIdToDelete) {
      return;
    }
    await deleteUser(userIdToDelete);
    setUserIdToDelete(null);
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
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLE_OPTIONS.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
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
                  <TableCell>
                    {editingUserId === user.id ? (
                      <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" />
                    ) : (
                      user.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUserId === user.id ? (
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    ) : (
                      user.name ?? "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUserId === user.id ? (
                      <Select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                        {ROLE_OPTIONS.map((roleOption) => (
                          <option key={roleOption.value} value={roleOption.value}>
                            {roleOption.label}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      ROLE_OPTIONS.find((item) => item.value === (user.role ?? "siege"))?.label ?? (user.role ?? "siege")
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {editingUserId === user.id ? (
                      <>
                        <Button size="sm" onClick={() => void saveEdit(user.id)}>Enregistrer</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Annuler</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEdit(user)} aria-label="Modifier">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setUserIdToDelete(user.id)} aria-label="Supprimer">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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
      {userIdToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirmer la suppression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-600">
                Etes-vous sur de vouloir supprimer cet utilisateur ? Cette action est irreversible.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUserIdToDelete(null)}>
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
    </main>
  );
}
