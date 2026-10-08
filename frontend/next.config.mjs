/** @type {import('next').NextConfig} */

// Static export is only used for the production build (`next build`). In `next dev`
// we run a normal dev server so dynamic routes like /blog/[slug] work for any slug
// without pre-listing every param in generateStaticParams() — the live blog posts
// are resolved at runtime (and via the public/.htaccess fallback in production).
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // The dev server uses its own build dir so running `next build` while
  // `next dev` is up doesn't overwrite its files (which breaks its CSS).
  // Production keeps the default .next so the static export still lands in `out/`
  // (with output: "export", a custom distDir would replace `out/`).
  ...(isProd ? { output: "export" } : { distDir: ".next-dev" }),
  images: { unoptimized: true },
  // Emit `route/index.html` per page so Apache/cPanel serves clean URLs
  // (and admin deep links / refreshes work) without custom rewrites.
  trailingSlash: true,
};

export default nextConfig;
