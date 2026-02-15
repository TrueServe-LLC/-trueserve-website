export default function DriverHelp() {
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold">Help & Support</h1>

            <section className="card bg-white/5 border-white/10 p-6 text-center">
                <h2 className="text-xl font-bold mb-2">Need immediate assistance?</h2>
                <p className="text-slate-400 mb-6 text-sm">Our support team is available 24/7 for active delivery issues.</p>
                <button className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
                    <span>💬</span> Chat with Support
                </button>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer">
                    <h3 className="font-bold mb-1">💰 Pay & Earnings</h3>
                    <p className="text-xs text-slate-400">Missing pay, promotions, cash out issues.</p>
                </div>
                <div className="card bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer">
                    <h3 className="font-bold mb-1">📱 App Issues</h3>
                    <p className="text-xs text-slate-400">Bugs, crashes, login problems.</p>
                </div>
                <div className="card bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer">
                    <h3 className="font-bold mb-1">🛡️ Safety & Incidents</h3>
                    <p className="text-xs text-slate-400">Report an accident or safety concern.</p>
                </div>
                <div className="card bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer">
                    <h3 className="font-bold mb-1">👤 Account Info</h3>
                    <p className="text-xs text-slate-400">Update vehicle, documents, phone number.</p>
                </div>
            </div>

            <section className="card bg-white/5 border-white/10 p-6 space-y-4">
                <h2 className="text-lg font-bold">Common Questions</h2>
                <div className="collapse collapse-arrow bg-black/20 border border-white/5 rounded-box">
                    <input type="radio" name="my-accordion-2" />
                    <div className="collapse-title font-medium">How is pay calculated?</div>
                    <div className="collapse-content text-sm text-slate-400">
                        <p>Pay is based on base fare + mileage + wait time + 100% of tips. TrueServe provides an estimated pay projection.</p>
                    </div>
                </div>
                <div className="collapse collapse-arrow bg-black/20 border border-white/5 rounded-box">
                    <input type="radio" name="my-accordion-2" />
                    <div className="collapse-title font-medium">How do I cancel an order?</div>
                    <div className="collapse-content text-sm text-slate-400">
                        <p>Go to Order Details {'>'} Help {'>'} Cancel Order. Please note excessive cancellations may affect your rating.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
