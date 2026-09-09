import { NextResponse, type NextRequest } from "next/server";
import { isAccountEnabled, verifyLoginToken } from "@/lib/email-login";
import {
  PASSWORD_SESSION_COOKIE_NAME,
  PASSWORD_SESSION_MAX_AGE,
  createEmailSessionToken,
} from "@/lib/password-auth";

/**
 * The link in the sign-in email lands here. The whitelist is re-checked at
 * click time, not just at send time — flipping enable_account off revokes a
 * link that is already sitting in someone's inbox.
 */
export async function GET(request: NextRequest) {
  const email = verifyLoginToken(request.nextUrl.searchParams.get("token"));

  const fail = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/gate";
    url.search = "?error=expired";
    return NextResponse.redirect(url);
  };

  if (!email || !(await isAccountEnabled(email))) {
    return fail();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = "/preview";
  destination.search = "";

  const response = NextResponse.redirect(destination);

  response.cookies.set(PASSWORD_SESSION_COOKIE_NAME, createEmailSessionToken(email), {
    httpOnly: true,
    maxAge: PASSWORD_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
