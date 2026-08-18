"use client";

import Image from "next/image";

export default function FounderMessage() {
  return (
    <section className="bg-[#F8F8F8] py-14 sm:py-18 md:py-24 overflow-hidden">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Top — centered badge + heading */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-5 py-2 text-sm font-semibold text-slate-700 bg-[#E8E8E8] rounded-lg mb-5">
            A Message From the Founder and CEO
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] leading-tight max-w-2xl mx-auto">
            Global Association from Training & Development
          </h2>
        </div>

        {/* Bottom — image left, quote right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left — founder photo with decorative blobs */}
          <div className="relative flex items-end justify-center lg:justify-start">
            {/* Red blob */}
            {/* <div className="absolute bottom-0 left-4 sm:left-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#D52029] -z-0" /> */}
            {/* Grey blob */}
            {/* <div className="absolute top-4 right-4 sm:right-10 w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-slate-200 -z-0" /> */}

            {/* Photo */}
            <div className="relative z-10">
              <Image
                src="/images/about/Khazi-M-Zafar.png"
                alt="Khazi M. Zafar — Founder and CEO"
                width={420}
                height={480}
                className="object-contain w-full h-auto drop-shadow-xl"
                priority
              />
            </div>
          </div>

          {/* Right — quote block */}
          <div className="relative">
            {/* Large opening quote mark */}
            <svg
              className="absolute -top-4 -left-2 w-16 h-16 sm:w-20 sm:h-20 text-slate-200 select-none"
              viewBox="0 0 60 60"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 30C0 13.4 13.4 0 30 0v10C19 10 10 19 10 30h10v30H0V30zm30 0C30 13.4 43.4 0 60 0v10C49 10 40 19 40 30h10v30H30V30z" />
            </svg>

            <blockquote className="relative z-10 text-lg sm:text-xl text-slate-700 leading-relaxed mb-6 pt-8">
              Let's commit to Continuous learning, growth, and productivity, not just for our individual pockets, but to develop talent and elevate organizations' performance. Our efforts should drive innovation, enhance capabilities, and contribute to national progress by raising standards for individuals and organizations alike.
            </blockquote>

            {/* Closing quote mark */}
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mb-6 select-none"
              viewBox="0 0 60 60"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M60 30C60 46.6 46.6 60 30 60V50c11 0 20-9 20-20H40V0h20v30zm-30 0C30 46.6 16.6 60 0 60V50c11 0 20-9 20-20H10V0h20v30z" />
            </svg>

            {/* Name & title */}
            <div>
              <p className="text-lg font-bold text-[#D52029]">Khazi M. Zafar</p>
              <p className="text-sm text-slate-500">Founder and CEO</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
