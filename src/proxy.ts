import { NextResponse, type NextRequest } from "next/server";
import { getChatPassword, getPasswordSessionFromHeaders } from "@/lib/password-auth";

/**
 * Password gate for the genome surface and the agent API.
 *
 * `/preview` renders real genotypes and medical inferences, and `/eve/*` is a
 * funded model endpoint — neither may be open to the internet. The marketing
 * page at `/` stays public.
 *
 * The `/eve/*` branch below only bites in local dev, where eve's routes arrive
 * through a Next rewrite that Proxy precedes. On Vercel the agent is a separate
 * service and the platform routes /eve/* straight to it, bypassing Next
 * entirely — verified in production, where an unauthenticated /eve/v1/health
 * returned 200 and /eve/v1/sessions 404'd from eve's own router rather than
 * 401'ing here. The agent's real gate is its channel auth walk in
 * omen-agent/agent/channels/eve.ts, which checks the same cookie.
 *
 * Proxy defaults to the Node.js runtime in Next 16, which is what makes the
 * node:crypto HMAC in password-auth usable at this layer.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fail closed. A missing password must lock the site, never silently expose
  // it — the failure mode of the opposite default is publishing health data.
  if (!getChatPassword()) {
    return new NextResponse(
      "EVE_CHAT_PASSWORD is not set. Refusing to serve protected routes.",
      { status: 503 },
    );
  }

  if (getPasswordSessionFromHeaders(request.headers)) {
    return NextResponse.next();
  }

  // The agent API is consumed by fetch, not a browser navigation: a 401 is
  // actionable where an HTML redirect would arrive as an unparseable body.
  if (pathname.startsWith("/eve/")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // /preview is deliberately ungated for now — the owner chose to publish
  // their own demo genome. /eve stays closed: it fronts a funded model
  // endpoint, and its 401 is the backstop when the Vercel rewrite is not in
  // play. Restore "/preview/:path*" here the day the surface carries anyone
  // else's data.
  matcher: ["/eve/:path*"],
};
