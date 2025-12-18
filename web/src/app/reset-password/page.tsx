"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = params.get("token");
    if (t) setToken(t);
  }, [params]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Reset failed");
      setMessage("Password successfully reset! Redirecting...");

      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_20%,_#ecfdf5_0%,_transparent_50%)] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">PrepMaster</span>
          </Link>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-10 bg-white/80 border-slate-200/60 shadow-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Set new password</h1>
            <p className="text-slate-500 font-medium font-sans">Your new password must be at least 8 characters.</p>
          </div>

          {message ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-emerald-50 text-emerald-600 shadow-inner">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-700 font-bold bg-emerald-50 p-4 rounded-2xl border border-emerald-100 font-sans">
                {message}
              </p>
              <Link href="/login" className="block">
                <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-200 font-sans">
                  Sign In Now
                </Button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 font-sans"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="token" className="text-slate-700 font-bold ml-1 font-sans">Reset Code</Label>
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder="Enter the code from your email"
                  className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="password" className="text-slate-700 font-bold ml-1 font-sans">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
                />
              </div>

              <Button type="submit" size="lg" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_10px_30px_-5px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border-none font-sans" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors font-sans">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-bold text-emerald-600 tracking-widest uppercase text-xs">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
