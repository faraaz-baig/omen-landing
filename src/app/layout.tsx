import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

/* Jost — geometric, Futura-lineage. Light (300) for display; the heavy
   negative tracking lives on .display in globals.css. */
const display = Jost({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
});

export const metadata: Metadata = {
  title: "heyomen.com",
};

/* viewportFit: "cover" is what makes env(safe-area-inset-*) resolve to a real
   number on notched phones — without it the fixed composer sits under the
   home indicator. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} h-full antialiased`}>
      <body className="grain bg-paper text-ink min-h-full">{children}</body>
    </html>
  );
}
