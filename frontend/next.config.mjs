/** @type {import('next').NextConfig} */

// Static export is only used for the production build (`next build`). In `next dev`
// we run a normal dev server so dynamic routes like /blog/[slug] work for any slug
// without pre-listing every param in generateStaticParams() — the live blog posts
// are resolved at runtime (and via the public/.htaccess fallback in production).
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  ...(isProd ? { output: "export" } : {}),
  images: { unoptimized: true },
  // Emit `route/index.html` per page so Apache/cPanel serves clean URLs
  // (and admin deep links / refreshes work) without custom rewrites.
  trailingSlash: true,
};

export default nextConfig;
