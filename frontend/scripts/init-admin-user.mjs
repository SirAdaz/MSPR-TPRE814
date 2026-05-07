const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@futurekawa.local";
const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD ?? "Admin123!";
const ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME ?? "Admin";
const BASE_URL = process.env.BETTER_AUTH_URL_INTERNAL ?? "http://127.0.0.1:3000";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFrontendReady(retries = 40) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${BASE_URL}/login`, { method: "GET" });
      if (response.ok || response.status === 307) {
        return true;
      }
    } catch {
      // Keep retrying until Next.js is ready.
    }
    await sleep(1000);
  }
  return false;
}

async function ensureAdminUser() {
  const ready = await waitForFrontendReady();
  if (!ready) {
    console.error("[init-admin-user] frontend not ready, skipping admin init.");
    return;
  }

  const response = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: BASE_URL,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
      role: "admin",
    }),
  });

  if (response.ok) {
    console.log(`[init-admin-user] demo admin ensured: ${ADMIN_EMAIL}`);
    return;
  }

  const body = await response.text();
  const lowerBody = body.toLowerCase();
  if (lowerBody.includes("already") || lowerBody.includes("exists")) {
    console.log(`[init-admin-user] demo admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  console.error(`[init-admin-user] failed (${response.status}): ${body}`);
}

void ensureAdminUser().catch((error) => {
  console.error("[init-admin-user] unexpected error:", error);
});
