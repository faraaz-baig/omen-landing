import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SubmitButton } from "./submit-button";
import {
  PASSWORD_SESSION_COOKIE_NAME,
  PASSWORD_SESSION_MAX_AGE,
  createPasswordSessionToken,
  verifyChatPassword,
} from "@/lib/password-auth";

export const metadata = { title: "heyomen.com" };

async function signIn(formData: FormData) {
  "use server";

  if (!verifyChatPassword(String(formData.get("password") ?? ""))) {
    redirect("/gate?error=1");
  }

  (await cookies()).set(PASSWORD_SESSION_COOKIE_NAME, createPasswordSessionToken(), {
    httpOnly: true,
    maxAge: PASSWORD_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/preview");
}

export default async function Gate({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const failed = (await searchParams).error === "1";

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <form action={signIn} className="w-full max-w-sm">
        <h1 className="text-[22px] leading-8 tracking-[-0.015em]">
          This file is private.
        </h1>
        <p className="mt-2 text-[15px] leading-7 text-ink-2">
          Enter the password to continue.
        </p>

        <input
          aria-label="Password"
          autoComplete="current-password"
          autoFocus
          className="mt-6 w-full border border-ink/15 bg-paper px-4 py-3 text-[16px] leading-6 outline-none transition-colors focus:border-ink/35"
          name="password"
          placeholder="Password"
          required
          type="password"
        />

        {failed && (
          <p className="mt-3 text-[13px] text-ember">
            That password is not right.
          </p>
        )}

        <SubmitButton>Enter</SubmitButton>
      </form>
    </main>
  );
}
