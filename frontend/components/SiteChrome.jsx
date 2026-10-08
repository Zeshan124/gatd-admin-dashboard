"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SitePopup from "@/components/SitePopup";
import CookieConsent from "@/components/CookieConsent";
import { useConsent } from "@/lib/useConsent";
import { clearAnalyticsCookies } from "@/lib/consent";

// Google Analytics 4 measurement ID (Google tag supplied by the client).
// Loaded only on the public site — the admin dashboard is not tracked.
const GA_MEASUREMENT_ID = "G-4BRHJHFY7N";

/**
 * Google tag, loaded ONLY after the visitor accepts Analytics in the cookie
 * banner. If consent is later withdrawn, tracking is switched off for the rest
 * of the page view and the GA cookies are deleted.
 */
function GoogleAnalytics() {
  const consent = useConsent();
  const allowed = !!consent?.analytics;

  useEffect(() => {
    if (consent === undefined) return; // not read yet
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = !allowed;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: allowed ? "granted" : "denied" });
    }
    if (!allowed) clearAnalyticsCookies();
  }, [consent, allowed]);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

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
      {/* Google tag (gtag.js) — only after Analytics consent */}
      <GoogleAnalytics />
      <Navbar />
      {children}
      <Footer />
      <SitePopup />
      <CookieConsent />
    </div>
  );
}
