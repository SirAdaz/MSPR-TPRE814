import { fetchJson } from "@/lib/client";

describe("fetchJson", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns parsed json when response is ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as unknown as typeof fetch;

    await expect(fetchJson<{ ok: boolean }>("/api/test")).resolves.toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith("/api/test", {
      cache: "no-store",
    });
  });

  it("throws when response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
    }) as unknown as typeof fetch;

    await expect(fetchJson("/api/test")).rejects.toThrow("HTTP 503");
  });
});
