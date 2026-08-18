"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Customized Training Program",
    description: "GATD understands that each organization and individual has unique training needs. We offer customized training programs tailored to specific industries, job roles, and skill levels. Our team of expert trainers designs engaging and interactive learning experiences that address the specific challenges faced by our clients.",
  },
  {
    id: 2,
    title: "Industry Relevant Curriculum",
    description: "We stay updated with the latest industry trends and advancements to develop training programs that are relevant and in line with the current market demands. Our curriculum covers a wide range of topics, including leadership development, technical skills, communication, project management, customer service, and more.",
  },
  {
    id: 3,
    title: "Expert Trainers",
    description: "GATD takes pride in its team of experienced and knowledgeable trainers who bring a wealth of expertise from various industries. Our trainers are not only subject matter experts but also skilled facilitators who create an engaging and interactive learning environment. They are dedicated to helping individuals develop practical skills and gain valuable insights.",
  },
  {
    id: 4,
    title: "Blended Learning Approach",
    description: "GATD embraces a blended learning approach that combines the best of traditional classroom training with modern digital resources. We utilize a variety of learning methods, including instructor-led sessions, hands-on exercises, case studies, group discussions, e-learning modules, and virtual classrooms. This approach ensures a well-rounded learning experience that caters to different learning styles",
  },
  {
    id: 5,
    title: "Continuous Learning Approach",
    description: "GATD believes that learning is a lifelong journey. To support our participants beyond the training programs, we provide ongoing learning resources, including access to online libraries, webinars, and discussion forums. This commitment to continuous learning ensures that individuals can apply their acquired skills effectively and stay ahead in their respective fields.",
  },
  {
    id: 6,
    title: "Future Management Consulting",
    description: "Our competitive advantage is further strengthened by our track record of delivering tangible results. We have helped numerous individuals and organizations achieve their goals, improve performance, and drive success through our training programs. Our satisfied clients and their success stories serve as a testament to the effectiveness and impact of our training solutions.",
  },
  {
    id: 7,
    title: "Flexible Delivery Options",
    description: "Recognizing the importance of flexibility, GATD offers multiple delivery options for training programs. We provide on-site training at the client’s location, enabling organizations to train their employees conveniently. Additionally, we offer virtual training solutions, allowing participants to access courses remotely, making it accessible to a wider audience regardless of geographical location.",
  },
];

export default function KeyFeatures() {
  const [openId, setOpenId] = useState(null);

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-start mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] leading-tight">
            Key Features
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
            At GATD, we design impactful learning experiences that combine real-world expertise with flexible delivery and long-term development support. Every program is built to meet industry needs, helping professionals gain practical skills, stay future-ready, and achieve measurable results in their careers and organisations.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left — Accordion */}
          <div className="divide-y divide-slate-200">
            {features.map((f) => {
              const isOpen = openId === f.id;
              return (
                <div key={f.id}>
                  <button
                    onClick={() => setOpenId(isOpen ? null : f.id)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                  >
                    <span className={`text-base sm:text-lg font-bold leading-snug transition-colors duration-200 ${isOpen ? "text-[#414143]" : "text-[#414143] group-hover:text-[#D52029]"}`}>
                      {f.title}
                    </span>
                    <ChevronDown className={`w-5 h-5 shrink-0 text-[#414143] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"}`}>
                    <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right — Sticky image */}
          <div className="lg:sticky lg:top-24">
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "clamp(320px, 42vw, 520px)" }}>
              <Image
                src="/images/services/key.jpg"
                alt="Key Features"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
