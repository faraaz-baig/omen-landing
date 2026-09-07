import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verification for the site's password-gate cookie.
 *
 * The agent deploys as its own Vercel service, and Vercel dispatches those
 * routes ahead of the Next.js proxy — so `src/proxy.ts` does NOT protect
 * `/eve/*` in production, only in local dev where the eve routes arrive via a
 * Next rewrite. eve's channel auth is the real gate for the agent API, and
 * this is what it checks.
 *
 * The token format must stay identical to the issuer in
 * `heyomen.com/src/lib/password-auth.ts`, which mints these cookies:
 *   `v1.<unix-expiry>.<base64url HMAC-SHA256 of "v1.<unix-expiry>">`
 * keyed on EVE_CHAT_PASSWORD. Rotating the password invalidates every
 * outstanding cookie, which is the intended behaviour.
 */

const COOKIE_NAME = "eve_chat_session";
const TOKEN_VERSION = "v1";

function password() {
  return process.env.EVE_CHAT_PASSWORD?.trim() ?? "";
}

/** sha256 both sides so timingSafeEqual always gets equal-length buffers. */
function sameString(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

function readCookie(header: string | null) {
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const raw = part.trim();
    const eq = raw.indexOf("=");
    if (eq === -1) continue;
    // indexOf, not split("="): a value containing "=" must survive intact.
    if (raw.slice(0, eq) === COOKIE_NAME) {
      return decodeURIComponent(raw.slice(eq + 1));
    }
  }
}

export function hasValidGateCookie(request: Request): boolean {
  const secret = password();
  if (!secret) return false;

  const token = readCookie(request.headers.get("cookie"));
  if (!token) return false;

  const [version, expiresAtRaw, signature, ...extra] = token.split(".");
  const expiresAt = Number(expiresAtRaw);

  if (
    version !== TOKEN_VERSION ||
    !signature ||
    extra.length > 0 ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${version}.${expiresAt}`)
    .digest("base64url");

  return sameString(signature, expected);
}
