import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* ── hero ───────────────────────────────────────────────────────────
          Calvin Klein's arrangement: full-bleed media, zero radius, zero
          gutter, no header, and one centred text stack sitting low in the
          frame rather than optically centred. */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <Image
          src="/hero-mirror.jpg"
          alt="A woman studying her reflection in a mirror in a bright empty studio"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] sm:object-center"
        />

        {/* the lower band of the frame runs bright in patches (max L≈251),
            so centred white type needs a floor to sit on */}
        <div className="hero-scrim pointer-events-none absolute inset-0" />
        {/* CK's text block is absolutely positioned, full-width, centred,
            and bottom-weighted. Measured gaps at 1440px: headline → sub 34px,
            sub → link 24px. */}
        <div className="rise absolute inset-x-0 bottom-[clamp(2.5rem,5vh,4rem)] z-10 px-6 text-center">
          {/* breaks are explicit, not left to the browser: they keep every
              line inside the darker centre of the frame rather than spilling
              onto the bright wall and white vest at the edges. */}
          <h1 className="display mx-auto max-w-[16ch] text-white">
            Know what works
            <br />
            for your body.
          </h1>

          <p className="mx-auto mt-[34px] max-w-[46ch] text-[15px] leading-6 font-normal text-balance text-white/85 sm:text-base">
            We explain your DNA in plain English, so you can make informed
            choices about your diet, medication and treatment.
          </p>

          {/* CTA disabled for now — restore when the waitlist has somewhere to
              post to. Notes for when it comes back: uppercase needs tracking to
              breathe, and the trailing letter-space pushes the underline past
              the final glyph, so the negative margin cancels it and keeps the
              rule flush and centred.

          <a
            href="#"
            className="mt-7 -mr-[0.14em] inline-block border-b border-white/70 pb-[5px] text-[12px] leading-none font-medium tracking-[0.14em] text-white uppercase transition-colors hover:border-white sm:text-[13px]"
          >
            Join the waitlist
          </a>
          */}
        </div>
      </section>
    </main>
  );
}
