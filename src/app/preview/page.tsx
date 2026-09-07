import Image from "next/image";
import { AskOmen } from "./ask";
import { Reveal } from "./reveal";

export const metadata = { title: "heyomen.com" };
export const dynamic = "force-dynamic";

/**
 * Guided-demo intro: one beat per second via staggered `rise` delays.
 *
 * Every line below is backed by a verified genotype in this file's profile
 * (checked against user_genotypes / pgx_profiles — not written from memory):
 *   clopidogrel  → CYP2C19 *1/*2, CPIC Strong
 *   lactose      → LCT rs4988235 GG
 *   caffeine     → ADORA2A rs5751876 TT
 *   MTHFR        → rs1801133 GG
 *   sun/MC1R     → rs1805007 CC, rs1805008 CC (D294H not on chip — hence
 *                  "measured positions")
 *   codeine      → CYP2D6 uncallable on this array
 */

function Step({
  delay,
  className,
  children,
}: {
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rise${className ? ` ${className}` : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

const FINDINGS: { text: string; tag: string }[] = [
  {
    text: "Plavix, a common blood thinner, probably won’t work well for him. No label or doctor would catch this without a genetic test.",
    tag: "CYP2C19 *1/*2",
  },
  {
    text: "Those expensive “methylated” vitamins? His genes don’t need them.",
    tag: "MTHFR",
  },
  {
    text: "Heartburn pills like omeprazole stick around longer in his system. A standard dose works harder for him than for most.",
    tag: "CYP2C19",
  },
  {
    text: "B12 is worth watching. He doesn’t carry the gut variant that keeps levels naturally high.",
    tag: "FUT2",
  },
  {
    text: "Carrots aren’t his best vitamin A source. He converts plant beta carotene a little less efficiently than average.",
    tag: "BCMO1",
  },
  {
    text: "Flax and walnuts only half count for omega 3 in his body. Fish or algae oil is the surer route.",
    tag: "FADS1",
  },
  {
    text: "His vitamin D genes lean slightly low on the production side. Sunshine and diet matter a bit more for him.",
    tag: "CYP2R1",
  },
  {
    text: "The best known baldness risk markers in his file came back clear.",
    tag: "20P11",
  },
  {
    text: "Dairy is hard for him to digest. His body stopped making the enzyme for it after childhood.",
    tag: "LCT",
  },
  {
    text: "Coffee hits him harder than most people. An afternoon cup is likely to cost him sleep.",
    tag: "ADORA2A",
  },
  {
    text: "His focus genes lean toward deep concentration when it’s calm, and getting rattled under pressure.",
    tag: "COMT",
  },
  {
    text: "No extra sunburn risk in the genes his file covers.",
    tag: "MC1R",
  },
  {
    text: "Freckles aren’t really in his genes either. His skin leans toward tanning evenly instead.",
    tag: "IRF4",
  },
];

export default function Preview() {
  return (
    <main>
      <AskOmen>
        <div className="flex flex-col pt-10 sm:pt-16">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* shrink-0: without it the flex row squashes the photo out of square */}
            <Step className="shrink-0" delay={0}>
              <Image
                alt="Digvijay Singh Rathore"
                className="size-16 rounded-[12px] object-cover sm:size-20 sm:rounded-[14px]"
                height={80}
                priority
                src="/dj_pfp.jpg"
                width={80}
              />
            </Step>

            {/* no rise wrapper — the bubble is present from first paint */}
            <div className="wobble relative border border-ink/15 bg-paper px-3.5 py-2.5 text-[13px] leading-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] sm:px-4 sm:text-[14px]">
              {/* tail: a rotated square borrowing two borders from the bubble */}
              <span
                aria-hidden
                className="absolute top-1/2 -left-[5.5px] size-[10px] -translate-y-1/2 rotate-45 border-b border-l border-ink/15 bg-paper"
              />
              Hi, I just got my genetics tested on heyomen.com
            </div>
          </div>

          <Step delay={2}>
            <p className="mt-8 max-w-[48ch] text-[16px] leading-7 sm:mt-9 sm:text-[17px] sm:leading-8">
              Here’s what we found about <em className="italic">Digvijay</em>.
            </p>
          </Step>

          <div className="mt-4 space-y-5 sm:space-y-6">
            <Reveal
              startDelayMs={2900}
              items={[
                ...FINDINGS.map((f) => (
                  <div
                    className="max-w-[56ch] border-l border-ink/15 pl-4 sm:pl-5"
                    key={f.tag}
                  >
                    <p className="text-[15px] leading-7 sm:text-[16px]">
                      {f.text}
                    </p>
                    <p className="mt-1 text-[11px] tracking-[0.12em] text-ink-2 uppercase">
                      {f.tag}
                    </p>
                  </div>
                )),
                // Lands last, after the final finding — the list is a sample,
                // not the whole file.
                <p
                  className="pl-4 text-[15px] leading-7 text-ink-2 sm:pl-5 sm:text-[16px]"
                  key="more"
                >
                  …and a lot more. Any specific questions about it?
                </p>,
              ]}
            />
          </div>
        </div>
      </AskOmen>
    </main>
  );
}
