export default function DriverRatings() {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-8">Performance & Ratings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Main Rating Card */}
                <div className="card bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 p-8 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl font-black text-yellow-500 mb-2">4.92</div>
                    <div className="text-xl font-bold text-white mb-1">Excellent</div>
                    <div className="flex gap-1 text-yellow-400 text-sm">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-4 uppercase tracking-widest">Last 100 Deliveries</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="card bg-white/5 border-white/10 p-4 flex flex-col justify-between">
                        <p className="text-xs text-slate-400 uppercase font-bold">Acceptance Rate</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-2">94%</p>
                        <p className="text-[10px] text-slate-500 mt-1">Target: {'>'}80%</p>
                    </div>
                    <div className="card bg-white/5 border-white/10 p-4 flex flex-col justify-between">
                        <p className="text-xs text-slate-400 uppercase font-bold">Completion Rate</p>
                        <p className="text-3xl font-bold text-white mt-2">100%</p>
                        <p className="text-[10px] text-slate-500 mt-1">Target: {'>'}90%</p>
                    </div>
                    <div className="card bg-white/5 border-white/10 p-4 flex flex-col justify-between">
                        <p className="text-xs text-slate-400 uppercase font-bold">On-Time</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-2">98%</p>
                        <p className="text-[10px] text-slate-500 mt-1">Target: {'>'}90%</p>
                    </div>
                    <div className="card bg-white/5 border-white/10 p-4 flex flex-col justify-between">
                        <p className="text-xs text-slate-400 uppercase font-bold">Lifetime Deliveries</p>
                        <p className="text-3xl font-bold text-white mt-2">1,245</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Recent Feedback</h2>
            <div className="space-y-4">
                {[
                    { comment: "Super fast and friendly!", rating: 5, date: "Today" },
                    { comment: "Followed instructions perfectly.", rating: 5, date: "Yesterday" },
                    { comment: "Food was handled with care.", rating: 5, date: "Jan 28" },
                    { comment: "", rating: 5, date: "Jan 27" }, // Rating only
                ].map((feedback, i) => (
                    <div key={i} className="card bg-white/5 border-white/5 p-4 flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold">
                            {feedback.rating}★
                        </div>
                        <div>
                            <p className="font-semibold text-white">"{feedback.comment || "Rated without comment"}"</p>
                            <p className="text-xs text-slate-500 mt-1">{feedback.date} • Verified Customer</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
