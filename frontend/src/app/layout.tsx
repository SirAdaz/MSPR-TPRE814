import "./globals.css";
import Link from "next/link";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { auth } from "@/lib/auth";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email ?? "";
  const initial = email ? email[0].toUpperCase() : "";

  return (
    <html lang="fr">
      <body className="min-h-screen bg-base-100 text-base-content">
        <header className="border-b border-base-300 bg-base-200/70">
          <div className="navbar mx-auto max-w-6xl px-4">
            <div className="navbar-start">
              <Link className="text-xl font-bold tracking-tight" href="/">
                FutureKawa
              </Link>
            </div>
            <div className="navbar-end gap-2">
              {session ? (
                <>
                  <Link className="btn btn-primary btn-sm" href="/admin">
                    Panel Admin
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="hidden text-right md:block">
                      <p className="text-xs opacity-70">Connecte</p>
                      <p className="text-sm font-medium">{email}</p>
                    </div>
                    <div className="avatar online placeholder" title={email}>
                      <div className="flex w-10 items-center justify-center rounded-full bg-primary text-primary-content ring ring-primary ring-offset-2 ring-offset-base-100">
                        <span className="text-sm font-bold leading-none">{initial}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link className="btn btn-outline btn-sm" href="/login">
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
