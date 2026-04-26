import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="food-app-shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <p className="food-kicker" style={{ marginBottom: 16 }}>404 — Page not found</p>
          <h1 className="food-heading" style={{ fontSize: "clamp(56px, 10vw, 96px)", lineHeight: 0.9, marginBottom: 20 }}>
            Wrong <span className="accent">turn.</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 36 }}>
            That page doesn't exist or may have moved. Let's get you back on track.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="portal-btn-gold" style={{ minWidth: 140 }}>Back to Home</Link>
            <Link href="/restaurants" className="portal-btn-outline" style={{ minWidth: 140 }}>Order Food</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
