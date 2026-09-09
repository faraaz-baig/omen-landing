import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OmenMark } from "../omen-mark";
import { SubmitButton } from "./submit-button";
import { createLoginToken, isAccountEnabled, sendLoginEmail } from "@/lib/email-login";

export const metadata = { title: "Log in - OMEN" };

const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

/**
 * The response is identical whether or not the email is whitelisted. /preview
 * holds health data, so /gate must not double as an oracle for who has an
 * account — the only place the difference shows is the inbox.
 */
async function requestLink(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (email.length === 0 || email.length > 254 || !LOOKS_LIKE_EMAIL.test(email)) {
    redirect("/gate?error=email");
  }

  if (await isAccountEnabled(email)) {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    const url = new URL("/gate/verify", `${protocol}://${host}`);

    url.searchParams.set("token", createLoginToken(email));
    await sendLoginEmail(email, url.toString());
  }

  redirect("/gate?sent=1");
}

export default async function Gate({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const badEmail = params.error === "email";
  const expired = params.error === "expired";

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <OmenMark className="h-6 w-auto text-ink" />

        {sent ? (
          <>
            <h1 className="mt-7 text-[22px] leading-8 tracking-[-0.015em]">
              Check your email.
            </h1>
            <p className="mt-2 text-[15px] leading-7 text-ink-2">
              If that address is on the list, a sign-in link is on its way. It
              expires in 15 minutes.
            </p>
            <p className="mt-6 text-[13px] leading-6 text-ink-2">
              Nothing arriving? Check spam, or{" "}
              <a className="text-ink underline underline-offset-2" href="/gate">
                try again
              </a>
              .
            </p>
          </>
        ) : (
          <form action={requestLink}>
            <h1 className="mt-7 text-[22px] leading-8 tracking-[-0.015em]">
              Log in to Omen.
            </h1>
            <p className="mt-2 text-[15px] leading-7 text-ink-2">
              Enter your email and we&apos;ll send a sign-in link — no password
              to remember.
            </p>

            <input
              aria-label="Email"
              autoComplete="email"
              autoFocus
              className="mt-6 w-full border border-ink/15 bg-paper px-4 py-3 text-[16px] leading-6 outline-none transition-colors focus:border-ink/35"
              inputMode="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />

            {badEmail && (
              <p className="mt-3 text-[13px] text-ember">
                That doesn&apos;t look like an email address.
              </p>
            )}
            {expired && (
              <p className="mt-3 text-[13px] text-ember">
                That link has expired or already been replaced. Request a new
                one.
              </p>
            )}

            <SubmitButton>Email me a link</SubmitButton>

            <p className="mt-6 text-[13px] leading-6 text-ink-2">
              Omen is in early access. Not in yet?{" "}
              <a className="text-ink underline underline-offset-2" href="/">
                Join the waitlist
              </a>
              .
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
