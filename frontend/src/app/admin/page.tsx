import { redirect } from "next/navigation";

import AdminPanel from "@/components/AdminPanel";
import { canAccessAdmin } from "@/lib/permissions";
import { requireSession } from "@/lib/server-auth";

export default async function AdminPage() {
  const session = await requireSession();
  const role = session.user?.role ?? "user";
  const isAdmin = canAccessAdmin(role);
  if (!isAdmin) {
    redirect("/");
  }

  return <AdminPanel />;
}
