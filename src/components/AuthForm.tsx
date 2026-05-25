"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      email: String(form.get("email")),
      password: String(form.get("password")),
      displayName: form.get("displayName")
        ? String(form.get("displayName"))
        : undefined,
    };

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/matches");
    router.refresh();
  }

  return (
    <form className="card" onSubmit={onSubmit} style={{ maxWidth: 420 }}>
      {mode === "register" && (
        <div className="field">
          <label htmlFor="displayName">Display name (optional)</label>
          <input id="displayName" name="displayName" type="text" />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : 1}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {mode === "register" && (
          <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
            At least 8 characters.
          </p>
        )}
      </div>
      {error && <div className="message error">{error}</div>}
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
      </button>
    </form>
  );
}
