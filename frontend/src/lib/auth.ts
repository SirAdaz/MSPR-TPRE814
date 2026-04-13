import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.AUTH_DATABASE_URL ??
    "postgresql://futurekawa:futurekawa@postgres-br:5432/futurekawa_br",
});

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  plugins: [admin()],
  secret: process.env.BETTER_AUTH_SECRET ?? "change-me-dev-secret",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});
