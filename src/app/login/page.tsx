import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/matches");

  return (
    <div>
      <h2>Log in</h2>
      <p style={{ color: "var(--muted)" }}>
        No account yet? <Link href="/register">Register</Link>
      </p>
      <AuthForm mode="login" />
    </div>
  );
}
