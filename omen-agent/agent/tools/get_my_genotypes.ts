import { defineTool } from "eve/tools";
import { z } from "zod";
import { getMyGenotypes, provenance } from "../../src/profile";

export default defineTool({
  description:
    "Given rsIDs found in the literature, report which ones THIS USER actually " +
    "carries. This is the only tool that turns a public finding into a personal " +
    "one — external research says what a variant means in general, this says " +
    "what the user has. Returns one of three states per variant: `called` (with " +
    "the genotype), `no_call` (in the file but failed), or `not_on_chip` (never " +
    "measured — NOT the same as normal). Always call this before attributing any " +
    "variant to the user.",
  inputSchema: z.object({
    rsids: z.array(z.string()).min(1).max(300).describe("rsIDs, e.g. ['rs7903146']"),
  }),
  async execute({ rsids }) {
    const states = await getMyGenotypes(rsids);
    return {
      variants: states,
      summary: {
        requested: rsids.length,
        called: states.filter((s) => s.state === "called").length,
        noCall: states.filter((s) => s.state === "no_call").length,
        notOnChip: states.filter((s) => s.state === "not_on_chip").length,
      },
      sources: await provenance(),
    };
  },
});
