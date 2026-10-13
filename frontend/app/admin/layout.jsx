"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Eye, Lock } from "lucide-react";
import { AuthProvider, useAuth } from "@/components/admin/AuthProvider";
import Sidebar, { NAV } from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { moduleForPath } from "@/lib/permissions";

function NoAccess() {
  return (
    <div className="max-w-lg mx-auto mt-16 rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Lock className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-800">You don&apos;t have access to this section</h2>
      <p className="mt-2 text-sm text-slate-500">
        Ask a Super Admin if you need access. Use the menu to open a section you can access.
      </p>
    </div>
  );
}

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
  const { token, hydrated, can } = useAuth();

  const isAuthPage = AUTH_ROUTES.includes(pathname);
  // Access for the current page: null module = open to every signed-in user.
  const pageModule = moduleForPath(pathname);
  const canView = !pageModule || can(pageModule, "view");
  const viewOnly = canView && pageModule && pageModule !== "users" && !can(pageModule, "manage");
  // People without Overview access land on their first available section instead.
  const firstAllowed = NAV.find((item) => can(item.module, "view"))?.href;

  useEffect(() => {
    if (hydrated && token && pathname === "/admin" && !canView && firstAllowed && firstAllowed !== "/admin") {
      router.replace(firstAllowed);
    }
  }, [hydrated, token, pathname, canView, firstAllowed, router]);
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {!canView ? (
            // On /admin with a redirect pending, show nothing instead of a flash of "no access".
            pathname === "/admin" && firstAllowed ? null : <NoAccess />
          ) : (
            <>
              {viewOnly && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                  <Eye className="h-4 w-4 shrink-0" />
                  You have view-only access to this section. Changes you try to save will be blocked.
                </div>
              )}
              {children}
            </>
          )}
        </main>
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
