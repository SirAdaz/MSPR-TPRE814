import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "BR", name: "Bresil" },
    { id: "EC", name: "Equateur" },
    { id: "CO", name: "Colombie" },
  ]);
}
