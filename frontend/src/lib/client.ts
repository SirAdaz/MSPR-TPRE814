export async function fetchJson<T>(url: string): Promise<T> {
  const isServer = typeof window === "undefined";
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const targetUrl = isServer && url.startsWith("/") ? `${baseUrl}${url}` : url;
  const response = await fetch(targetUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}
