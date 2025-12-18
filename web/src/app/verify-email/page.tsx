"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

function VerifyEmailForm() {
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const verify = async (tokenToVerify: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Verification failed");
      setMessage("Email verified successfully! You can now sign in.");
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

  const submit = (e: FormEvent) => {
    e.preventDefault();
    verify(token);
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
          {!message ? (
            <>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Verify Email</h1>
                <p className="text-slate-500 font-medium font-sans">Please enter the code sent to your email.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 font-sans"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={submit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-slate-700 font-bold ml-1 font-sans">Verification Code</Label>
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    placeholder="Enter your token"
                    autoFocus={!token}
                    className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans font-mono"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_10px_30px_-5px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border-none font-sans" disabled={loading || !token}>
                  {loading ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors font-sans">
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
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
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Verified!</h3>
                <p className="text-slate-500 font-medium font-sans">{message}</p>
              </div>
              <Link href="/login" className="block">
                <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-200 font-sans">
                  Sign In Now
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-bold text-emerald-600 tracking-widest uppercase text-xs">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
