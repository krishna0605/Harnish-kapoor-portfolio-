import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";

// Fonts are self-hosted copies of the exact files the design loads (see scripts/fetch-fonts.mjs).
const PRELOAD_FONTS = [
  "/fonts/bricolage-grotesque-normal-300-800-latin.woff2",
  "/fonts/instrument-serif-italic-400-latin.woff2",
  "/fonts/dm-mono-normal-400-latin.woff2",
];

export const metadata: Metadata = {
  title: "Harnish Kapoor — Graphic & Motion Designer",
  description: "Harnish Kapoor — Graphic Designer & Motion Graphic Designer. Stories drawn by hand and set in motion.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F3EC",
};

// Marks that JS is running so reveal animations can hide their elements before first paint.
const markJs = `document.documentElement.classList.add('js');`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: markJs adds a class to <html> before React hydrates
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: markJs }} />
        {PRELOAD_FONTS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
