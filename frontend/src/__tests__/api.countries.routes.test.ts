/** @jest-environment node */

import { NextRequest } from "next/server";

import { GET as getCountries } from "@/app/api/countries/route";
import { GET as getAlerts } from "@/app/api/countries/[id]/alerts/route";
import { GET as getLots, POST as postLots } from "@/app/api/countries/[id]/lots/route";
import {
  DELETE as deleteLot,
  GET as getLotByUid,
  PUT as putLot,
} from "@/app/api/countries/[id]/lots/[lotUid]/route";
import { GET as getReadings } from "@/app/api/countries/[id]/readings/route";

describe("countries api routes", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns static country list", async () => {
    const response = await getCountries();
    await expect(response.json()).resolves.toEqual([
      { id: "BR", name: "Bresil" },
      { id: "EC", name: "Equateur" },
      { id: "CO", name: "Colombie" },
    ]);
  });

  it("proxies lots list with query defaults", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [{ id: 1 }],
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/BR/lots");

    const response = await getLots(request, { params: Promise.resolve({ id: "BR" }) });
    await expect(response.json()).resolves.toEqual([{ id: 1 }]);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend-br:8000/api/v1/lots?sort=storage_date&order=asc",
      expect.objectContaining({
        headers: { "X-Frontend-Key": "front-dev-key" },
      }),
    );
  });

  it("proxies lots creation and forwards response status", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
      json: async () => ({ id: 10 }),
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/BR/lots", {
      method: "POST",
      body: JSON.stringify({ lot_uid: "LOT-10" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await postLots(request, { params: Promise.resolve({ id: "BR" }) });
    await expect(response.json()).resolves.toEqual({ id: 10 });
    expect(response.status).toBe(201);
  });

  it("falls back to BR backend for lots creation", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
      json: async () => ({ id: 11 }),
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/XX/lots", {
      method: "POST",
      body: JSON.stringify({ lot_uid: "LOT-11" }),
      headers: { "Content-Type": "application/json" },
    });

    await postLots(request, { params: Promise.resolve({ id: "XX" }) });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend-br:8000/api/v1/lots",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("proxies alerts with pagination query params", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [{ id: 3 }],
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/BR/alerts?limit=5&offset=10");

    const response = await getAlerts(request, { params: Promise.resolve({ id: "BR" }) });
    await expect(response.json()).resolves.toEqual([{ id: 3 }]);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend-br:8000/api/v1/alerts?limit=5&offset=10",
      expect.any(Object),
    );
  });

  it("proxies alerts without query params", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/BR/alerts");

    await getAlerts(request, { params: Promise.resolve({ id: "BR" }) });
    expect(global.fetch).toHaveBeenCalledWith("http://backend-br:8000/api/v1/alerts", expect.any(Object));
  });

  it("falls back to BR backend for unknown id on alerts", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/XX/alerts");

    await getAlerts(request, { params: Promise.resolve({ id: "XX" }) });
    expect(global.fetch).toHaveBeenCalledWith("http://backend-br:8000/api/v1/alerts", expect.any(Object));
  });

  it("proxies readings and defaults warehouse id", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [{ id: 1, warehouse_id: 1 }],
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/BR/readings");

    const response = await getReadings(request, { params: Promise.resolve({ id: "BR" }) });
    await expect(response.json()).resolves.toEqual([{ id: 1, warehouse_id: 1 }]);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend-br:8000/api/v1/readings?warehouse_id=1",
      expect.any(Object),
    );
  });

  it("proxies readings with custom warehouse id", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/BR/readings?warehouse_id=42");

    await getReadings(request, { params: Promise.resolve({ id: "BR" }) });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend-br:8000/api/v1/readings?warehouse_id=42",
      expect.any(Object),
    );
  });

  it("falls back to BR backend for unknown id on readings", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/XX/readings?warehouse_id=2");

    await getReadings(request, { params: Promise.resolve({ id: "XX" }) });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend-br:8000/api/v1/readings?warehouse_id=2",
      expect.any(Object),
    );
  });

  it("falls back to BR backend for unknown country id", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;
    const request = new NextRequest("http://localhost/api/countries/XX/lots?sort=storage_date&order=desc");

    await getLots(request, { params: Promise.resolve({ id: "XX" }) });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend-br:8000/api/v1/lots?sort=storage_date&order=desc",
      expect.any(Object),
    );
  });

  it("proxies lots list with limit and offset", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;
    const request = new NextRequest(
      "http://localhost/api/countries/BR/lots?sort=storage_date&order=asc&limit=5&offset=10",
    );

    await getLots(request, { params: Promise.resolve({ id: "BR" }) });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend-br:8000/api/v1/lots?sort=storage_date&order=asc&limit=5&offset=10",
      expect.any(Object),
    );
  });

  it("proxies lot by uid read/update/delete", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, json: async () => ({ id: 1 }) })
      .mockResolvedValueOnce({ status: 200, json: async () => ({ updated: true }) })
      .mockResolvedValueOnce({ status: 200, json: async () => ({ deleted: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const getResponse = await getLotByUid(new NextRequest("http://localhost"), {
      params: Promise.resolve({ id: "BR", lotUid: "LOT-1" }),
    });
    await expect(getResponse.json()).resolves.toEqual({ id: 1 });

    const putRequest = new NextRequest("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ status: "perime" }),
      headers: { "Content-Type": "application/json" },
    });
    const putResponse = await putLot(putRequest, {
      params: Promise.resolve({ id: "BR", lotUid: "LOT-1" }),
    });
    await expect(putResponse.json()).resolves.toEqual({ updated: true });

    const deleteResponse = await deleteLot(new NextRequest("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "BR", lotUid: "LOT-1" }),
    });
    await expect(deleteResponse.json()).resolves.toEqual({ deleted: true });
  });

  it("falls back to BR backend for lot by uid routes", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, json: async () => ({ id: 1 }) })
      .mockResolvedValueOnce({ status: 200, json: async () => ({ updated: true }) })
      .mockResolvedValueOnce({ status: 200, json: async () => ({ deleted: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await getLotByUid(new NextRequest("http://localhost"), {
      params: Promise.resolve({ id: "XX", lotUid: "LOT-1" }),
    });
    await putLot(
      new NextRequest("http://localhost", {
        method: "PUT",
        body: JSON.stringify({ status: "conforme" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "XX", lotUid: "LOT-1" }) },
    );
    await deleteLot(new NextRequest("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "XX", lotUid: "LOT-1" }),
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://backend-br:8000/api/v1/lots/LOT-1",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://backend-br:8000/api/v1/lots/LOT-1",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://backend-br:8000/api/v1/lots/LOT-1",
      expect.any(Object),
    );
  });
});
