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
                    <div style={{ fontSize: 56, marginBottom: 24 }}>🎉</div>

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
                            Expect a text within 5 minutes.
                        </p>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
                            We'll send you a link to upload your driver's license and insurance. It takes less than 2 minutes. Once submitted, our team reviews and activates your account — usually same day.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                            Questions? Text us at{" "}
                            <a href="sms:+17045550000" style={{ color: "#f97316" }}>(704) 555-0000</a>
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
