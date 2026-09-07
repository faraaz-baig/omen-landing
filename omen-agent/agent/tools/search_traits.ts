import { defineTool } from "eve/tools";
import { z } from "zod";
import { searchTraits } from "../../src/sources";

export default defineTool({
  description:
    "Resolve free text (a disease, trait, or condition) to ontology terms. " +
    "Searches EFO, MONDO and HP together. Required before searching GWAS: the " +
    "GWAS Catalog has migrated many traits from EFO to MONDO, so the ontology " +
    "id must come from here rather than being guessed. Returns candidates — " +
    "pick the one matching the user's intent, or say so if none fit.",
  inputSchema: z.object({
    query: z.string().min(2).describe("e.g. 'type 2 diabetes', 'caffeine metabolism'"),
    limit: z.number().int().min(1).max(30).default(12),
  }),
  async execute({ query, limit }) {
    const terms = await searchTraits(query, limit);
    return {
      query,
      terms,
      note:
        terms.length === 0
          ? "No ontology term matched. The question may not map to a studied " +
            "trait — say so rather than guessing an id."
          : null,
    };
  },
});
