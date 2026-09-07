import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {};

// Mounts the omen agent into this app: one dev server, one Vercel deploy,
// same-origin /eve/v1/* routes. useEveAgent() finds them without config.
//
// The path must stay INSIDE this repo. Vercel clones only this project, so a
// sibling path like "../omen-agent" resolves to nothing at build time and eve
// cannot emit its agent service into .vercel/output/config.json.
export default withEve(nextConfig, {
  eveRoot: "./omen-agent",
});
