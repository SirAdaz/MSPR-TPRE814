import { NextRequest, NextResponse } from "next/server";

import { countryApiMap } from "@/lib/countries";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = id as keyof typeof countryApiMap;
  const baseUrl = countryApiMap[key] ?? countryApiMap.BR;
  const warehouseId = request.nextUrl.searchParams.get("warehouse_id") ?? "1";
  const response = await fetch(`${baseUrl}/api/v1/readings?warehouse_id=${warehouseId}`, { cache: "no-store" });
  const data = await response.json();
  return NextResponse.json(data);
}
