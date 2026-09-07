import { NextResponse, type NextRequest } from "next/server";
import { getChatPassword, getPasswordSessionFromHeaders } from "@/lib/password-auth";

/**
 * Password gate for the genome surface and the agent API.
 *
 * `/preview` renders real genotypes and medical inferences, and `/eve/*` is a
 * funded model endpoint — neither may be open to the internet. The marketing
 * page at `/` stays public.
 *
 * Proxy runs before `beforeFiles` rewrites in the routing chain, so this fires
 * ahead of the rewrite that hands `/eve/v1/*` to the agent service. Gating here
 * covers the API without touching eve's own routing. Proxy also defaults to the
 * Node.js runtime in Next 16, which is what makes the node:crypto HMAC in
 * password-auth usable at this layer.
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
  matcher: ["/preview/:path*", "/eve/:path*"],
};
