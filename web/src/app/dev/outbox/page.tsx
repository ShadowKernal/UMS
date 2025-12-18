"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  created_at: number;
};

export default function DevOutboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/dev/outbox");
      const data = await res.json();
      setMessages(data.messages || []);
    };
    run();
  }, []);

  return (
    <main className="page">
      <div className="card">
        <h1>Dev outbox</h1>
        <p className="muted">Mock email inbox for verification and password reset.</p>
        <div className="stack">
          {messages.map((m) => (
            <div key={m.id} className="stack" style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
              <div className="inline" style={{ justifyContent: "space-between" }}>
                <strong>{m.subject}</strong>
                <span className="muted">{new Date(m.created_at * 1000).toLocaleString()}</span>
              </div>
              <div className="muted">To: {m.to_email}</div>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{m.body}</pre>
            </div>
          ))}
          {messages.length === 0 && <div className="muted">No messages yet.</div>}
        </div>
      </div>
    </main>
  );
}
