import BlogArticle from "./BlogArticle";

/**
 * Live model on a static export: we only build the client-renderer template.
 * Any /blog/<slug>/ URL is routed to this template by public/.htaccess, and the
 * client reads the real slug from the URL and fetches the post from the API.
 * (Building the sentinel guarantees the fallback target HTML exists.)
 */
export function generateStaticParams() {
  return [{ slug: "__slug__" }];
}

export const metadata = {
  title: "Article — GATD Blog",
  // Fallback for the static sentinel HTML; the client overrides both title and
  // description per-post from the CMS once the article loads (see BlogArticle).
  description:
    "Insights, frameworks and perspectives on HR, leadership and organisational development from GATD.",
};

export default function BlogDetailPage() {
  return <BlogArticle />;
}
