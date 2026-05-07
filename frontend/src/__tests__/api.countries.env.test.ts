/** @jest-environment node */

import { NextRequest } from "next/server";

describe("countries api routes env", () => {
  const originalFetch = global.fetch;
  const originalFrontendApiKey = process.env.FRONTEND_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.FRONTEND_API_KEY = originalFrontendApiKey;
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("uses FRONTEND_API_KEY from environment", async () => {
    process.env.FRONTEND_API_KEY = "front-custom-key";
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;

    const { GET: getAlerts } = await import("@/app/api/countries/[id]/alerts/route");
    const request = new NextRequest("http://localhost/api/countries/BR/alerts");

    await getAlerts(request, { params: Promise.resolve({ id: "BR" }) });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend-br:8000/api/v1/alerts",
      expect.objectContaining({
        headers: { "X-Frontend-Key": "front-custom-key" },
      }),
    );
  });

  it("uses FRONTEND_API_KEY for all country proxy routes", async () => {
    process.env.FRONTEND_API_KEY = "front-custom-key";
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;

    const { GET: getLots } = await import("@/app/api/countries/[id]/lots/route");
    const { GET: getLotByUid } = await import("@/app/api/countries/[id]/lots/[lotUid]/route");
    const { GET: getReadings } = await import("@/app/api/countries/[id]/readings/route");
    const { GET: getWarehouses } = await import("@/app/api/countries/[id]/warehouses/route");

    await getLots(new NextRequest("http://localhost/api/countries/BR/lots"), { params: Promise.resolve({ id: "BR" }) });
    await getLotByUid(new NextRequest("http://localhost"), { params: Promise.resolve({ id: "BR", lotUid: "LOT-1" }) });
    await getReadings(new NextRequest("http://localhost/api/countries/BR/readings"), { params: Promise.resolve({ id: "BR" }) });
    await getWarehouses(new NextRequest("http://localhost"), { params: Promise.resolve({ id: "BR" }) });

    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(4);
    for (const [, options] of calls) {
      expect(options).toMatchObject({
        headers: expect.objectContaining({ "X-Frontend-Key": "front-custom-key" }),
      });
    }
  });
});
