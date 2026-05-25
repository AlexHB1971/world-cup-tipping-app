"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
      return;
    }
    router.refresh();
  }

  return (
    <form className="card" onSubmit={onSubmit} style={{ maxWidth: 420 }}>
      <p style={{ marginTop: 0, color: "var(--muted)" }}>
        Enter <code>ADMIN_SECRET</code> to record match and tournament results.
      </p>
      <div className="field">
        <label htmlFor="admin-secret">Admin secret</label>
        <input
          id="admin-secret"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error && <div className="message error">{error}</div>}
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Checking…" : "Unlock admin"}
      </button>
    </form>
  );
}
