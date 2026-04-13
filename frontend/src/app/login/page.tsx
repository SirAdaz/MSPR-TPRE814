"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@futurekawa.local");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    let result = await authClient.signIn.email({ email, password });
    if (result.error) {
      const signUp = await authClient.signUp.email({ email, password, name: "Admin" });
      if (signUp.error) {
        setError(result.error.message ?? "Connexion impossible");
        return;
      }
      result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Connexion impossible");
        return;
      }
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Connexion Siege</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button className="w-full" type="submit">Se connecter</Button>
          </form>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <p className="mt-3 text-xs text-zinc-500">Compte demo: admin@futurekawa.local / Admin123!</p>
        </CardContent>
      </Card>
    </main>
  );
}
