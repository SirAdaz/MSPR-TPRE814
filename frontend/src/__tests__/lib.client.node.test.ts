/** @jest-environment node */

describe("fetchJson in node runtime", () => {
  const originalFetch = global.fetch;
  const originalBetterAuthUrl = process.env.BETTER_AUTH_URL;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.BETTER_AUTH_URL = originalBetterAuthUrl;
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("prefixes relative url with BETTER_AUTH_URL", async () => {
    process.env.BETTER_AUTH_URL = "https://example.local";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as unknown as typeof fetch;

    const { fetchJson } = require("@/lib/client");
    await fetchJson<{ ok: boolean }>("/api/test");
    expect(global.fetch).toHaveBeenCalledWith("https://example.local/api/test", { cache: "no-store" });
  });

  it("uses localhost fallback when BETTER_AUTH_URL is missing", async () => {
    delete process.env.BETTER_AUTH_URL;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as unknown as typeof fetch;

    const { fetchJson } = require("@/lib/client");
    await fetchJson<{ ok: boolean }>("/api/test");
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/test", { cache: "no-store" });
  });

  it("does not prefix absolute urls", async () => {
    process.env.BETTER_AUTH_URL = "https://example.local";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as unknown as typeof fetch;

    const { fetchJson } = require("@/lib/client");
    await fetchJson<{ ok: boolean }>("https://service.local/ping");
    expect(global.fetch).toHaveBeenCalledWith("https://service.local/ping", { cache: "no-store" });
  });
});
