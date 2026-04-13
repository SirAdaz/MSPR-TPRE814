import { NextRequest, NextResponse } from "next/server";

import { countryApiMap } from "@/lib/countries";

const frontendApiKey = process.env.FRONTEND_API_KEY ?? "front-dev-key";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = id as keyof typeof countryApiMap;
  const baseUrl = countryApiMap[key] ?? countryApiMap.BR;
  const query = request.nextUrl.searchParams;
  const urlParams = new URLSearchParams({
    sort: query.get("sort") ?? "storage_date",
    order: query.get("order") ?? "asc",
  });
  const limit = query.get("limit");
  const offset = query.get("offset");
  if (limit) {
    urlParams.set("limit", limit);
  }
  if (offset) {
    urlParams.set("offset", offset);
  }

  const response = await fetch(`${baseUrl}/api/v1/lots?${urlParams.toString()}`, {
    cache: "no-store",
    headers: { "X-Frontend-Key": frontendApiKey },
  });
  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = id as keyof typeof countryApiMap;
  const baseUrl = countryApiMap[key] ?? countryApiMap.BR;
  const body = await request.json();

  const response = await fetch(`${baseUrl}/api/v1/lots`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Frontend-Key": frontendApiKey },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
