import Image from "next/image";

/**
 * The sample-collection series.
 *
 * Five separately generated portraits of different people giving the same
 * saliva sample. The point is not the steps — it is that this is one ordinary
 * thing that anyone does, which is what makes handing over a genetic sample
 * feel normal rather than exceptional.
 *
 * `src: null` renders a neutral placeholder, so the section is laid out and
 * testable before the images exist. Drop each file into /public and set its
 * src; nothing else needs to change.
 *
 * Deliberately no captions naming anyone's ethnicity. The range is the point
 * and the pictures carry it; labelling it would turn people into categories.
 */
type Sample = { src: string | null; alt: string };

const SAMPLES: Sample[] = [
  {
    src: "/samples/east-asian-woman.jpg",
    alt: "A woman holding a saliva collection tube to her lower lip, eyes cast down",
  },
  {
    src: "/samples/black-man.jpg",
    alt: "A man leaning slightly forward, holding a saliva collection tube to his lips",
  },
  {
    src: "/samples/south-asian.jpg",
    alt: "A woman screwing the cap onto a filled saliva collection tube",
  },
  {
    src: "/samples/white-man.jpg",
    alt: "A man holding a saliva collection tube to his lips, shoulders relaxed",
  },
  {
    src: "/samples/latina.jpg",
    alt: "A woman turning a capped saliva collection tube over in her fingers",
  },
];

export function Testing() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-[20ch] text-[28px] leading-[1.15] tracking-[-0.02em] text-balance sm:text-[40px]">
          Genetic testing for your health.
        </h2>
        <p className="mt-5 max-w-[52ch] text-[17px] leading-8 text-ink-2 sm:text-[19px]">
          No needles, no clinic, no appointment. What comes back isn&rsquo;t
          ancestry trivia. It&rsquo;s how your body handles the medication you
          actually get prescribed, read against clinical prescribing guidelines
          and explained in plain English.
        </p>

        {/*
          A scroll strip on phones and a row on desktop. snap-x keeps a card
          squared up in the viewport instead of leaving people mid-image, and
          the negative margin lets the strip bleed to the screen edge while the
          copy above stays within the page gutter.
        */}
        <ul className="-mx-5 mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-0">
          {SAMPLES.map((sample, i) => (
            <li
              className="w-[72vw] shrink-0 snap-start sm:w-auto"
              key={sample.alt}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
                {sample.src ? (
                  <Image
                    alt={sample.alt}
                    className="object-cover"
                    fill
                    /* one column of a five-up row on desktop, most of the
                       screen on a phone */
                    sizes="(min-width: 640px) 20vw, 72vw"
                    src={sample.src}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.2em] text-ink-2/50 uppercase">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
