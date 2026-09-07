"use client";

import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { memo, type ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

const streamdownPlugins = { cjk, code, math, mermaid };

export type MarkdownProps = ComponentProps<typeof Streamdown>;

const markdownComponents: MarkdownProps["components"] = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn("mt-7 mb-4 px-3 text-xl leading-7 font-medium tracking-normal", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mt-6 mb-3 px-3 text-base leading-6 font-medium tracking-normal", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("mt-5 mb-2 px-3 text-sm leading-6 font-medium tracking-normal", className)}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn("mt-4 mb-2 px-3 text-sm leading-6 font-medium tracking-normal", className)}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn("mt-4 mb-2 px-3 text-xs leading-5 font-medium tracking-normal", className)}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn(
        "mt-4 mb-2 px-3 text-xs leading-5 font-medium tracking-normal text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("px-3 text-[15px] leading-6 text-foreground", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "flex list-disc flex-col gap-1.5 px-3 pl-8 text-[15px] leading-6 text-foreground",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "flex list-decimal flex-col gap-1.5 px-3 pl-8 text-[15px] leading-6 text-foreground",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("pl-1 text-[15px] leading-6 text-foreground", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "mx-3 border-l-2 border-border pl-3 text-[15px] leading-6 text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("mx-3 my-4 border-border/70", className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-medium text-foreground", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground",
        className,
      )}
      rel="noreferrer"
      target="_blank"
      {...props}
    />
  ),
  /**
   * Tables and code blocks are the two things that will not reflow. Omen's
   * answers routinely contain CPIC guideline tables and PMID/p-value rows, so
   * without a scroll container these push the whole page sideways on a phone.
   * The wrapper scrolls; the page does not.
   */
  table: ({ className, ...props }) => (
    <div className="-mx-1 my-3 overflow-x-auto px-1">
      <table
        className={cn("w-max min-w-full border-collapse text-[14px]", className)}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border-b border-border px-3 py-2 text-left align-top font-medium whitespace-nowrap",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn("border-b border-border/50 px-3 py-2 align-top", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre className={cn("mx-3 my-3 overflow-x-auto", className)} {...props} />
  ),
  inlineCode: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded-md border border-border/70 bg-muted/40 px-1.5 py-0.5 font-mono text-[0.92em] text-foreground",
        className,
      )}
      {...props}
    />
  ),
};

export const Markdown = memo(function Markdown({ className, ...props }: MarkdownProps) {
  return (
    <Streamdown
      className={cn(
        // break-words: rsIDs, PMIDs and bare URLs are unbreakable tokens that
        // would otherwise widen the column past the viewport.
        "min-w-0 text-[15px] leading-6 break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      components={markdownComponents}
      plugins={streamdownPlugins}
      {...props}
    />
  );
});
