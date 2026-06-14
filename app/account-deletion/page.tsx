import Link from "next/link";
import Logo from "@/components/Logo";
import AccountDeletionRequestForm from "@/components/AccountDeletionRequestForm";
import "./account-deletion.css";

export const metadata = {
    title: "Delete Your TrueServe Account",
    description: "Request deletion of a TrueServe customer, driver, or merchant account.",
};

export default function AccountDeletionPage() {
    return (
        <main className="deletion-page">
            <div className="deletion-container">
                <Logo size="sm" />
                <section className="deletion-card">
                    <p className="deletion-kicker">Privacy control</p>
                    <h1>Delete your TrueServe account</h1>
                    <p className="deletion-lead">
                        Submit this form from the app or web. Signed-in requests are linked to the
                        active account; requests submitted without a session require ownership verification.
                    </p>
                    <AccountDeletionRequestForm />
                    <div className="deletion-footer">
                        <p>
                            Eligible requests are completed within 30 days. Transaction, payout, tax,
                            fraud-prevention, and dispute records may be retained where legally required.
                        </p>
                        <p>
                            Questions: <a href="mailto:privacy@trueservedelivery.com">privacy@trueservedelivery.com</a>
                            {" · "}<Link href="/privacy">Privacy Policy</Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
