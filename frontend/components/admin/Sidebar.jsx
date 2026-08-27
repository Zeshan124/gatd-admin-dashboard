"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Mail,
  FileDown,
  GraduationCap,
  Layers,
  BookOpen,
  Newspaper,
  Users,
  Activity,
  X,
} from "lucide-react";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Registrations", href: "/admin/registrations", icon: ClipboardList },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Brochure Leads", href: "/admin/brochures", icon: FileDown },
  { label: "Solutions", href: "/admin/solutions", icon: GraduationCap },
  { label: "Programs", href: "/admin/programs", icon: Layers },
  { label: "Subprograms", href: "/admin/subprograms", icon: BookOpen },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  // { label: "Users", href: "/admin/users", icon: Users },
  // { label: "Activity", href: "/admin/activity", icon: Activity },
];

export default function Sidebar({ open, onClose }) {
  const rawPathname = usePathname();
  // `trailingSlash: true` yields paths like "/admin/registrations/"; normalize
  // so the active-link exact match on "/admin" still works.
  const pathname =
    rawPathname && rawPathname !== "/"
      ? rawPathname.replace(/\/+$/, "")
      : rawPathname;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 shrink-0">
          <Link href="/admin" onClick={onClose} className="flex items-center">
            <img
              src="/images/home/GATD-Logo 1.svg"
              alt="GATD"
              className="h-9 w-auto"
            />
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 shrink-0">
          © {new Date().getFullYear()} GATD
        </div>
      </aside>
    </>
  );
}
