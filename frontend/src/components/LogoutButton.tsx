"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    router.push("/login");
    router.refresh();
    setLoading(false);
  }

  return (
    <button className="btn btn-outline btn-sm" disabled={loading} onClick={() => void handleLogout()}>
      {loading ? "Deconnexion..." : "Deconnexion"}
    </button>
  );
}
