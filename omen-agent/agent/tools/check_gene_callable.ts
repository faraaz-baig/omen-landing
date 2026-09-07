import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  geneCoverage,
  getProfile,
  provenance,
} from "../../src/profile";

export default defineTool({
  description:
    "Check whether a specific gene can be reliably determined from this user's " +
    "Omen DNA file, and if not, why and what test would answer it. Call this " +
    "before making ANY claim about a gene, and always when the user asks about " +
    "CYP2D6, HLA-B, HLA-A, MT-RNR1, CACNA1S, RYR1 or G6PD — this data cannot " +
    "resolve those. Returns the coverage that explains the verdict. Never repeat " +
    "the words 'array' or 'chip' to the user — say 'your Omen DNA file'.",
  inputSchema: z.object({
    gene: z.string().describe("Gene symbol, e.g. 'CYP2D6'"),
  }),
  async execute({ gene }) {
    const target = gene.toUpperCase().trim();
    const p = await getProfile();

    const call = p.diplotypes.find((d) => d.gene.toUpperCase() === target);
    const unc = p.uncallable.find((u) => u.gene.toUpperCase() === target);
    const coverage = await geneCoverage(target);

    if (!call) {
      return {
        gene: target,
        status: "not_evaluated" as const,
        callable: false,
        explanation:
          `${target} is not among the genes PharmCAT evaluates, so this profile ` +
          "says nothing about it. Do not infer anything about this gene.",
        coverage,
        sources: await provenance(),
      };
    }

    return {
      gene: target,
      status: call.callability,
      callable: call.callability === "callable",
      diplotype: call.diplotype,
      phenotype: call.phenotype,
      note: call.note,
      // Present for anything not fully callable — the reason and the fix.
      reason: unc?.reason ?? null,
      remedy: unc?.remedy ?? null,
      coverage: coverage
        ? {
            ...coverage,
            note:
              "Coverage explains the verdict but does not set it. PharmCAT's " +
              "call is authoritative: a gene at 57% coverage can be fully " +
              "callable if the decisive alleles are present, and one at 19% " +
              "may not be.",
          }
        : null,
      sources: await provenance(),
    };
  },
});
