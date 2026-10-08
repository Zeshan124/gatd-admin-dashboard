"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { readConsent, saveConsent } from "@/lib/consent";
import { useConsent } from "@/lib/useConsent";

const MAPS_LINK = "https://maps.google.com/?q=Sultan+Plaza,+100+Jalan+Sultan,+Singapore+199001";

// Google Maps sets its own cookies, so the map only loads once the visitor has
// allowed "External media" in the cookie banner — or clicks "Load map" here.
export default function ContactMap({
  src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7992!2d103.8607!3d1.3006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da19a47be2f459%3A0x8376c5b8cb79b58c!2sSultan%20Plaza%2C%20100%20Jalan%20Sultan%2C%20Singapore%20199001!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg",
  height = "480",
  title = "GATD Office Location",
}) {
  const consent = useConsent();
  const [loadOnce, setLoadOnce] = useState(false);
  const showMap = loadOnce || !!consent?.media;

  // "Always allow" keeps the visitor's existing Analytics choice unchanged.
  const allowAlways = () => {
    const current = readConsent();
    saveConsent({ analytics: !!current?.analytics, media: true });
  };

  return (
    <section className="bg-white">
      <div className="w-full" style={{ height: `${height}px` }}>
        {showMap ? (
          <iframe
            src={src}
            width="100%"
            height="100%"
            style={{ border: 0, filter: "grayscale(100%)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={title}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 px-4">
            <div className="max-w-md text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#D52029]/10 text-[#D52029]">
                <MapPin className="h-7 w-7" aria-hidden />
              </span>
              <p className="mt-4 text-base font-bold text-[#414143]">
                100 Jalan Sultan, #09-06, Sultan Plaza, Singapore 199001
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                This map is provided by Google Maps, which may set its own cookies.
                Load it to view our location.
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setLoadOnce(true)}
                  className="inline-flex items-center justify-center rounded-lg bg-[#D52029] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
                >
                  Load map
                </button>
                <button
                  type="button"
                  onClick={allowAlways}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-[#414143] transition-colors hover:border-[#414143]"
                >
                  Always allow maps
                </button>
              </div>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-[#D52029] underline-offset-4 hover:underline"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
