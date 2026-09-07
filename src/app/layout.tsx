import type { Metadata } from "next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} h-full antialiased`}>
      <body className="grain bg-paper text-ink min-h-full">{children}</body>
    </html>
  );
}
