import Link from "next/link";
import Logo from "@/components/Logo";

export default function LegalPage() {
    return (
        <div className="food-app-shell min-h-screen">
            <nav className="food-app-nav">
                <Logo size="sm" />
            </nav>
            <main className="food-app-main">
                <section className="food-panel">
                    <p className="food-kicker mb-3">Legal Center</p>
                    <h1 className="food-heading mb-3">Legal and Compliance</h1>
                    <p className="food-subtitle !max-w-none">
                        Review TrueServe legal policies in one place. These pages are structured with the same linear layout as the rest of the platform.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link href="/terms" className="btn btn-gold">Terms of Service</Link>
                        <Link href="/privacy" className="btn btn-ghost">Privacy Policy</Link>
                    </div>
                </section>

                <section className="mt-6 grid gap-6 md:grid-cols-2">
                    <article className="food-card">
                        <p className="food-kicker mb-2">Terms</p>
                        <h2 className="food-heading !text-[30px] mb-3">Service Rules</h2>
                        <p className="text-sm text-white/70 leading-7">
                            Covers account responsibilities, service availability, payments, cancellations, and acceptable use for customers, drivers, and merchants.
                        </p>
                        <Link href="/terms" className="mt-4 inline-flex text-sm font-bold text-[#68c7cc]">Read Terms →</Link>
                    </article>
                    <article className="food-card">
                        <p className="food-kicker mb-2">Privacy</p>
                        <h2 className="food-heading !text-[30px] mb-3">Data Handling</h2>
                        <p className="text-sm text-white/70 leading-7">
                            Explains what data we collect, how location and communication data are used, and what controls users have for privacy and support requests.
                        </p>
                        <Link href="/privacy" className="mt-4 inline-flex text-sm font-bold text-[#68c7cc]">Read Privacy Policy →</Link>
                    </article>
                </section>
            </main>
        </div>
    );
}
