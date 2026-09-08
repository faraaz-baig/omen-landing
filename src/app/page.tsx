import Image from "next/image";
import { SiteFooter } from "./footer";
import { SiteHeader } from "./header";
import { Testing } from "./testing";
import { WaitlistCta, WaitlistProvider } from "./waitlist";

export default function Home() {
  return (
    <WaitlistProvider>
      <main>
        <SiteHeader />
        {/* ── hero ───────────────────────────────────────────────────────────
          Calvin Klein's arrangement: full-bleed media, zero radius, zero
          gutter, and one centred text stack sitting low in the frame rather
          than optically centred. The header floats over this rather than
          sitting above it, so the photograph still runs edge to edge. */}
        {/* dvh, not svh: svh is the viewport height with the mobile address bar
          expanded — its smallest value. Once the bar retracts on scroll the
          visual viewport grows and an svh-sized hero no longer reaches the
          bottom of the screen. dvh tracks the live viewport so the frame stays
          full-bleed through that transition. */}
        <section className="relative h-[100dvh] w-full overflow-hidden">
          <Image
            src="/hero-mirror.jpg"
            alt="A woman studying her reflection in a mirror in a bright empty studio"
            fill
            priority
            /* `sizes` must describe the crop, not the viewport. This is a 16:9
             photo covering a portrait box, so the browser scales it until its
             HEIGHT fits and the width overflows — on a 390x844 phone that needs
             844 * (2752/1536) = ~1512 CSS px, roughly 4x the viewport width.
             With "100vw" it fetched the 1200w variant for a 4537px device-pixel
             requirement: a ~3.8x upscale, which is what made the hero look soft
             and undersized on a phone. Landscape viewports crop the other way
             and genuinely only need 100vw. */
            sizes="(max-aspect-ratio: 3/4) 200vw, 100vw"
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

            <p className="mx-auto mt-[34px] max-w-[46ch] text-[17px] leading-7 font-normal text-balance text-white/85 sm:text-[19px] sm:leading-8">
              We read your DNA and tell you which medications suit your body,
              which don&rsquo;t, and what your diet and skin actually need. In
              plain English.
            </p>

            {/* The waitlist now has somewhere to post to (waitlist_signups), so
              the CTA is back. Its type notes moved with it into WaitlistCta. */}
            <WaitlistCta />
          </div>
        </section>

        <Testing />
      </main>

      <SiteFooter />
    </WaitlistProvider>
  );
}
