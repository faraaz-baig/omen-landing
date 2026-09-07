/** Ask the agent one question and print the final answer. */
import { ask } from "./lib/run.ts";

const q = process.argv.slice(2).join(" ");
if (!q) {
  console.error('Usage: bun scripts/ask.ts "<question>"');
  process.exit(1);
}

console.log(`\nQ: ${q}\n${"─".repeat(78)}`);
const t = await ask(q, { onEvent: (l) => console.log(l) });
console.log("─".repeat(78));
console.log(t.answer || "(no answer)");
console.log("─".repeat(78));
console.log(
  `tools: ${t.tools.join(" → ") || "none"}` +
    (t.verifierCalled ? ` → verifier${t.verifierReturned ? "✓" : "✗"}` : "") +
    ` · ${(t.ms / 1000).toFixed(1)}s`,
);
