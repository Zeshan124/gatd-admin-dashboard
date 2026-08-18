"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/admin/AuthProvider";

export default function Topbar({ onMenu, title }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = (user?.name || "A").charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 sm:px-6 sticky top-0 z-30">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="lg:hidden text-slate-500 hover:text-slate-700"
      >
        <Menu className="w-6 h-6" />
      </button>

      <h1 className="text-lg font-bold text-slate-800 truncate">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg hover:bg-slate-100 pl-1 pr-2 py-1 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold">
              {initial}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role || "—"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || ""}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
