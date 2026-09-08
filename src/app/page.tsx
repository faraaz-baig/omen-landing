import Image from "next/image";
import { SiteHeader } from "./header";
import { SiteFooter } from "./footer";
import { HeroCapture } from "./hero-capture";
import { HowItWorks } from "./how-it-works";
import { WaitlistProvider } from "./waitlist";
// Testing section is parked, not deleted — it returns as-is.
// import { Testing } from "./testing";

export default function Home() {
  return (
    <WaitlistProvider>
      <main>
        {/* ── hero ───────────────────────────────────────────────────────────
          Calvin Klein's arrangement, but inset: the photograph sits in a
          framed box with a paper gutter, and the header sits above the frame
          on paper rather than floating over the photograph. The radius is an
          arbitrary value, not rounded-2xl: globals.css zeroes every
          --radius-* token to keep the chat UI sharp, so token-based utilities
          render square here. */}
        {/* dvh, not svh: svh is the viewport height with the mobile address bar
          expanded — its smallest value. Once the bar retracts on scroll the
          visual viewport grows and an svh-sized hero no longer reaches the
          bottom of the screen. dvh tracks the live viewport so the frame stays
          put through that transition. The column is one viewport tall and the
          frame takes whatever the header leaves (flex-1), so header + gutter +
          box fill one screen with no initial scroll and no magic header
          height in a calc(). */}
        <div className="flex h-[100dvh] flex-col">
          <SiteHeader />
          {/* On a phone the frame gives up its gutters and its radius
            entirely: the photo runs edge to edge with square corners top and
            bottom. From sm the gutter wraps all four sides and the shared
            radius returns. */}
          <section className="min-h-0 flex-1 sm:px-5 sm:pb-5">
            <div className="relative h-full w-full overflow-hidden sm:rounded-[var(--radius-frame)]">
              <Image
                src="/hero-golden.jpg"
                alt="A woman studying her reflection in a mirror in a warm sunlit studio"
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
                className="object-cover object-[42%_center] sm:object-center"
              />

              {/* the bottom of the frame runs from pale floor to sunlit wall,
            so centred white type needs a floor to sit on */}
              <div className="hero-scrim pointer-events-none absolute inset-0" />
              {/* CK's text block is absolutely positioned, full-width, centred,
            and bottom-weighted. Measured gaps at 1440px: headline → sub 34px,
            sub → link 24px. */}
              {/* no `rise` here: the hero copy is present from first paint.
                The entrance fade stays in globals.css for the preview demo,
                which staggers it per beat. */}
              <div className="absolute inset-x-0 bottom-[clamp(1.75rem,4vh,3.5rem)] z-10 px-4 text-center sm:px-6">
                {/* breaks are explicit, not left to the browser: they keep every
              line inside the darker centre of the frame rather than spilling
              onto the brighter walls at the edges. */}
                <h1 className="display mx-auto max-w-[16ch] text-white">
                  Know what works
                  <br />
                  for your body.
                </h1>

                <p className="mx-auto mt-[clamp(1rem,3vh,2.125rem)] max-w-[46ch] text-[15px] leading-6 font-normal text-balance text-white/85 sm:text-[19px] sm:leading-8">
                  We read your DNA and tell you which medications suit your
                  body, which don&rsquo;t, and what your diet and skin actually
                  need. In plain English.
                </p>

                <HeroCapture />
              </div>
            </div>
          </section>
        </div>

        <HowItWorks />

        {/* <Testing /> */}
      </main>

      <SiteFooter />
    </WaitlistProvider>
  );
}
