"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import dynamic from "next/dynamic";
const LottiePlayer = dynamic(() => import("@/components/ui/LottiePlayer"), {
  ssr: false,
});
import { Google, GitHub } from "@mui/icons-material";

const ANIMATION_COOKING_POT = "https://assets10.lottiefiles.com/packages/lf20_bpqri9y8.json";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || "Login failed");
      }
      router.push("/planner");
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_#ecfdf5_0%,_transparent_50%),radial-gradient(circle_at_70%_80%,_#f8fafc_0%,_transparent_50%)] pointer-events-none -z-10" />

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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome back</h1>
            <p className="text-slate-500 font-medium font-sans">Log in to manage your kitchen.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => alert("Google login not implemented")} className="w-full rounded-xl border-slate-200 hover:border-emerald-500/30 hover:bg-emerald-50 transition-all font-sans">
              <Google className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" onClick={() => alert("GitHub login not implemented")} className="w-full rounded-xl border-slate-200 hover:border-emerald-500/30 hover:bg-emerald-50 transition-all font-sans">
              <GitHub className="mr-2 h-4 w-4" /> GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-4 text-slate-400 font-bold tracking-widest font-sans">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold ml-1 font-sans">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" title="password" className="text-slate-700 font-bold font-sans">Password</Label>
                <Link href="/forgot-password" title="forgot-password" className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors font-sans">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
              />
            </div>

            <div className="flex items-center space-x-2 ml-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all"
              />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer font-sans">Remember me next time</label>
            </div>

            <Button type="submit" size="lg" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_10px_30px_-5px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border-none font-sans" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 font-medium font-sans">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-emerald-600 font-bold hover:underline underline-offset-4 font-sans">
              Create one now
            </Link>
          </p>
        </div>

        <div className="mt-12 flex justify-center opacity-40 grayscale group hover:grayscale-0 transition-all">
          <LottiePlayer src={ANIMATION_COOKING_POT} className="w-24 h-24" />
        </div>
      </motion.div>
    </div>
  );
}
