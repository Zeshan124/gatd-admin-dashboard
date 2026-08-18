// "use client";

// import { useState } from "react";
// import Image from "next/image";

// export default function AboutWhoWeAre() {
//   const [playing, setPlaying] = useState(false);

//   return (
//     <section className="bg-white py-12 sm:py-16 md:py-20">
//       <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
//         {/* Header Row — Left: eyebrow + title | Right: description */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-end mb-8 sm:mb-10">
//           {/* Left */}
//           <div>
//             <p className="text-xs sm:text-sm font-semibold text-[#414143] uppercase tracking-widest mb-3">
//               About Us
//             </p>
//             <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] leading-tight">
//               Who We Are
//             </h2>
//           </div>

//           {/* Right */}
//           <div>
//             <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
//               Global Association for Training & Development empowers individuals
//               and organizations through innovative, customized training
//               solutions.
//             </p>
//           </div>
//         </div>

//         {/* Video Block */}
//         <div
//           className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
//           style={{ height: "clamp(260px, 40vw, 500px)" }}
//           onClick={() => setPlaying(true)}
//         >
//           {!playing ? (
//             <>
//               {/* Thumbnail */}
//               <Image
//                 src="/images/about/who-we-are-video.jpg"
//                 alt="Who We Are video thumbnail"
//                 fill
//                 className="object-cover"
//                 priority
//               />

//               {/* Dark overlay */}
//               {/* <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" /> */}

//               {/* Red Play Button */}
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 group-hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110">
//                   <svg
//                     className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M8 5v14l11-7z" />
//                   </svg>
//                 </div>
//               </div>
//             </>
//           ) : (
//             /* Video Player */
//             // <video
//             //   className="w-full h-full object-cover"
//             //   src="/videos/who-we-are.mp4"
//             //   autoPlay
//             //   controls
//             // />
//             <video
//               className="w-full h-full object-cover"
//               src="/video/play-video.mp4"
//               autoPlay
//               controls
//               playsInline
//             />
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function AboutWhoWeAre() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  // Close modal with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setPlaying(false);
  };

  return (
    <>
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-end mb-8 sm:mb-10">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#414143] uppercase tracking-widest mb-3">
                About Us
              </p>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] leading-tight">
                Who We Are
              </h2>
            </div>

            <div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Global Association for Training & Development empowers
                individuals and organizations through innovative, customized
                training solutions.
              </p>
            </div>
          </div>

          {/* Thumbnail */}
          <div
            className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
            style={{ height: "clamp(260px,40vw,500px)" }}
            onClick={() => setPlaying(true)}
          >
            <Image
              src="/images/about/who-we-are-video.jpeg"
              alt="Who We Are"
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-all duration-300" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:bg-red-700 group-hover:scale-110 transition-all duration-300">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {playing && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Modal Content */}
          <div
            className="relative w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-red-600 text-white text-xl transition-all duration-300"
            >
              ✕
            </button>

            <video
              ref={videoRef}
              src="/video/play-video.mp4"
              className="w-full h-auto bg-black"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}
    </>
  );
}
