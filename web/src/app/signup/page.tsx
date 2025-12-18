"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import dynamic from "next/dynamic";
const LottiePlayer = dynamic(() => import("@/components/ui/LottiePlayer"), {
  ssr: false,
});
import { Google, GitHub } from "@mui/icons-material";

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
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Join PrepMaster</h1>
          <p className="text-2xl font-medium text-white/90 mb-6">Your Week, Perfectly Planned</p>
          <p className="text-white/75 max-w-md mx-auto text-lg leading-relaxed">
            Create an account to save your favorite recipes, generate weekly meal plans,
            and sync smart grocery lists across all your devices.
          </p>
        </div>

        {/* Abstract decorative circles */}
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-[300px] h-[300px] rounded-full bg-white/10 blur-2xl" />

        {/* Lottie Animation */}
        <div className="relative z-10 w-80 h-80 mt-8 opacity-90">
          <LottiePlayer src="https://assets10.lottiefiles.com/packages/lf20_FYx0Ph.json" /> {/* Healthy Food Animation */}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h2>
            <p className="mt-2 text-slate-500">Enter your details to get started.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {status ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">Signup Successful!</h3>
              <p className="text-slate-500 mb-6">
                Your account status is <strong>{status}</strong>. We&apos;ve sent a verification link to your email.
              </p>
              <Button onClick={() => router.push("/verify-email")} className="w-full mb-4">
                Verify Email
              </Button>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600 hover:underline">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={startGoogle} disabled={oauthLoading === "google"} className="w-full">
                  <Google className="mr-2 h-4 w-4" /> {oauthLoading === "google" ? "Redirecting..." : "Google"}
                </Button>
                <Button variant="outline" onClick={() => alert("GitHub signup not implemented")} className="w-full">
                  <GitHub className="mr-2 h-4 w-4" /> GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or sign up with email</span>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required

                    autoComplete="new-password"
                    className="h-11"
                  />
                  <p className="text-xs text-slate-500">Must be at least 8 characters long.</p>
                </div>

                <Button type="submit" size="lg" className="w-full text-base py-6" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-500 hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
