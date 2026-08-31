"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Loader2, AlertTriangle } from "lucide-react";
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

export default function BlogArticle() {
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [post, setPost] = useState(null);

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

  useEffect(() => {
    if (post?.title) document.title = `${post.title} — GATD Blog`;
  }, [post]);

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

  // Defense-in-depth: sanitize the admin-authored HTML before rendering.
  // Runs client-side only (this branch renders after the client fetch).
  const cleanHtml = DOMPurify.sanitize(post.content || "", {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "rel"],
  });

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
          <h1 className="mt-3 text-3xl font-bold text-[#414143] sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-slate-500">{post.excerpt}</p>}

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
          </div>
        </header>

        {post.coverImage && (
          <div className="mt-8 overflow-hidden rounded-2xl bg-slate-100 font-bold text-[#414143]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        {/* Admin-authored HTML body */}
        <div className="blog-content mt-8" dangerouslySetInnerHTML={{ __html: cleanHtml }} />

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-100 pt-6">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>

      <style jsx global>{`
        .blog-content {
          color: #334155;
          font-size: 1.0625rem;
          line-height: 1.8;
        }
        .blog-content h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #414143;
          margin: 2rem 0 0.75rem;
        }
        .blog-content h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #414143;
          margin: 1.75rem 0 0.5rem;
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
          font-size: 1.1rem;
          font-weight: 700;
          color: #414143;
          margin: 1.5rem 0 0.5rem;
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
