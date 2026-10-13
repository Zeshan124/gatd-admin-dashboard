"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";

// Self sign-up is disabled: dashboard accounts are created by a Super Admin
// in Admin → Users. This page stays so old bookmarks get a clear message.
export default function SignupDisabledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/home/GATD-Logo 1.svg" alt="GATD" className="h-10 w-auto mx-auto mb-6" />
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-brand">
          <UserPlus className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-slate-800">Accounts are created by a Super Admin</h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Self sign-up isn&apos;t available. Ask a Super Admin to create a dashboard account for you.
          They&apos;ll send you your sign-in details.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-brand hover:bg-brand-dark py-3 text-sm font-bold text-white transition-colors"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
