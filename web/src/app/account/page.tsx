"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      <main className="page">
        <div className="card">{error}</div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="page">
        <div className="card">Loading...</div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="card">
        <h1>Account</h1>
        <p className="muted">Authenticated with Next.js API routes.</p>
        <div className="stack">
          <div>
            <strong>Email:</strong> {me.user.email}
          </div>
          <div>
            <strong>Status:</strong> {me.user.status}
          </div>
          <div>
            <strong>Roles:</strong> {me.user.roles.join(", ") || "USER"}
          </div>
        </div>
        <div className="stack" style={{ marginTop: 16 }}>
          <button className="primary" onClick={() => logout(false)}>
            Logout
          </button>
          <button className="secondary" onClick={() => logout(true)}>
            Logout all devices
          </button>
          <a className="secondary inline" href="/admin/users">
            Admin: users
          </a>
          <a className="secondary inline" href="/dev/outbox">
            Dev outbox
          </a>
        </div>
      </div>
    </main>
  );
}
