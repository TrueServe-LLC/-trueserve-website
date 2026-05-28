import Link from "next/link";
import Logo from "@/components/Logo";

export default function DriveSuccessPage() {
    return (
        <div style={{ minHeight: "100vh", background: "#09090c", color: "#fff", display: "flex", flexDirection: "column" }}>
            <nav className="food-app-nav">
                <Logo size="sm" />
            </nav>

            <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
                <div style={{ textAlign: "center", maxWidth: 520 }}>
                    <p className="food-kicker" style={{ color: "#f97316", marginBottom: 12 }}>Application Received</p>

                    <h1 className="food-title" style={{ fontSize: "clamp(36px, 7vw, 60px)", marginBottom: 20 }}>
                        You're on your way!
                    </h1>

                    <div style={{
                        background: "rgba(249,115,22,0.08)",
                        border: "1px solid rgba(249,115,22,0.25)",
                        borderRadius: 16, padding: "24px 28px", marginBottom: 32,
                    }}>
                        <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                            Your application is in.
                        </p>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
                            If you opted into texts, we'll send your document upload link by SMS. Driver Ops also sends
                            email updates, so you are not waiting on a chatbot. Once your documents are submitted,
                            admins review and activate approved accounts — usually same day.
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gap: 10,
                        textAlign: "left",
                        background: "rgba(255,255,255,0.035)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        padding: "18px",
                        marginBottom: 28,
                    }}>
                        {[
                            "Driver Ops reviews your application",
                            "Admins verify license, insurance, and vehicle documents",
                            "Approval status is sent by email before activation",
                        ].map((item) => (
                            <div key={item} style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, fontWeight: 700 }}>
                                ✓ {item}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                            Questions? Visit{" "}
                            <Link href="/contact" style={{ color: "#f97316" }}>contact support</Link>.
                        </p>
                        <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
