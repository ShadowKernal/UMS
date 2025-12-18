"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || "Unable to send reset email");
      }
      setMessage("Reset link sent! Please check your email.");
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Forgot password?</h1>
            <p className="text-slate-500 font-medium font-sans">No worries, we&apos;ll send you instructions.</p>
          </div>

          {message ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-4">
                <p className="text-emerald-700 font-bold bg-emerald-50 p-4 rounded-2xl border border-emerald-100 font-sans">
                  {message}
                </p>
                <div className="space-y-2 text-left">
                  <Label htmlFor="token" className="text-slate-700 font-bold ml-1 font-sans">Reset Code</Label>
                  <Input
                    id="token"
                    placeholder="Enter the code from your email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Link href={`/reset-password?token=${encodeURIComponent(token)}`} className="block">
                  <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-200 font-sans" disabled={!token}>
                    Continue to Reset
                  </Button>
                </Link>
                <Link href="/login" className="block text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors font-sans">
                  Back to Login
                </Link>
              </div>
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
                <Label htmlFor="email" className="text-slate-700 font-bold ml-1 font-sans">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                  className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
                />
              </div>

              <Button type="submit" size="lg" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_10px_30px_-5px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border-none font-sans" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors inline-flex items-center gap-2 font-sans">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
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
