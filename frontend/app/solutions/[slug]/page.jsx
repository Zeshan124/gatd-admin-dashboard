import SolutionDetail from "./SolutionDetail";

/**
 * Live CMS content on a static export: we only build the client-renderer
 * template. Any /solutions/<slug>/ URL is routed here by public/.htaccess, and
 * the client reads the real slug from the URL and fetches the Program from the
 * API. (Building the sentinel guarantees the fallback target HTML exists.)
 */
export function generateStaticParams() {
  return [{ slug: "__slug__" }];
}

export const metadata = {
  title: "Solution — GATD",
};

export default function SolutionPage() {
  return <SolutionDetail />;
}
