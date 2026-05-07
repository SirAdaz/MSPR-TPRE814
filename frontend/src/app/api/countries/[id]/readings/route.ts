import { NextRequest, NextResponse } from "next/server";

import { countryApiMap } from "@/lib/countries";

const frontendApiKey = process.env.FRONTEND_API_KEY ?? "front-dev-key";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = id as keyof typeof countryApiMap;
  const baseUrl = countryApiMap[key] ?? countryApiMap.BR;
  const warehouseId = request.nextUrl.searchParams.get("warehouse_id") ?? "1";
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const urlParams = new URLSearchParams({ warehouse_id: warehouseId });
  if (from) {
    urlParams.set("from", from);
  }
  if (to) {
    urlParams.set("to", to);
  }
  const response = await fetch(`${baseUrl}/api/v1/readings?${urlParams.toString()}`, {
    cache: "no-store",
    headers: { "X-Frontend-Key": frontendApiKey },
  });
  const data = await response.json();
  return NextResponse.json(data);
}
