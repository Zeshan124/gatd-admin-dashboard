"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SitePopup from "@/components/SitePopup";

// Google Analytics 4 measurement ID (Google tag supplied by the client).
// Loaded only on the public site — the admin dashboard is not tracked.
const GA_MEASUREMENT_ID = "G-4BRHJHFY7N";

/**
 * Renders the public marketing chrome (Navbar + Footer + Google tag) on every
 * route EXCEPT the admin dashboard, which ships its own shell/layout.
 */
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen">
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Navbar />
      {children}
      <Footer />
      <SitePopup />
    </div>
  );
}
