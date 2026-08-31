"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Inbox, AlertTriangle } from "lucide-react";
import { publicBlogsApi } from "@/lib/publicApi";

const LATEST_COUNT = 6;

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export default function LatestUpdates() {
  const scrollRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await publicBlogsApi.list({ page: 1, pageSize: LATEST_COUNT });
      setPosts(Array.isArray(res?.data) ? res.data : []);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(".blog-card");
    const cardWidth = (card?.offsetWidth || 320) + 24; // card + gap
    scrollRef.current.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  };

  const hasPosts = status === "ready" && posts.length > 0;

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Badge */}
        <span className="inline-block px-4 py-2 text-sm font-semibold text-slate-700 bg-[#E8E8E8] rounded-lg mb-4">
          Blogs
        </span>

        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#414143] leading-tight">
            Latest Updates
          </h2>
        </div>

        {/* Controls Row — Arrows left, Button right */}
        <div className="flex items-center justify-between mb-8">
          {/* Prev / Next (only useful when there are cards to scroll) */}
          <div className="flex items-center gap-3">
            {hasPosts && (
              <>
                <button
                  onClick={() => scroll("left")}
                  className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-slate-300 text-slate-700 hover:border-[#D52029] hover:text-[#D52029] hover:bg-red-50 transition-all duration-200"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-slate-300 text-slate-700 hover:border-[#D52029] hover:text-[#D52029] hover:bg-red-50 transition-all duration-200"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Explore More */}
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Explore More
          </Link>
        </div>

        {/* Cards Strip */}
        {status === "loading" ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading latest posts…
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <p className="font-semibold text-slate-600">Blogs couldn&apos;t be loaded right now</p>
            <p className="text-sm text-slate-400">Please check back soon.</p>
            <button
              onClick={load}
              className="mt-2 rounded-lg border-2 border-[#D52029] px-4 py-2 text-sm font-bold text-[#D52029] hover:bg-[#D52029] hover:text-white transition-colors"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Inbox className="h-8 w-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No blogs found</p>
            <p className="text-sm text-slate-400">New articles will appear here soon.</p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}/`}
                className="blog-card group flex-shrink-0 flex flex-col"
                style={{ width: "clamp(260px, calc(33.33vw - 74px), 400px)", scrollSnapAlign: "start" }}
              >
                {/* Image */}
                <div className="relative w-full rounded-xl overflow-hidden mb-5 bg-slate-100" style={{ height: "220px" }}>
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold">GATD</div>
                  )}
                </div>

                {/* Date Badge */}
                {post.publishedAt && (
                  <span className="inline-block self-start px-4 py-2 text-sm font-semibold text-slate-700 bg-[#E8E8E8] rounded-lg mb-4">
                    {formatDate(post.publishedAt)}
                  </span>
                )}

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-[#D52029] transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-5 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                {/* Read More */}
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 text-slate-900 group-hover:text-[#D52029] transition-colors duration-200">
                  Read more
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}

      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
