"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Loader2, Inbox, AlertTriangle } from "lucide-react";
import { publicBlogsApi } from "@/lib/publicApi";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function BlogCard({ post }) {
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
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg sm:text-xl font-bold leading-snug duration-300 group-hover:text-brand transition-colors">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-2 text-sm text-slate-500 line-clamp-3">{post.excerpt}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          {post.authorName && <span className="font-medium text-slate-500">{post.authorName}</span>}
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

export default function BlogListingPage() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await publicBlogsApi.list({ page, pageSize: 12 });
      setPosts(res.data || []);
      setMeta(res.meta || null);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = meta?.totalPages ?? 1;

  return (
    <main>
      {/* Header */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-28 pb-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Insights</p>
          <h1 className="mt-2 text-4xl font-black text-[#414143] leading-[1.1] sm:text-5xl">The GATD Blog</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            Ideas, frameworks and perspectives on HR, leadership and organisational development.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        {status === "loading" ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading posts…
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <p className="font-semibold text-slate-700">Couldn&apos;t load the blog</p>
            <button onClick={load} className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <Inbox className="h-8 w-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No posts yet</p>
            <p className="text-sm text-slate-400">Check back soon for new articles.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
