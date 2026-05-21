import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/matches");

  return (
    <div>
      <h2>Register</h2>
      <p style={{ color: "var(--muted)" }}>
        Use your email to create an account. Already have one?{" "}
        <Link href="/login">Log in</Link>
      </p>
      <AuthForm mode="register" />
    </div>
  );
}
