import { NextRequest, NextResponse } from "next/server";

import { countryApiMap } from "@/lib/countries";

const frontendApiKey = process.env.FRONTEND_API_KEY ?? "front-dev-key";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = id as keyof typeof countryApiMap;
  const baseUrl = countryApiMap[key] ?? countryApiMap.BR;
  const query = request.nextUrl.searchParams;
  const urlParams = new URLSearchParams();
  const limit = query.get("limit");
  const offset = query.get("offset");
  const warehouseId = query.get("warehouse_id");
  if (limit) {
    urlParams.set("limit", limit);
  }
  if (offset) {
    urlParams.set("offset", offset);
  }
  if (warehouseId) {
    urlParams.set("warehouse_id", warehouseId);
  }
  const route = urlParams.toString() ? `/api/v1/alerts?${urlParams.toString()}` : "/api/v1/alerts";
  const response = await fetch(`${baseUrl}${route}`, {
    cache: "no-store",
    headers: { "X-Frontend-Key": frontendApiKey },
  });
  const data = await response.json();
  return NextResponse.json(data);
}
