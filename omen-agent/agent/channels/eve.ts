import { eveChannel } from "eve/channels/eve";
import { type AuthFn, localDev, vercelOidc } from "eve/channels/auth";
import { hasValidGateCookie } from "../../src/gate";

/**
 * The agent answers from someone's genome and spends real model credits, so it
 * cannot be public. It is also not covered by the site's `src/proxy.ts`: on
 * Vercel this agent is its own service and the platform routes /eve/* to it
 * ahead of the Next.js proxy, so in production this walk is the only gate.
 *
 * `placeholderAuth()` sat here before. It rejects every browser request in
 * production by design — that was the 401 on POST /eve/v1/session.
 */
function gateCookie(): AuthFn<Request> {
  return (request) => {
    if (!hasValidGateCookie(request)) return null; // skip; try the next entry
    return {
      attributes: {},
      authenticator: "gate-cookie",
      principalId: "gated-visitor",
      principalType: "user",
    };
  };
}

export default eveChannel({
  auth: [
    // Ours first, so a real visitor resolves before the catch-all helpers.
    gateCookie(),
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
  ],
});
