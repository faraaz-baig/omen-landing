"use client";

import { useEveAgent, type EveMessage } from "eve/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Markdown } from "@/components/chat/markdown";
import { intro } from "./intro-state";

/**
 * What each tool reads as while it runs. Human activity, never the tool name:
 * the stream carries `toolName` verbatim, and "get_pgx_profile" on screen
 * would be the plumbing showing through.
 */
const TOOL_LABELS: Record<string, string> = {
  get_pgx_profile: "Reading your medication genes",
  get_my_genotypes: "Reading your DNA",
  check_gene_callable: "Checking what your file covers",
  check_variant_on_chip: "Checking what your file covers",
  lookup_drug_guidance: "Checking prescribing guidance",
  search_clinvar: "Searching clinical databases",
  search_gwas: "Comparing population studies",
  search_traits: "Researching this trait",
  search_literature: "Reading the research",
};

/**
 * Derive the status line from what the stream is actually doing, rather than
 * a canned rotation. Measured on a real question: the model is reached ~300ms
 * after send, but the first visible text lands ~15s later — everything in
 * between is reasoning and tool calls that arrive as non-text parts. This
 * walks back from the newest part of the assistant's streaming message:
 * running tools name themselves (all of them, when a step fires several at
 * once), reasoning reads as thinking, and once text is streaming the line
 * disappears — the answer itself is the status. `null` means render nothing.
 */
function statusLine(messages: readonly EveMessage[]): string | null {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") return "Working…";
  for (let i = last.parts.length - 1; i >= 0; i--) {
    const part = last.parts[i];
    if (part.type === "text") {
      return part.state === "streaming" ? null : "Working…";
    }
    if (part.type === "reasoning") return "Thinking…";
    if (part.type === "dynamic-tool") {
      // The whole trailing run of tool parts, not just the newest: a step
      // often issues two calls together and both are genuinely in flight.
      const labels: string[] = [];
      for (let j = i; j >= 0; j--) {
        const p = last.parts[j];
        if (p.type !== "dynamic-tool") break;
        if (p.state !== "input-streaming" && p.state !== "input-available") {
          continue;
        }
        const label = TOOL_LABELS[p.toolName] ?? "Researching";
        if (!labels.includes(label)) labels.unshift(label);
      }
      // Every call in the run has returned; the model is reading the results.
      if (labels.length === 0) return "Thinking…";
      return `${labels.join(" · ")}…`;
    }
  }
  return "Working…";
}

/**
 * One surface at a time. The genome document (server-rendered, passed as
 * children) is the resting state; the moment a conversation starts the chat
 * replaces it entirely. A back link at the top returns to the document
 * without dropping the conversation — this component stays mounted, so the
 * session and messages survive the toggle.
 */
export function AskOmen({ children }: { children: ReactNode }) {
  const agent = useEveAgent();
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<"doc" | "chat">("doc");
  const endRef = useRef<HTMLDivElement>(null);

  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const messages = agent.data.messages;

  useEffect(() => {
    if (view === "chat") {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isBusy, view]);

  const send = () => {
    const q = draft.trim();
    if (!q || isBusy) return;
    setDraft("");
    setView("chat");
    void agent.send(q);
  };

  return (
    <>
      {view === "doc" ? (
        <div
          className={`mx-auto max-w-3xl px-5 pt-10 pb-40 sm:px-6 sm:pt-14 sm:pb-44${
            // Returning from chat remounts this subtree, which would restart
            // every CSS entrance animation. Suppress them once the intro has run.
            intro.played ? " no-intro" : ""
          }`}
        >
          {children}
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-5 pt-8 pb-40 sm:px-6 sm:pb-44">
          <button
            className="-m-2 mb-8 p-2 text-[12px] font-medium tracking-[0.16em] text-ink-2 uppercase transition-colors hover:text-ink"
            onClick={() => setView("doc")}
            type="button"
          >
            ← Back
          </button>

          {/*
            Not a chat transcript — a document. The question is the heading and
            Omen's answer is the prose under it, so no role labels and no
            bubbles. Spacing is per-message rather than space-y because the gap
            before a new question is much larger than the gap before an answer.
          */}
          <div className="min-w-0">
            {messages.map((m) =>
              m.parts.map((part, i) =>
                part.type !== "text" ? null : m.role === "user" ? (
                  <h2
                    className="mt-14 max-w-[40ch] text-[22px] leading-8 tracking-[-0.015em] text-balance first:mt-0 sm:mt-16 sm:text-[26px] sm:leading-9"
                    key={`${m.id}-${i}`}
                  >
                    {part.text}
                  </h2>
                ) : (
                  <Markdown
                    className="mt-5 text-[15px] leading-7 sm:text-[16px] sm:leading-8 [&>blockquote]:mx-0 [&>h1]:px-0 [&>h2]:mt-6 [&>h2]:px-0 [&>h2]:text-[15px] [&>h2]:font-semibold [&>h3]:px-0 [&>h4]:px-0 [&>hr]:mx-0 [&>ol]:my-3 [&>ol]:px-0 [&>ol]:pl-6 [&>p]:my-3 [&>p]:px-0 [&>pre]:mx-0 [&>ul]:my-3 [&>ul]:px-0 [&>ul]:pl-6 [&_li]:my-1"
                    key={`${m.id}-${i}`}
                  >
                    {part.text}
                  </Markdown>
                ),
              ),
            )}
            {isBusy &&
              (() => {
                const line = statusLine(messages);
                if (line === null) return null;
                return (
                  // Keyed on the text: a phase change remounts the element and
                  // replays the fade, so each new line announces itself
                  // instead of the words silently swapping mid-glance.
                  <p
                    className="status-fade mt-5 text-[10px] tracking-[0.16em] text-ink-2 uppercase"
                    key={line}
                  >
                    {line}
                  </p>
                );
              })()}
            {agent.status === "error" && (
              <p className="mt-5 text-[12px] text-ember">
                Something failed mid-answer. Ask again.
              </p>
            )}
            <div ref={endRef} />
          </div>
        </div>
      )}

      {/*
        Scrim: the document dissolves into the paper beneath the composer
        instead of colliding with its edge as it scrolls past.
      */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-36 bg-gradient-to-t from-paper via-paper/85 to-transparent" />

      {/* floating composer — present on both surfaces */}
      <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto w-full max-w-[46rem]">
          <form
            className="flex items-center gap-3 border border-ink/12 bg-paper px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_44px_-12px_rgba(0,0,0,0.22)] transition-colors duration-200 focus-within:border-ink/35 sm:px-5 sm:py-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              // 16px on mobile is deliberate: iOS Safari zooms the viewport
              // when a focused input renders below 16px.
              className="min-w-0 flex-1 bg-transparent text-[16px] leading-6 outline-none placeholder:text-ink-2/55 sm:text-[15px]"
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => {
                if (messages.length > 0) setView("chat");
              }}
              placeholder="Ask anything about your genome"
              enterKeyHint="send"
              value={draft}
            />
            <button
              className="-my-2 shrink-0 py-2 text-[12px] font-medium tracking-[0.14em] uppercase disabled:opacity-30"
              disabled={isBusy || draft.trim().length === 0}
              type="submit"
            >
              {isBusy ? "…" : "Ask"}
            </button>
          </form>
          <p className="mt-2.5 text-center text-[11px] tracking-[0.04em] text-ink-2">
            Omen explains; it does not prescribe or diagnose.
          </p>
        </div>
      </div>
    </>
  );
}
