"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const posts = [
  {
    id: 1,
    image: "/images/home/blog-1.jpg",
    date: "19th May 2026",
    title: "Why Do We Use It?",
    excerpt:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    href: "/blog/why-do-we-use-it-1",
  },
  {
    id: 2,
    image: "/images/home/blog-2.jpg",
    date: "19th May 2026",
    title: "Why do we use it?",
    excerpt:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    href: "/blog/why-do-we-use-it-2",
  },
  {
    id: 3,
    image: "/images/home/blog-3.jpg",
    date: "19th May 2026",
    title: "Why Do We Use It?",
    excerpt:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    href: "/blog/why-do-we-use-it-3",
  },
  {
    id: 4,
    image: "/images/home/blog-1.jpg",
    date: "12th May 2026",
    title: "The Future of Corporate Training",
    excerpt:
      "Discover how modern organisations are reshaping their approach to learning and development in a rapidly changing world.",
    href: "/blog/future-of-corporate-training",
  },
  {
    id: 5,
    image: "/images/home/blog-2.jpg",
    date: "5th May 2026",
    title: "Leadership in the Digital Age",
    excerpt:
      "Exploring what it means to lead effectively when technology, data, and human intelligence must work seamlessly together.",
    href: "/blog/leadership-digital-age",
  },
];

export default function LatestUpdates() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(".blog-card");
    const cardWidth = (card?.offsetWidth || 320) + 24; // card + gap
    scrollRef.current.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  };

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
          {/* Prev / Next */}
          <div className="flex items-center gap-3">
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
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {posts.map((post, idx) => (
            <div
              key={post.id}
              className="blog-card flex-shrink-0 flex flex-col"
              style={{ width: "clamp(260px, calc(33.33vw - 74px), 400px)", scrollSnapAlign: "start" }}
            >
              {/* Image */}
              <div className="relative w-full rounded-xl overflow-hidden mb-5" style={{ height: "220px" }}>
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Date Badge */}
              <span className="inline-block self-start px-4 py-2 text-sm font-semibold text-slate-700 bg-[#E8E8E8] rounded-lg mb-4">
                {post.date}
              </span>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 leading-snug">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-sm text-slate-600 leading-relaxed mb-5 flex-1">
                {post.excerpt}
              </p>

              {/* Read More */}
              <Link
                href={post.href}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 transition-colors duration-200 ${
                  idx === 1
                    ? "text-[#D52029] hover:text-red-700"
                    : "text-slate-900 hover:text-[#D52029]"
                }`}
              >
                Read more
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}