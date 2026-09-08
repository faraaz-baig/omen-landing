import Image from "next/image";

/* Decorative genome backdrop for step 2. A fixed string, not generated —
   there is no meaning in the letters, only the texture of a read. */
const BASES = `A T C G G A T C C A T G
G C T A T A G C C G A T
T A C G C T A T G G C A
C G A T A C G T A T C G
A T G C G A T A C C T A
G C A T C G T A G C A T
T A G C A T C G A T G C
C G T A G C A T C G A T
A T C G A T G C T A G C`;

function NumberChip({ n }: { n: string }) {
  return (
    <span className="absolute top-3 left-3 grid h-[26px] w-[26px] place-items-center rounded-[4px] bg-paper text-[12px] font-medium text-ink">
      {n}
    </span>
  );
}

/**
 * Superpower's step anatomy — image card with a floating product vignette
 * and a number chip, title and description beneath — built from Omen parts:
 * warm photo crops, paper-and-hairline cards, the one ember accent.
 * The vignettes preview real product UI (kit status chip, Ask Omen reply),
 * so the marketing page and the app stay one design.
 */
export function HowItWorks() {
  return (
    <section className="px-5 py-24 sm:px-20 sm:py-36" id="how-it-works">
      <p className="text-[11px] font-medium tracking-[0.16em] text-ink-2 uppercase sm:text-[12px]">
        How it works
      </p>
      <h2 className="mt-4 max-w-[620px] text-[30px] leading-[1.16] font-light tracking-[-0.022em] text-ink sm:mt-5 sm:text-[44px] sm:leading-[1.14]">
        One sample. Everything your body has been trying to tell you.
      </h2>

      <div className="mt-12 grid gap-11 sm:mt-16 sm:grid-cols-3 sm:gap-6">
        <article>
          <div className="relative flex h-[260px] items-center justify-center overflow-hidden rounded-[var(--radius-frame)] bg-[#f3efe9] sm:h-[320px]">
            <Image
              alt="A woman providing a saliva sample into a small collection tube by a sunlit window"
              className="object-cover object-[62%_25%]"
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              src="/step-saliva.jpg"
            />
            <div className="absolute inset-0 bg-[rgb(26_18_12/0.12)]" />
            <div className="relative w-[250px] rounded-[var(--radius-frame)] border border-ink/10 bg-paper p-4 shadow-[0_16px_40px_-12px_rgb(26_18_12/0.35)] sm:w-[280px] sm:p-5">
              <p className="text-[14px] leading-5 font-medium text-ink sm:text-[15px]">
                Your kit is on its way
              </p>
              <p className="mt-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                <span className="text-[10px] leading-none font-medium tracking-[0.14em] text-ink uppercase">
                  Kit in transit
                </span>
              </p>
              <p className="mt-2 text-[12px] leading-[18px] text-ink-2 sm:text-[13px]">
                Arrives Thursday · prepaid return
              </p>
            </div>
            <NumberChip n="1" />
          </div>
          <h3 className="mt-5 text-[20px] leading-7 font-light text-ink sm:text-[21px]">
            A kit arrives
          </h3>
          <p className="mt-1.5 max-w-[380px] text-[15px] leading-6 text-ink-2">
            A small saliva sample at home. Ten minutes, no needles, and a
            prepaid envelope back to the lab.
          </p>
        </article>

        <article>
          <div className="relative flex h-[260px] items-center justify-center overflow-hidden rounded-[var(--radius-frame)] bg-[#f3efe9] sm:h-[320px]">
            <div
              aria-hidden
              className="absolute inset-x-5 top-5 font-mono text-[13px] leading-[26px] tracking-[0.3em] whitespace-pre text-[#6b6259]/45 sm:inset-x-6 sm:top-6 sm:text-[15px] sm:leading-[30px]"
            >
              {BASES}
            </div>
            {/* one framed base pair — the section's single ember moment */}
            <div
              aria-hidden
              className="absolute top-[63px] left-[22%] h-[30px] w-[24px] rounded-[4px] border-[1.5px] border-ember sm:top-[73px]"
            />
            <div className="relative w-[250px] rounded-[var(--radius-frame)] border border-ink/10 bg-paper p-4 shadow-[0_16px_40px_-12px_rgb(26_18_12/0.25)] sm:w-[280px] sm:p-5">
              <p className="text-[14px] leading-5 font-medium text-ink sm:text-[15px]">
                Sequencing complete
              </p>
              <p className="mt-1.5 text-[12px] leading-[18px] text-ink-2 sm:text-[13px]">
                3.1 billion base pairs · clinical-grade lab
              </p>
            </div>
            <NumberChip n="2" />
          </div>
          <h3 className="mt-5 text-[20px] leading-7 font-light text-ink sm:text-[21px]">
            We read your genome
          </h3>
          <p className="mt-1.5 max-w-[380px] text-[15px] leading-6 text-ink-2">
            Sequenced in a clinical lab, interpreted against peer-reviewed
            genomic research.
          </p>
        </article>

        <article>
          <div className="relative flex h-[260px] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[var(--radius-frame)] bg-[#f3efe9] sm:h-[320px]">
            <Image
              alt="A woman smiling at her reflection in a mirror in warm afternoon light"
              className="object-cover object-[47%_20%]"
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              src="/hero-golden.jpg"
            />
            <div className="absolute inset-0 bg-[rgb(26_18_12/0.2)]" />
            <div className="relative translate-x-6 self-center rounded-[var(--radius-frame)] bg-ink px-3.5 py-2.5 shadow-[0_12px_32px_-10px_rgb(26_18_12/0.4)]">
              <p className="text-[13px] leading-[17px] text-paper sm:text-[14px]">
                Can I take ibuprofen?
              </p>
            </div>
            <div className="relative w-[250px] -translate-x-3 rounded-[var(--radius-frame)] border border-ink/10 bg-paper px-4 py-3.5 shadow-[0_16px_40px_-12px_rgb(26_18_12/0.35)] sm:w-[290px]">
              <p className="text-[10px] leading-none font-medium tracking-[0.16em] text-ink-2 uppercase">
                Omen
              </p>
              <p className="mt-1.5 text-[13px] leading-5 text-ink sm:text-[14px]">
                Yes — your CYP2C9 variants clear it normally. Standard dosing
                works for you.
              </p>
            </div>
            <NumberChip n="3" />
          </div>
          <h3 className="mt-5 text-[20px] leading-7 font-light text-ink sm:text-[21px]">
            Answers, in plain English
          </h3>
          <p className="mt-1.5 max-w-[380px] text-[15px] leading-6 text-ink-2">
            Your report reads like a conversation — and Omen answers new
            questions for life.
          </p>
        </article>
      </div>
    </section>
  );
}
