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

const ANIMATION_HEALTHY_BOWL = "https://lottie.host/fff10634-ed3e-48e1-994c-b19da3c8c3d6/2BLrWoB9H9.lottie";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  const startGoogle = () => {
    setOauthLoading("google");
    const redirect = "/admin";
    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, profile: { displayName } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Signup failed");
      setStatus(data.status);
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_70%_20%,_#ecfdf5_0%,_transparent_50%),radial-gradient(circle_at_30%_80%,_#f8fafc_0%,_transparent_50%)] pointer-events-none -z-10" />

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
          {status ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-emerald-50 text-emerald-600 mb-6 shadow-inner ring-1 ring-emerald-100">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Check your inbox</h3>
              <p className="text-slate-500 mb-8 font-medium font-sans">
                We&apos;ve sent a verification link to your email. Please verify to complete your registration.
              </p>
              <div className="space-y-4">
                <Button onClick={() => router.push("/verify-email")} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-200 font-sans">
                  Go to Verification
                </Button>
                <Link href="/login" className="block text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors font-sans">
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Create an account</h1>
                <p className="text-slate-500 font-medium font-sans">Start your journey to elite meal prep.</p>
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
                <Button variant="outline" onClick={startGoogle} disabled={oauthLoading === "google"} className="w-full rounded-xl border-slate-200 hover:border-emerald-500/30 hover:bg-emerald-50 transition-all font-sans">
                  <Google className="mr-2 h-4 w-4" /> {oauthLoading === "google" ? "..." : "Google"}
                </Button>
                <Button variant="outline" onClick={() => alert("GitHub signup not implemented")} className="w-full rounded-xl border-slate-200 hover:border-emerald-500/30 hover:bg-emerald-50 transition-all font-sans">
                  <GitHub className="mr-2 h-4 w-4" /> GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 px-4 text-slate-400 font-bold tracking-widest font-sans">Or sign up with email</span>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-bold ml-1 font-sans">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-bold ml-1 font-sans">Display Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                    placeholder="How should we call you?"
                    className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" title="password" className="text-slate-700 font-bold ml-1 font-sans">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1 font-sans">Min. 8 characters</p>
                </div>

                <Button type="submit" size="lg" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_10px_30px_-5px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border-none font-sans" disabled={loading}>
                  {loading ? "Creating account..." : "Start Journey"}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500 font-medium font-sans">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 font-bold hover:underline underline-offset-4 font-sans">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        <div className="mt-12 flex justify-center opacity-40 grayscale group hover:grayscale-0 transition-all">
          <LottiePlayer src={ANIMATION_HEALTHY_BOWL} className="w-24 h-24" />
        </div>
      </motion.div>
    </div>
  );
}
