import ProgramDetail from "./ProgramDetail";

/**
 * Live CMS content on a static export: we only build the client-renderer
 * template. Any /solutions/<slug>/<program>/ URL is routed here by
 * public/.htaccess, and the client reads the program slug from the URL and
 * fetches the Subprogram from the API.
 */
export function generateStaticParams() {
  return [{ slug: "__slug__", program: "__program__" }];
}

export const metadata = {
  title: "Programme — GATD",
};

export default function ProgramPage() {
  return <ProgramDetail />;
}
