/**
 * Single place that turns a media path into a URL.
 *
 * Today everything is served from /public. When heavy work moves to a media CDN
 * (Cloudinary for images, Mux/Bunny for video), set NEXT_PUBLIC_MEDIA_BASE_URL
 * and add the host to images.remotePatterns in next.config.ts.
 */
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "";

export function mediaUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${MEDIA_BASE_URL}${clean}`;
}
