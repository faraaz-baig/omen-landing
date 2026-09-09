import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const PASSWORD_SESSION_COOKIE_NAME = "eve_chat_session";
export const PASSWORD_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const TOKEN_VERSION = "v1";

export function getChatPassword() {
  return process.env.EVE_CHAT_PASSWORD?.trim() ?? "";
}

export function verifyChatPassword(candidate: string) {
  const expected = getChatPassword();

  if (!expected) {
    return false;
  }

  return timingSafeEqual(hash(candidate), hash(expected));
}

export function createPasswordSessionToken(now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + PASSWORD_SESSION_MAX_AGE;
  const payload = `${TOKEN_VERSION}.${expiresAt}`;
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

/**
 * v2 tokens carry the email of the person who clicked a sign-in link, so a
 * session knows who it belongs to. v1 (shared-password) tokens stay valid —
 * both verify below — so flipping /gate to email login logs nobody out.
 */
export function createEmailSessionToken(email: string, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + PASSWORD_SESSION_MAX_AGE;
  const payload = `v2.${expiresAt}.${Buffer.from(email).toString("base64url")}`;

  return `${payload}.${sign(payload)}`;
}

export function verifyPasswordSessionToken(token: string | undefined, now = Date.now()) {
  return getSessionEmailFromToken(token, now) !== null;
}

/**
 * Returns the session's email, "" for a legacy shared-password session, or
 * null when the token is missing, malformed, expired, or forged.
 */
export function getSessionEmailFromToken(
  token: string | undefined,
  now = Date.now(),
): string | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  const [version, expiresAtRaw] = parts;
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) {
    return null;
  }

  if (version === TOKEN_VERSION && parts.length === 3) {
    const signature = parts[2];
    const expected = sign(`${version}.${expiresAt}`);

    return timingSafeEqual(hash(signature), hash(expected)) ? "" : null;
  }

  if (version === "v2" && parts.length === 4) {
    const [, , encodedEmail, signature] = parts;
    const expected = sign(`v2.${expiresAt}.${encodedEmail}`);

    if (!timingSafeEqual(hash(signature), hash(expected))) {
      return null;
    }

    const email = Buffer.from(encodedEmail, "base64url").toString();

    return email.length > 0 ? email : null;
  }

  return null;
}

export function getPasswordSessionFromHeaders(headers: Headers) {
  const cookieHeader = headers.get("cookie");

  if (!cookieHeader) {
    return false;
  }

  const token = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim().split("="))
    .find(([name]) => name === PASSWORD_SESSION_COOKIE_NAME)?.[1];

  return verifyPasswordSessionToken(token ? decodeURIComponent(token) : undefined);
}

export function hasSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const publicHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host");

  if (!origin || !publicHost) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const forwardedProtocol = request.headers.get("x-forwarded-proto");

    return (
      originUrl.host === publicHost &&
      (!forwardedProtocol || originUrl.protocol === `${forwardedProtocol}:`)
    );
  } catch {
    return false;
  }
}

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

function sign(payload: string) {
  return createHmac("sha256", getChatPassword()).update(payload).digest("base64url");
}
