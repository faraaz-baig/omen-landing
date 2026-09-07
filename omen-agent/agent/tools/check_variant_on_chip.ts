import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  genesRequiringPosition,
  lookupChipPosition,
  provenance,
} from "../../src/profile";

export default defineTool({
  description:
    "Check whether a specific variant (rsID) is measured by this user's " +
    "Omen DNA file. Use this whenever the user asks about a named variant, " +
    "or before claiming anything about one. A variant absent from the file was " +
    "NEVER MEASURED — that is different from being reference/wild-type, and the " +
    "distinction must be preserved in the answer.",
  inputSchema: z.object({
    rsid: z
      .string()
      .regex(/^rs\d+$/i, "Must be an rsID, e.g. rs4244285")
      .describe("dbSNP rsID, e.g. 'rs4244285'"),
  }),
  async execute({ rsid }) {
    const id = rsid.toLowerCase().trim();
    const position = await lookupChipPosition(id);
    const genes = await genesRequiringPosition(id);

    return {
      ...position,
      pharmacogenomicGenes: genes,
      relevance:
        genes.length > 0
          ? `This position contributes to calling: ${genes.join(", ")}.`
          : "This position is not used by PharmCAT to define any pharmacogenomic allele.",
      sources: await provenance(),
    };
  },
});
