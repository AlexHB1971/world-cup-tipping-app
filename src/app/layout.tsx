import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "World Cup Predictions",
  description: "Predict FIFA World Cup 2026 match results and tournament outcomes",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <div className="container">
          <header style={{ marginBottom: "1rem" }}>
            <h1 style={{ margin: 0, fontSize: "1.75rem" }}>
              World Cup Predictions 2026
            </h1>
            <p style={{ color: "var(--muted)", marginTop: "0.35rem" }}>
              5 pts exact score · 2 pts goal difference · 1 pt winner
            </p>
          </header>
          <Nav user={user} />
          {children}
        </div>
      </body>
    </html>
  );
}
