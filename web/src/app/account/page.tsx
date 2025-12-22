"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type MeResponse = {
  user: { id: string; email: string; status: string; roles: string[] };
  csrfToken: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Unable to load account");
      } else {
        setMe(data);
      }
    };
    run();
  }, [router]);

  const logout = async (all = false) => {
    if (!me) return;
    await fetch(all ? "/api/auth/logout-all" : "/api/auth/logout", {
      method: "POST",
      headers: { "x-csrf-token": me.csrfToken }
    });
    router.push("/login");
  };

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 pt-28 pb-16">
        <div className="max-w-xl mx-auto rounded-3xl border border-emerald-100/60 bg-white/90 shadow-xl px-8 py-10 text-center">
          <p className="text-sm font-semibold text-rose-500">Account unavailable</p>
          <p className="mt-3 text-slate-600">{error}</p>
          <div className="mt-6 flex justify-center">
            <Link href="/login">
              <Button>Back to login</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 pt-28 pb-16">
        <div className="max-w-xl mx-auto rounded-3xl border border-emerald-100/60 bg-white/90 shadow-xl px-8 py-10 text-center">
          <p className="text-slate-500 font-medium">Loading account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 pt-28 pb-16">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-emerald-100/60 bg-white/90 shadow-xl px-8 py-10 md:px-10 md:py-12">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Account</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Your profile</h1>
            <p className="text-slate-500">Manage your session and account details.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Email</p>
              <p className="mt-2 text-slate-900 font-medium break-all">{me.user.email}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Status</p>
              <p className="mt-2 text-slate-900 font-medium">{me.user.status}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Roles</p>
              <p className="mt-2 text-slate-900 font-medium">{me.user.roles.join(", ") || "USER"}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button onClick={() => logout(false)}>Sign out</Button>
            <Button variant="outline" onClick={() => logout(true)}>
              Sign out all devices
            </Button>
            <Link href="/planner">
              <Button variant="ghost">Return to planner</Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <Link href="/admin/users" className="hover:text-emerald-600 transition-colors">
              Admin: users
            </Link>
            <Link href="/dev/outbox" className="hover:text-emerald-600 transition-colors">
              Dev outbox
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
