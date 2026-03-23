
import React from 'react';

export default function TermsAndPrivacy() {
    return (
        <div className="container py-20 max-w-4xl mx-auto space-y-12">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Legal & Compliance</h1>
                <p className="text-slate-400">Essential documents for our pilot program.</p>
            </header>

            <section id="terms" className="card p-8 bg-white/5 border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Terms of Service (Pilot)</h2>
                <div className="prose prose-invert max-w-none text-sm text-slate-300 space-y-4">
                    <p><strong>Effective Date:</strong> [Today's Date]</p>
                    <p>Welcome to the TrueServe Pilot Program. By accessing or using our services, you agree to be bound by these terms.</p>

                    <h3 className="font-bold text-white">1. Service Availability</h3>
                    <p>TrueServe is currently in a limited pilot phase. Services are only available in specific zip codes around Charlotte, NC. We reserve the right to modify, suspend, or discontinue the service at any time without notice.</p>

                    <h3 className="font-bold text-white">2. User Accounts</h3>
                    <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use.</p>

                    <h3 className="font-bold text-white">3. Payments & Refunds</h3>
                    <p>All payments are processed securely via Stripe. In the event of a dispute or service failure during the pilot, please contact support@trueservedelivery.com for a full refund.</p>
                </div>
            </section>

            <section id="privacy" className="card p-8 bg-white/5 border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Privacy Policy (Pilot)</h2>
                <div className="prose prose-invert max-w-none text-sm text-slate-300 space-y-4">
                    <h3 className="font-bold text-white">1. Information We Collect</h3>
                    <ul className="list-disc pl-5">
                        <li><strong>Personal Info:</strong> Name, Email, Phone Number (for order updates).</li>
                        <li><strong>Location Data (Drivers):</strong> We collect precise location data from drivers to facilitate delivery tracking and dispatch.</li>
                        <li><strong>Payment Info:</strong> Processed directly by Stripe; we do not store full credit card numbers.</li>
                    </ul>

                    <h3 className="font-bold text-white">2. SMS Communications</h3>
                    <p>By providing your phone number, you consent to receive transactional SMS messages regarding your orders or deliveries. Reply STOP to opt-out (this may affect service delivery).</p>

                    <h3 className="font-bold text-white">3. Data Sharing</h3>
                    <p>We share necessary data with Restaurants (order details) and Drivers (delivery location) to fulfill your service request.</p>
                </div>
            </section>

            <div className="text-center pt-8 border-t border-white/10">
                <p className="text-xs text-slate-500">
                    For questions, contact <a href="mailto:support@trueservedelivery.com" className="text-primary hover:underline">support@trueservedelivery.com</a>
                </p>
            </div>
        </div>
    );
}
