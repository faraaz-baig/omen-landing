"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export type WaitlistResult = { ok: true } | { ok: false; message: string };

/**
 * Deliberately loose. Full RFC 5322 validation rejects addresses that work and
 * accepts ones that don't; the only thing worth catching here is an obvious
 * typo. Delivery is the real test.
 */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

export async function joinWaitlist(email: string): Promise<WaitlistResult> {
  // Normalise before validating or storing, so "  Foo@Bar.com " and
  // "foo@bar.com" are one person. sql/waitlist_signups.sql carries the same
  // rule in its unique index, for writers that are not this function.
  const value = email.trim().toLowerCase();

  // Cap before touching the database: the column is unbounded text, so an
  // arbitrarily long string is a free write amplification for a stranger.
  if (value.length === 0 || value.length > 254 || !LOOKS_LIKE_EMAIL.test(value)) {
    return { ok: false, message: "That doesn't look like an email address." };
  }

  try {
    // Signing up twice is not an error worth showing anyone.
    await sql`
      insert into waitlist_signups (email, source)
      values (${value}, 'landing')
      on conflict do nothing
    `;
    return { ok: true };
  } catch {
    // Never surface a driver message to the page — it leaks schema and host.
    return { ok: false, message: "Something went wrong. Try again." };
  }
}
