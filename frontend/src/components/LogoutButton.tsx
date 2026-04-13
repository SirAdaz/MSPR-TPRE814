"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

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
    <Button variant="outline" size="sm" disabled={loading} onClick={() => void handleLogout()}>
      {loading ? "Deconnexion..." : "Deconnexion"}
    </Button>
  );
}
