/**
 * Shared driver for asking the agent a question and getting the FINAL answer.
 *
 * The subtlety this exists to handle: the verifier subagent runs as a durable
 * background task. The parent dispatches it, ends its turn with a placeholder
 * ("checking…"), and only produces the real answer in a later turn once a task
 * notification wakes it. So one `result()` is not the answer.
 *
 * `ClientSession` keeps a `streamIndex` cursor, so continuing to stream resumes
 * where the last read stopped instead of replaying the session from the start —
 * which is what made the hand-rolled re-attach loop quadratic and slow.
 */

import { Client } from "eve/client";

export type Turn = {
  answer: string;
  tools: string[];
  verifierCalled: boolean;
  verifierReturned: boolean;
  ms: number;
};

const HOST = process.env.EVE_URL ?? "http://127.0.0.1:2000";

export async function ask(
  question: string,
  opts: { onEvent?: (line: string) => void; maxWaitMs?: number } = {},
): Promise<Turn> {
  const started = Date.now();
  const maxWaitMs = opts.maxWaitMs ?? 600_000;
  const client = new Client({ host: HOST });

  const { session, response } = await client.sessions.create({
    message: question,
  });

  const tools: string[] = [];
  let subagentsOut = 0;
  let subagentsBack = 0;
  let answer = "";

  const absorb = (events: readonly any[]) => {
    for (const ev of events) {
      switch (ev.type) {
        case "actions.requested":
          for (const a of ev.data?.actions ?? []) {
            tools.push(a.toolName);
            opts.onEvent?.(
              `  ⚙ ${a.toolName}(${JSON.stringify(a.input ?? {}).slice(0, 80)})`,
            );
          }
          break;
        case "subagent.called":
          subagentsOut++;
          opts.onEvent?.(`  ⚙ subagent #${subagentsOut} dispatched (background)`);
          break;
        case "subagent.completed":
          subagentsBack++;
          opts.onEvent?.(`  ✓ subagent #${subagentsBack} returned`);
          break;
        case "message.completed":
          if (ev.data?.message) answer = ev.data.message;
          break;
      }
    }
  };

  const first = await response.result();
  absorb(first.events ?? []);

  // If nothing was delegated, the first turn's message is the answer.
  if (subagentsOut > 0) {
    // The children can return before the dispatching turn even ends, so "a
    // message after all children returned" can match the placeholder. The real
    // answer is a message in a turn that STARTED after every child was back —
    // and that turn may itself delegate again (researcher -> wake -> verifier
    // -> wake -> answer), which un-latches the wake state until the next child
    // returns.
    const deadline = Date.now() + maxWaitMs;
    let inWakeTurn = false;
    let done = false;

    while (Date.now() < deadline && !done) {
      const batch: any[] = [];
      try {
        for await (const ev of session.stream()) {
          batch.push(ev);
          if (ev.type === "subagent.called") { subagentsOut++; inWakeTurn = false; }
          if (ev.type === "subagent.completed") subagentsBack++;
          if (ev.type === "turn.started" && subagentsBack >= subagentsOut) {
            inWakeTurn = true;
          }
          if (ev.type === "message.completed" && inWakeTurn && ev.data?.message) {
            done = true;
          }
          if (ev.type === "session.waiting" && done) break;
        }
      } catch {
        // Stream closed; loop and resume from the cursor.
      }
      absorb(batch);
      if (!done) await new Promise((r) => setTimeout(r, 2_000));
    }
  }

  return {
    answer,
    tools,
    verifierCalled: subagentsOut > 0,
    verifierReturned: subagentsBack >= subagentsOut && subagentsBack > 0,
    ms: Date.now() - started,
  };
}
