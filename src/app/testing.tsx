import Image from "next/image";

/**
 * The sample-collection series.
 *
 * Four separately generated portraits of different people giving the same
 * saliva sample. The point is not the steps — it is that this is one ordinary
 * thing that anyone does, which is what makes handing over a genetic sample
 * feel normal rather than exceptional.
 *
 * `src: null` renders a neutral placeholder, so the section stays laid out
 * and testable while an image is being replaced. Drop each file into /public
 * and set its src; nothing else needs to change.
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
];

export function Testing() {
  return (
    // lg:py-0 so the image block runs edge to edge vertically: hard against
    // the bottom of the hero and hard into the top of the footer. The padding
    // stays below lg, where the layout stacks and the headline would otherwise
    // butt straight into the photograph above it.
    <section className="py-16 sm:py-20 lg:py-0">
      {/*
        No max-width and no gutter on the grid itself, so the image block can
        run to the right edge of the screen. The left column carries the page
        margin instead.

        items-end: the text sits on the bottom-left of its column, against the
        base of the image block, rather than floating in the middle of a tall
        empty column.
      */}
      <div className="grid gap-12 lg:grid-cols-2 lg:items-end lg:gap-20">
        {/*
          A capped inset, not the page's usual `mx-auto max-w-6xl` margin.
          That margin is half the leftover width, so it grows without limit:
          144px at 1440 but 424px on a 2000px display, which pushed the text
          most of the way to the middle of an otherwise empty column. This
          scales gently and stops at 5rem.

          pb uses the identical expression, so the text sits the same distance
          from the bottom of the block as from the left edge of the page at
          every width.
        */}
        <div className="px-5 sm:px-8 lg:pr-0 lg:pb-[clamp(2rem,5vw,5rem)] lg:pl-[clamp(2rem,5vw,5rem)]">
          <h2 className="max-w-[16ch] text-[30px] leading-[1.14] tracking-[-0.022em] text-balance sm:text-[46px]">
            Genetic testing for your health.
          </h2>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-8 text-ink-2 sm:text-[19px]">
            Submit your saliva sample from the comfort of your home. We
            provide a report and personalized guidance, so you can make
            informed decisions about medication, supplementation and lifestyle.
          </p>
        </div>

        {/*
          One locked block: no gap, so the frames butt against each other and
          read as a single object rather than four cards.

          Four fills the two-column grid exactly, which is why it is four. At
          five there was a sixth cell to solve for, and an empty one reads as a
          failed image.
        */}
        <ul className="grid grid-cols-2">
          {SAMPLES.map((sample, i) => (
            <li
              /* Tiles are sized off viewport height, not a fixed aspect, so
                 the section is never taller than the screen. That is what lets
                 mandatory scroll snapping work: an oversized section traps its
                 own bottom. 50dvh x 2 rows fills the screen on desktop; 26dvh
                 leaves room for the copy stacked above it on a phone. */
              className="relative h-[24dvh] overflow-hidden bg-ink/5 lg:h-[50dvh]"
              key={sample.alt}
            >
              {sample.src ? (
                <Image
                  alt={sample.alt}
                  className="object-cover"
                  fill
                  /* one of two columns inside a half-width column on desktop,
                     one of two across the screen on a phone */
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  src={sample.src}
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.2em] text-ink-2/50 uppercase">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
