import { fetchJson } from "@/lib/client";

describe("fetchJson", () => {
  const originalFetch = global.fetch;
  const originalWindow = global.window;

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(global, "window", {
      value: originalWindow,
      configurable: true,
      writable: true,
    });
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

  it("uses raw url on browser runtime", async () => {
    Object.defineProperty(global, "window", {
      value: {},
      configurable: true,
      writable: true,
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as unknown as typeof fetch;

    await fetchJson<{ ok: boolean }>("/api/client");
    expect(global.fetch).toHaveBeenCalledWith("/api/client", { cache: "no-store" });
  });
});
