import { NextRequest, NextResponse } from "next/server";

import { countryApiMap } from "@/lib/countries";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; lotUid: string }> },
) {
  const { id, lotUid } = await params;
  const key = id as keyof typeof countryApiMap;
  const baseUrl = countryApiMap[key] ?? countryApiMap.BR;
  const response = await fetch(`${baseUrl}/api/v1/lots/${lotUid}`, { cache: "no-store" });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lotUid: string }> },
) {
  const { id, lotUid } = await params;
  const key = id as keyof typeof countryApiMap;
  const baseUrl = countryApiMap[key] ?? countryApiMap.BR;
  const body = await request.json();

  const response = await fetch(`${baseUrl}/api/v1/lots/${lotUid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; lotUid: string }> },
) {
  const { id, lotUid } = await params;
  const key = id as keyof typeof countryApiMap;
  const baseUrl = countryApiMap[key] ?? countryApiMap.BR;

  const response = await fetch(`${baseUrl}/api/v1/lots/${lotUid}`, {
    method: "DELETE",
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
