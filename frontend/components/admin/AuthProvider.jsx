"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "@/lib/adminApi";

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

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login(email, password);
      const data = res?.data || res;
      if (!data?.token) throw new Error("No token returned from server.");
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const signup = useCallback(
    async (payload, signupKey) => {
      const res = await authApi.signup(payload, signupKey);
      const data = res?.data || res;
      // Some backends auto-issue a token on signup; if so, log in immediately.
      if (data?.token) persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const logout = useCallback(() => persist(null, null), [persist]);

  return (
    <AuthContext.Provider
      value={{ token, user, hydrated, login, signup, logout }}
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
