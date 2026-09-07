import type { SetupStatus } from "@/lib/chat/types";
import { isDatabaseConfigured, isDatabaseSchemaReady } from "@/lib/db/client";

const PASSWORD_ENV_KEY = "EVE_CHAT_PASSWORD";
const AUTH_ENV_KEYS = [
  "BETTER_AUTH_SECRET",
  "NEXT_PUBLIC_VERCEL_APP_CLIENT_ID",
  "VERCEL_APP_CLIENT_SECRET",
] as const;

const CONNECTION_ENV_KEYS = [
  "LINEAR_CONNECTOR",
  "NOTION_CONNECTOR",
  "SENTRY_CONNECTOR",
] as const;

const RATE_LIMIT_ENV_GROUPS = [
  ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
] as const;

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}

export function isAuthConfigured() {
  return AUTH_ENV_KEYS.every(hasEnv);
}

export function isPasswordConfigured() {
  return Boolean(process.env.EVE_CHAT_PASSWORD?.trim());
}

export function isRateLimitConfigured() {
  return RATE_LIMIT_ENV_GROUPS.some((group) => group.every(hasEnv));
}

// OMEN: this preview deliberately runs single-user with localStorage
// persistence. DATABASE_URL exists in env for the genome panels, so the
// template's env sniffing would otherwise try database mode and block on a
// schema and auth stack we don't run.
const FORCE_LOCAL = true;

export function getInitialSetupStatus(): SetupStatus {
  return createSetupStatus({
    databaseSchemaReady: isDatabaseConfigured(),
  });
}

export async function getSetupStatus(): Promise<SetupStatus> {
  const databaseConfigured = isDatabaseConfigured();
  const fullEnvironmentReady =
    databaseConfigured && isAuthConfigured() && isRateLimitConfigured();
  const databaseSchemaReady = fullEnvironmentReady
    ? await isDatabaseSchemaReady()
    : false;

  return createSetupStatus({ databaseSchemaReady });
}

export async function isAppConfigured() {
  const status = await getSetupStatus();

  return status.appReady;
}

function createSetupStatus({
  databaseSchemaReady,
}: {
  readonly databaseSchemaReady: boolean;
}): SetupStatus {
  const databaseConfigured = isDatabaseConfigured();
  const vercelAuthReady = isAuthConfigured();
  const rateLimitReady = isRateLimitConfigured();
  const databaseReady = databaseConfigured && databaseSchemaReady;
  const fullEnvironmentReady = databaseConfigured && vercelAuthReady && rateLimitReady;
  const passwordReady = isPasswordConfigured();
  const localDevReady = isLocalDevelopment();
  // Omen has no external connections (Linear/Notion/Sentry stripped).
  const connectionsAvailable = false;

  if (!FORCE_LOCAL && fullEnvironmentReady) {
    return {
      appReady: databaseReady,
      authMode: "vercel",
      authReady: vercelAuthReady,
      connectionsAvailable,
      databaseConfigured,
      databaseReady,
      databaseSchemaReady,
      missing: databaseSchemaReady ? [] : ["database migrations"],
      rateLimitReady,
      storageMode: "database",
    };
  }

  if (FORCE_LOCAL || passwordReady || localDevReady) {
    return {
      appReady: true,
      authMode: passwordReady ? "password" : "local-dev",
      authReady: true,
      connectionsAvailable,
      databaseConfigured,
      databaseReady,
      databaseSchemaReady,
      missing: [],
      rateLimitReady,
      storageMode: "browser",
    };
  }

  return {
    appReady: false,
    authMode: "unconfigured",
    authReady: false,
    connectionsAvailable,
    databaseConfigured,
    databaseReady,
    databaseSchemaReady,
    missing: [
      PASSWORD_ENV_KEY,
      "or DATABASE_URL, Better Auth/Vercel OAuth, and Upstash configuration",
    ],
    rateLimitReady,
    storageMode: "browser",
  };
}

function isLocalDevelopment() {
  return process.env.NODE_ENV === "development" && process.env.VERCEL !== "1";
}
