import Link from "next/link";
import Logo from "@/components/Logo";

export default function PrivacyPage() {
    return (
        <div className="food-app-shell min-h-screen">
            <nav className="food-app-nav">
                <Logo size="sm" />
            </nav>
            <main className="food-app-main">
                <section className="food-panel">
                    <p className="food-kicker mb-3">Privacy Policy</p>
                    <h1 className="food-heading mb-3">How Data Is Used</h1>
                    <p className="food-subtitle !max-w-none">
                        Effective Date: April 8, 2026. This policy explains what data TrueServe collects and how it supports ordering, dispatch, payments, and support.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link href="/terms" className="btn btn-ghost">Terms of Service</Link>
                        <Link href="/legal" className="btn btn-ghost">Legal Center</Link>
                    </div>
                </section>

                <section className="mt-6 space-y-5">
                    <article className="food-card">
                        <h2 className="food-heading !text-[28px] mb-2">1. Information Collected</h2>
                        <p className="text-sm text-white/70 leading-7">
                            We collect account information (name, email, phone), order data, and operational data needed to complete deliveries.
                            Driver and delivery location data may be processed to support routing, tracking, and fraud prevention.
                        </p>
                    </article>
                    <article className="food-card">
                        <h2 className="food-heading !text-[28px] mb-2">2. Payment and Financial Data</h2>
                        <p className="text-sm text-white/70 leading-7">
                            Payment processing is handled through integrated providers such as Stripe. TrueServe does not store full card numbers on platform-managed records.
                        </p>
                    </article>
                    <article className="food-card">
                        <h2 className="food-heading !text-[28px] mb-2">3. Communications and Support</h2>
                        <p className="text-sm text-white/70 leading-7">
                            Messages sent through order chat and support tools can be stored for service quality, translation, fraud review, and dispute resolution.
                            Support may include AI-assisted responses and human escalation.
                        </p>
                    </article>
                    <article className="food-card">
                        <h2 className="food-heading !text-[28px] mb-2">4. Issue Reporting and Proof Photos</h2>
                        <p className="text-sm text-white/70 leading-7">
                            If customers submit wrong-order or missing-item reports, optional proof photos may be stored for verification and partner resolution workflows.
                        </p>
                    </article>
                </section>
            </main>
        </div>
    );
}
