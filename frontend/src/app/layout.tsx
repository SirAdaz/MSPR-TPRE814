import "./globals.css";
import Link from "next/link";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email ?? "";
  const initial = email ? email[0].toUpperCase() : "";

  return (
    <html lang="fr">
      <body className="min-h-screen bg-base-100 text-base-content">
        <header className="border-b border-base-300 bg-base-100">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
            <div>
              <Link className="text-lg font-semibold tracking-tight" href="/">
                FutureKawa
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {session ? (
                <>
                  <Link className="btn btn-ghost btn-sm" href="/admin">
                    Panel Admin
                  </Link>
                  <LogoutButton />
                  <div className="avatar online placeholder" title={email}>
                    <div className="flex w-8 items-center justify-center rounded-full bg-neutral text-neutral-content">
                      <span className="text-xs font-bold leading-none">{initial}</span>
                    </div>
                  </div>
                </>
              ) : (
                <Link className="btn btn-primary btn-sm" href="/login">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
