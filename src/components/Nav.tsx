import Link from "next/link";

type NavProps = {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    isAdmin: boolean;
  } | null;
};

export function Nav({ user }: NavProps) {
  return (
    <nav className="nav card" style={{ justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/">Home</Link>
        {user && (
          <>
            <Link href="/matches">Matches</Link>
            <Link href="/tournament">Tournament</Link>
          </>
        )}
        <Link href="/format">Format</Link>
        <Link href="/leaderboard">Leaderboard</Link>
        {user?.isAdmin && <Link href="/admin">Admin</Link>}
        {user ? (
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="btn secondary" style={{ padding: "0.35rem 0.75rem" }}>
              Log out
            </button>
          </form>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
      {user && (
        <span className="badge">{user.displayName ?? user.email}</span>
      )}
    </nav>
  );
}
