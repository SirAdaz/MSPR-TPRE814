"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <h1 className="card-title">Connexion Siege</h1>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input className="input input-bordered w-full" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input input-bordered w-full" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="btn btn-primary w-full" type="submit">Se connecter</button>
          </form>
          {error ? <p className="text-error text-sm">{error}</p> : null}
          <p className="text-xs opacity-70">Compte demo: admin@futurekawa.local / Admin123!</p>
        </div>
      </div>
    </main>
  );
}
