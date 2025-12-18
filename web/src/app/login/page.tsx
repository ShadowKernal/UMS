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
import { Google, GitHub } from "@mui/icons-material"; // Keeping icons for now, can replace later

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
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">PrepMaster</h1>
          <p className="text-2xl font-medium text-white/90 mb-6">Kitchen confidence, automated.</p>
          <p className="text-white/75 max-w-md mx-auto text-lg leading-relaxed">
            Ditch the stress. Sign in to access your personalized meal plans,
            smart grocery lists, and step-by-step cooking guides.
          </p>
        </div>

        {/* Abstract decorative circles */}
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-[300px] h-[300px] rounded-full bg-white/10 blur-2xl" />

        {/* Lottie Animation */}
        <div className="relative z-10 w-96 h-96 mt-8 opacity-90">
          <LottiePlayer src="https://assets10.lottiefiles.com/packages/lf20_bpqri9y8.json" /> {/* Cooking/Chef Animation */}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="mt-2 text-slate-500">Log in to manage your kitchen.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => alert("Google login not implemented")} className="w-full">
              <Google className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" onClick={() => alert("GitHub login not implemented")} className="w-full">
              <GitHub className="mr-2 h-4 w-4" /> GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="remember" className="text-sm font-medium text-slate-700">Remember me</label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full text-base py-6" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-emerald-600 hover:text-emerald-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
