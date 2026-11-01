import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Heavy media (artwork, showreels) will live on a media CDN, not in this repo.
    // Add its host here when the Projects chapter is built, e.g.
    // { protocol: "https", hostname: "res.cloudinary.com" }
    remotePatterns: [],
  },
};

export default nextConfig;
