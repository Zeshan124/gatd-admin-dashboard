"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/admin/AuthProvider";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

const TITLES = {
  "/admin": "Overview",
  "/admin/registrations": "Registrations",
  "/admin/programs": "Programs",
  "/admin/company-profile": "Company Profile",
  "/admin/site-popup": "Website Popup",
  "/admin/accreditation": "Accredited By",
  "/admin/sitemap": "Sitemap",
  "/admin/newsletter": "Newsletter",
  "/admin/users": "Users",
  "/admin/activity": "Activity",
};

const AUTH_ROUTES = ["/admin/login", "/admin/signup"];

function AdminShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const rawPathname = usePathname();
  // `trailingSlash: true` makes usePathname() return e.g. "/admin/login/";
  // strip the trailing slash so exact-match route checks work.
  const pathname =
    rawPathname && rawPathname !== "/"
      ? rawPathname.replace(/\/+$/, "")
      : rawPathname;
  const router = useRouter();
  const { token, hydrated } = useAuth();

  const isAuthPage = AUTH_ROUTES.includes(pathname);
  const title =
    TITLES[pathname] ||
    (pathname?.startsWith("/admin/registrations") ? "Registrations" : "Admin");

  // Redirect unauthenticated users to login (once storage has been read).
  useEffect(() => {
    if (hydrated && !token && !isAuthPage) {
      router.replace("/admin/login");
    }
  }, [hydrated, token, isAuthPage, router]);

  // Avoid a flash before we know the auth state.
  if (!hydrated) return <div className="min-h-screen bg-slate-50" />;

  // Login / signup — no dashboard chrome.
  if (isAuthPage) return <div className="min-h-screen bg-slate-50">{children}</div>;

  // Not authenticated → the effect above is redirecting; render nothing.
  if (!token) return <div className="min-h-screen bg-slate-50" />;

  // Authenticated dashboard shell.
  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar onMenu={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
