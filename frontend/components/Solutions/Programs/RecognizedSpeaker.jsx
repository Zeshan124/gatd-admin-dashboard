"use client";

import Image from "next/image";

const defaultCertification = {
  badge: "Recognised Speaker Credentials",
  heading: "Certification\non Successful\nCompletion",
  paragraphs: [
    "When you complete the program, you will receive the Strategic HR Business Partner Certification from EIU Paris and the Global Association for Training & Development (GATD).",
    "This certification recognizes your expertise in boardroom-level HR strategy. It shows your commitment to global standards, innovative leadership, and your ability to drive business success through strategic HR management.",
  ],
  image: "/images/solutions/strategic-hr/certificate_image.jpg",
};

export default function RecognizedSpeaker({ certification }) {
  const { badge, heading, paragraphs, image } = certification || defaultCertification;
  const headingLines = heading.split("\n");

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Certificate Image */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm sm:max-w-full">
              <Image
                src={image}
                alt={headingLines[0] || "Certification"}
                width={480}
                height={620}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Right — Content */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <span className="inline-block self-start px-4 py-2 text-sm font-semibold text-slate-700 bg-[#E8E8E8] rounded-lg mb-6">
              {badge}
            </span>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#414143] leading-tight mb-6">
              {headingLines.map((line, i) => (
                <span key={i}>{line}{i < headingLines.length - 1 && <br />}</span>
              ))}
            </h2>

            {/* Paragraphs */}
            {paragraphs.map((p, i) => (
              <p key={i} className={`text-sm sm:text-base text-slate-600 leading-relaxed ${i < paragraphs.length - 1 ? "mb-4" : ""}`}>
                {p}
              </p>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
