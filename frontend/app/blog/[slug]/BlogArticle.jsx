"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, Loader2, AlertTriangle, ChevronRight, Eye, Share2, Check } from "lucide-react";
import DOMPurify from "dompurify";
import { publicBlogsApi } from "@/lib/publicApi";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

function currentSlug() {
  if (typeof window === "undefined") return null;
  const parts = window.location.pathname.split("/").filter(Boolean); // ["blog", "<slug>"]
  return parts[parts.length - 1] || null;
}

// Card used in the "Related articles" grid — mirrors the blog listing card so
// the design stays consistent across all blog pages.
function RelatedCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}/`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">GATD</div>
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand shadow-sm">
            {post.category}
          </span>
        )}
        {post.views != null && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm">
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            {Number(post.views).toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-[#414143] transition-colors duration-300 group-hover:text-brand">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-2 text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(post.publishedAt)}
            </span>
          )}
          {post.readMinutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readMinutes} min read
            </span>
          ) : null}
        </div>

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
          Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

// Brand glyph paths (24×24) — shared with the site footer for a consistent look.
const SHARE_ICONS = {
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
};

function BrandGlyph({ d }) {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Share the current blog to Facebook / LinkedIn / X via their web intents.
// Instagram has no web link-share intent, so it copies the link to paste.
function ShareBar({ title }) {
  const [copied, setCopied] = useState(false);

  const openShare = (network) => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title || "");
    if (network === "instagram") {
      const done = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done).catch(done);
      else done();
      return;
    }
    const target =
      network === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${u}`
        : network === "linkedin"
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${u}`
        : `https://twitter.com/intent/tweet?url=${u}&text=${t}`; // x
    window.open(target, "_blank", "noopener,noreferrer,width=600,height=520");
  };

  const buttons = [
    { key: "facebook", label: "Share on Facebook", cls: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
    { key: "instagram", label: "Copy link for Instagram", cls: "hover:bg-[#E4405F] hover:border-[#E4405F]" },
    { key: "linkedin", label: "Share on LinkedIn", cls: "hover:bg-[#0A66C2] hover:border-[#0A66C2]" },
    { key: "x", label: "Share on X (Twitter)", cls: "hover:bg-black hover:border-black" },
  ];

  return (
    <div className="inline-flex items-center gap-2 sm:ml-auto">
      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
        <Share2 className="h-4 w-4" /> Share
      </span>
      {buttons.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => openShare(b.key)}
          aria-label={b.label}
          title={b.label}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:text-white ${b.cls}`}
        >
          <BrandGlyph d={SHARE_ICONS[b.key]} />
        </button>
      ))}
      {copied && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
          <Check className="h-3.5 w-3.5" /> Link copied
        </span>
      )}
    </div>
  );
}

export default function BlogArticle() {
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);

  const load = useCallback(async () => {
    const slug = currentSlug();
    if (!slug || slug === "__slug__") {
      setStatus("notfound");
      return;
    }
    setStatus("loading");
    try {
      const res = await publicBlogsApi.get(slug);
      setPost(res.data || res);
      setStatus("ready");
    } catch (e) {
      setStatus(e.status === 404 ? "notfound" : "error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The page is client-rendered (static-export sentinel), so per-post SEO — the
  // tab title and <meta name="description"> — is applied here from the CMS fields.
  useEffect(() => {
    if (!post) return;
    document.title = `${post.metaTitle || post.title} — GATD Blog`;
    const desc = post.metaDescription || post.excerpt || "";
    if (desc) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", desc);
    }
  }, [post]);

  // Related articles: every other published post except the one being viewed.
  useEffect(() => {
    if (status !== "ready") return;
    const activeSlug = post?.slug || currentSlug();
    let alive = true;
    publicBlogsApi
      .list({ page: 1, pageSize: 50 })
      .then((res) => {
        if (!alive) return;
        const all = Array.isArray(res?.data) ? res.data : [];
        setRelated(all.filter((p) => p.slug && p.slug !== activeSlug));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [status, post?.slug]);

  // Sanitize the admin HTML and build a Table of Contents from its h2/h3
  // headings, injecting anchor IDs so the TOC links scroll to each section.
  const { html, toc } = useMemo(() => {
    const raw = post?.content || "";
    if (!raw) return { html: "", toc: [] };
    const clean = DOMPurify.sanitize(raw, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "rel"],
    });
    if (typeof window === "undefined" || typeof DOMParser === "undefined") {
      return { html: clean, toc: [] };
    }
    const doc = new DOMParser().parseFromString(clean, "text/html");
    const items = [];
    const seen = {};
    doc.querySelectorAll("h2, h3").forEach((h) => {
      const text = (h.textContent || "").trim();
      if (!text) return;
      const base =
        text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
      let id = base;
      if (seen[base] != null) { seen[base] += 1; id = `${base}-${seen[base]}`; } else { seen[base] = 0; }
      h.setAttribute("id", id);
      items.push({ id, text, level: h.tagName === "H3" ? 3 : 2 });
    });
    return { html: doc.body.innerHTML, toc: items };
  }, [post?.content]);

  if (status === "loading") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center pt-28 text-slate-400">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading article…
      </main>
    );
  }

  if (status === "notfound") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 pt-28 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Article not found</h1>
        <p className="text-slate-500">This post may have been moved or unpublished.</p>
        <Link href="/blog/" className="mt-2 inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-dark">
          <ArrowLeft className="h-4 w-4" /> Back to the blog
        </Link>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 pt-28 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="font-semibold text-slate-700">Couldn&apos;t load this article</p>
        <button onClick={load} className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-24">
      <article className="mx-auto px-6 lg:px-24">
        <Link href="/blog/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>

        <header className="mt-6">
          {post.category && (
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand">{post.category}</span>
          )}
          <h1 className="mt-3 text-4xl font-bold text-[#414143] leading-tight sm:text-5xl">{post.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-100 pb-6 text-sm text-slate-500">
            {(post.authorName || post.authorImage) && (
              <span className="inline-flex items-center gap-2">
                {post.authorImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.authorImage} alt={post.authorName || ""} className="h-8 w-8 rounded-full object-cover" />
                )}
                {post.authorName && <span className="font-semibold text-slate-700">{post.authorName}</span>}
              </span>
            )}
            {post.publishedAt && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {formatDate(post.publishedAt)}
              </span>
            )}
            {post.readMinutes ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {post.readMinutes} min read
              </span>
            ) : null}
            {post.views != null && (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {Number(post.views).toLocaleString()} views
              </span>
            )}

            <ShareBar title={post.title} />
          </div>
        </header>

        {post.coverImage && (
          <div className="mt-8 overflow-hidden rounded-2xl bg-slate-100 font-bold text-[#414143]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        {/* Lead paragraph (excerpt) — standardized below the banner, above the body */}
        {post.excerpt && (
          <p className="mt-8 text-lg sm:text-xl leading-relaxed text-slate-600">{post.excerpt}</p>
        )}

        {/* Mobile: collapsible "On this page", above the content */}
        {toc.length > 0 && (
          <details className="lg:hidden mt-8 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <summary className="cursor-pointer select-none text-sm font-bold text-slate-800">
              On this page
            </summary>
            <ul className="mt-3 space-y-2">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                  <a href={`#${item.id}`} className="group inline-flex items-start gap-1.5 text-sm text-slate-600 hover:text-brand">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-brand" />
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Desktop: Table of Contents (left) + content (right) */}
        <div className={toc.length > 0 ? "mt-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12" : "mt-8"}>
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <nav className="sticky top-28">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">On this page</p>
                <ul className="space-y-2.5 border-l border-slate-200 pl-4">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="group flex items-start gap-1.5 text-sm leading-snug text-slate-600 hover:text-brand transition-colors"
                      >
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                        <span>{item.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}

          {/* Admin-authored HTML body */}
          <div className="blog-content min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </article>

      {/* Related articles — every other published post */}
      {related.length > 0 && (
        <section className="mx-auto mt-20 border-t border-slate-100 px-6 pt-14 lg:px-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Keep reading</p>
              <h2 className="mt-1 text-2xl font-bold text-[#414143] sm:text-3xl">Related articles</h2>
            </div>
            <Link href="/blog/" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <RelatedCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <style jsx global>{`
        .blog-content {
          color: #334155;
          font-size: 1.0625rem;
          line-height: 1.8;
        }
        /* TOC anchors: keep the target heading clear of the sticky navbar. */
        .blog-content :is(h2, h3, h4) {
          scroll-margin-top: 7rem;
        }
        .blog-content h2 {
          font-size: 1.95rem;
          font-weight: 700;
          color: #414143;
          margin: 2.25rem 0 0.85rem;
          line-height: 1.25;
        }
        .blog-content h3 {
          font-size: 1.55rem;
          font-weight: 700;
          color: #414143;
          margin: 1.85rem 0 0.55rem;
          line-height: 1.3;
        }
        .blog-content p {
          margin: 0 0 1.15rem;
        }
        .blog-content a {
          color: var(--color-brand, #b91c1c);
          text-decoration: underline;
        }
        .blog-content ul,
        .blog-content ol {
          margin: 0 0 1.15rem 1.25rem;
        }
        .blog-content ul {
          list-style: disc;
        }
        .blog-content ol {
          list-style: decimal;
        }
        .blog-content li {
          margin: 0.35rem 0;
        }
        .blog-content img {
          border-radius: 0.75rem;
          margin: 1.5rem 0;
          max-width: 100%;
          height: auto;
        }
        .blog-content blockquote {
          border-left: 4px solid var(--color-brand, #b91c1c);
          padding-left: 1rem;
          color: #475569;
          font-style: italic;
          margin: 1.5rem 0;
        }
        .blog-content pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .blog-content h4 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #414143;
          margin: 1.6rem 0 0.5rem;
        }
        /* Editor-authored headings often carry inline colours (e.g. a pasted
           span with color:rgb(0,0,0)). Force the brand ink on headings and any
           nested spans/strong so all body headings render as #414143. */
        .blog-content h1, .blog-content h1 *,
        .blog-content h2, .blog-content h2 *,
        .blog-content h3, .blog-content h3 *,
        .blog-content h4, .blog-content h4 *,
        .blog-content h5, .blog-content h5 *,
        .blog-content h6, .blog-content h6 * {
          color: #414143 !important;
          font-weight: 700 !important;
        }
        .blog-content figure {
          margin: 1.5rem 0;
        }
        .blog-content figure img {
          margin: 0;
        }
        .blog-content figcaption {
          font-size: 0.875rem;
          color: #64748b;
          text-align: center;
          margin-top: 0.5rem;
        }
        .blog-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
        }
        .blog-content th,
        .blog-content td {
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .blog-content iframe {
          max-width: 100%;
          width: 100%;
          aspect-ratio: 16 / 9;
          border: 0;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }
        .blog-content .image-style-side {
          float: right;
          max-width: 50%;
          margin: 0 0 1rem 1.5rem;
        }
      `}</style>
    </main>
  );
}
