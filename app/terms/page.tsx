import Link from "next/link";
import Logo from "@/components/Logo";

export default function TermsPage() {
    return (
        <div className="food-app-shell min-h-screen">
            <nav className="food-app-nav">
                <Logo size="sm" />
            </nav>
            <main className="food-app-main">
                <section className="food-panel">
                    <p className="food-kicker mb-3">Terms of Service</p>
                    <h1 className="food-heading mb-3">Service Terms</h1>
                    <p className="food-subtitle !max-w-none">
                        Effective Date: April 8, 2026. By using TrueServe, you agree to these terms.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link href="/privacy" className="btn btn-ghost">Privacy Policy</Link>
                        <Link href="/legal" className="btn btn-ghost">Legal Center</Link>
                    </div>
                </section>

                <section className="mt-6 space-y-5">
                    <article className="food-card">
                        <h2 className="food-heading !text-[28px] mb-2">1. Service Availability</h2>
                        <p className="text-sm text-white/70 leading-7">
                            Service areas, delivery windows, and platform features may vary by location and operational status.
                            TrueServe may update or pause service availability when required for safety, compliance, or reliability.
                        </p>
                    </article>
                    <article className="food-card">
                        <h2 className="food-heading !text-[28px] mb-2">2. Account Responsibilities</h2>
                        <p className="text-sm text-white/70 leading-7">
                            Users are responsible for accurate account details, secure login credentials, and lawful use of the platform.
                            Unauthorized use, fraud, or abuse may result in account restrictions.
                        </p>
                    </article>
                    <article className="food-card">
                        <h2 className="food-heading !text-[28px] mb-2">3. Orders, Payments, and Cancellations</h2>
                        <p className="text-sm text-white/70 leading-7">
                            Payments are processed through integrated payment providers. Refund and cancellation outcomes depend on order status,
                            fulfillment stage, and issue verification. Customers can report issues directly in order tracking with proof photos.
                        </p>
                    </article>
                    <article className="food-card">
                        <h2 className="food-heading !text-[28px] mb-2">4. Support and Disputes</h2>
                        <p className="text-sm text-white/70 leading-7">
                            AI and human support channels are available for operational issues. For unresolved matters, contact support@trueservedelivery.com.
                        </p>
                    </article>
                </section>
            </main>
        </div>
    );
}
