"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "@/lib/adminApi";
import { canAccess } from "@/lib/permissions";

const TOKEN_KEY = "gatd_admin_token";
const USER_KEY = "gatd_admin_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore session from localStorage on first mount.
  useEffect(() => {
    try {
      const t = window.localStorage.getItem(TOKEN_KEY);
      const u = window.localStorage.getItem(USER_KEY);
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((tk, usr) => {
    setToken(tk || null);
    setUser(usr || null);
    try {
      if (tk) window.localStorage.setItem(TOKEN_KEY, tk);
      else window.localStorage.removeItem(TOKEN_KEY);
      if (usr) window.localStorage.setItem(USER_KEY, JSON.stringify(usr));
      else window.localStorage.removeItem(USER_KEY);
    } catch {
      /* storage unavailable — session lives in memory for this tab */
    }
  }, []);

  // Step 1: email + password. Usually returns a 2FA step instead of a session:
  //   { twoFactor: "verify" | "setup", challengeToken } → the login page shows
  //   the code / QR step, then calls completeLogin() with the final token.
  // (If the server has no 2FA yet it returns { token, user } and we sign in.)
  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login(email, password);
      const data = res?.data || res;
      if (data?.twoFactor && data?.challengeToken) return data;
      if (!data?.token) throw new Error("No token returned from server.");
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  // Step 2 done (code accepted): save the real session.
  const completeLogin = useCallback((tk, usr) => persist(tk, usr), [persist]);

  const logout = useCallback(() => persist(null, null), [persist]);

  // Re-read the signed-in account (role + access) from the server. Called on load
  // so a Super Admin's changes show up in menus/pages without signing out.
  // A 401 here is handled by the API client (session cleared → login page).
  const refreshUser = useCallback(async () => {
    const tk = window.localStorage.getItem(TOKEN_KEY);
    if (!tk) return null;
    try {
      const res = await authApi.me();
      const fresh = res?.data || null;
      if (fresh) persist(tk, fresh);
      return fresh;
    } catch {
      return null; // network hiccup — keep the cached account
    }
  }, [persist]);

  useEffect(() => {
    if (hydrated && token) refreshUser();
    // Only on first load (and after login, which sets a new token).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token]);

  /** can("registrations") / can("blog", "manage") — what to show; the server enforces it. */
  const can = useCallback((moduleKey, level = "view") => canAccess(user, moduleKey, level), [user]);
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{ token, user, hydrated, login, completeLogin, logout, refreshUser, can, isSuperAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
