import { redirect } from "next/navigation";

import AdminPanel from "@/components/AdminPanel";
import { requireSession } from "@/lib/server-auth";

export default async function AdminPage() {
  const session = await requireSession();
  const email = session.user?.email ?? "";
  const role = session.user?.role ?? "user";
  const isAdmin = role === "admin" || email === (process.env.DEFAULT_ADMIN_EMAIL ?? "admin@futurekawa.local");
  if (!isAdmin) {
    redirect("/");
  }

  return <AdminPanel />;
}
