import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";

// Fonts are self-hosted copies of the exact files the design export loads (see scripts/fetch-fonts.mjs).
const PRELOAD_FONTS = [
  "/fonts/bricolage-grotesque-normal-300-800-latin.woff2",
  "/fonts/instrument-serif-italic-400-latin.woff2",
  "/fonts/dm-mono-normal-400-latin.woff2",
  "/fonts/dm-mono-normal-500-latin.woff2",
];

export const metadata: Metadata = {
  title: "Harnish Kapoor — Landing",
  description: "Harnish Kapoor — Graphic Designer & Motion Graphic Designer. Stories drawn by hand and set in motion.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F3EC",
};

// Fits the 1920×1080 artboard into the window before first paint, then on every resize.
// At exactly 1:1 no transform is applied, so text renders exactly as in the design export.
const fitStage = `(function(){var d=document.documentElement;function f(){var w=innerWidth,h=innerHeight,s=Math.min(w/1920,h/1080);d.style.setProperty('--s',s);d.style.setProperty('--stage-transform',s===1?'none':'scale('+s+')');d.style.setProperty('--ox',(w-1920*s)/2+'px');d.style.setProperty('--oy',(h-1080*s)/2+'px')}f();addEventListener('resize',f)})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: fitStage writes --s/--ox/--oy on <html> before React hydrates
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: fitStage }} />
        {PRELOAD_FONTS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
