import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";

import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import "./globals.css";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email ?? "";
  const role = session?.user?.role ?? "user";
  const initial = email ? email[0].toUpperCase() : "";
  const showAdmin = canAccessAdmin(role, email);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#f8f5f2] text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
            <Link className="text-lg font-semibold tracking-tight" href="/">
              FutureKawa
            </Link>
            <div className="flex items-center gap-2">
              {session ? (
                <>
                  {showAdmin ? <Link href="/admin"><Button size="sm" variant="ghost">Panel Admin</Button></Link> : null}
                  <LogoutButton />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white" title={email}>
                    {initial}
                  </div>
                </>
              ) : (
                <Link href="/login"><Button size="sm">Connexion</Button></Link>
              )}
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
