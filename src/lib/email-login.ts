import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { getChatPassword } from "@/lib/password-auth";

/**
 * Email-link login for the whitelist.
 *
 * A sign-in link carries a short-lived HMAC token bound to one email. The
 * signature is domain-separated from session tokens (the payload is prefixed
 * "login" before signing), so a link pasted into the cookie is not a session
 * and a stolen cookie is not a link. Same secret as everything else here:
 * EVE_CHAT_PASSWORD — rotating it invalidates links and sessions together,
 * which is the behaviour you want from a panic rotation.
 *
 * Whitelisting is a flag on the existing waitlist: everyone signs up on the
 * landing page, and the people we let in get enable_account=true —
 *
 *   update waitlist_signups set enable_account = true where email = '…';
 */

const LOGIN_TOKEN_MAX_AGE = 60 * 15;

const sql = neon(process.env.DATABASE_URL!);

export function createLoginToken(email: string, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + LOGIN_TOKEN_MAX_AGE;
  const payload = `v1.${expiresAt}.${Buffer.from(email).toString("base64url")}`;

  return `${payload}.${signLogin(payload)}`;
}

export function verifyLoginToken(token: string | undefined | null, now = Date.now()) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 4 || parts[0] !== "v1") {
    return null;
  }

  const [, expiresAtRaw, encodedEmail, signature] = parts;
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) {
    return null;
  }

  const expected = signLogin(`v1.${expiresAt}.${encodedEmail}`);

  if (!timingSafeEqual(hash(signature), hash(expected))) {
    return null;
  }

  const email = Buffer.from(encodedEmail, "base64url").toString();

  return email.length > 0 ? email : null;
}

/** Matches the normalisation in waitlist.ts and the unique index in sql/. */
export async function isAccountEnabled(email: string) {
  const rows = await sql`
    select 1 from waitlist_signups
    where lower(btrim(email)) = ${email} and enable_account
    limit 1
  `;

  return rows.length > 0;
}

/**
 * Resend when a key is present; the server console in local dev. Anything
 * else is a deployment mistake, logged but never surfaced to the visitor —
 * the /gate response must not reveal whether an email was attempted.
 */
export async function sendLoginEmail(email: string, url: string) {
  const key = process.env.RESEND_API_KEY?.trim();

  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[email-login] sign-in link for ${email}: ${url}`);
      return;
    }

    console.error("[email-login] RESEND_API_KEY is not set; sign-in link not sent.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: process.env.LOGIN_EMAIL_FROM?.trim() || "Omen <onboarding@resend.dev>",
      subject: "Your Omen sign-in link",
      text: [
        "Here is your sign-in link. It expires in 15 minutes.",
        "",
        url,
        "",
        "If you didn't request this, ignore it — nobody gets in without your inbox.",
      ].join("\n"),
      to: [email],
    }),
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    console.error(`[email-login] Resend responded ${response.status} for ${email}.`);
  }
}

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

function signLogin(payload: string) {
  return createHmac("sha256", getChatPassword()).update(`login.${payload}`).digest("base64url");
}
