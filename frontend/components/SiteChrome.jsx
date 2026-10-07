"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SitePopup from "@/components/SitePopup";

/**
 * Renders the public marketing chrome (Navbar + Footer) on every route
 * EXCEPT the admin dashboard, which ships its own shell/layout.
 */
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <Footer />
      <SitePopup />
    </div>
  );
}
