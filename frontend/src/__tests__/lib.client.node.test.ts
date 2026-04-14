/** @jest-environment node */

import { fetchJson } from "@/lib/client";

describe("fetchJson in node runtime", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("prefixes relative url with BETTER_AUTH_URL", async () => {
    process.env.BETTER_AUTH_URL = "https://example.local";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as unknown as typeof fetch;

    await fetchJson<{ ok: boolean }>("/api/test");
    expect(global.fetch).toHaveBeenCalledWith("https://example.local/api/test", { cache: "no-store" });
  });
});
