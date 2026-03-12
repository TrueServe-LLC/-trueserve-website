import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";

export default async function DriverRatings() {
    const driver = await getDriverOrRedirect();
    const supabase = await createClient();

    // Get Reviews
    const { data: reviews } = await supabase
        .from('Review')
        .select(`
            *,
            customer:User(name)
        `)
        .eq('driverId', driver.id)
        .order('createdAt', { ascending: false });

    // Calculate Stats
    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0
        ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : "N/A";

    const ratingLabel = totalReviews === 0 ? "New" : Number(averageRating) >= 4.8 ? "Excellent" : Number(averageRating) >= 4.0 ? "Good" : "Fair";

    // Get Completed Orders
    const { count: lifetimeDeliveries } = await supabase
        .from('Order')
        .select('*', { count: 'exact', head: true })
        .eq('driverId', driver.id)
        .eq('status', 'DELIVERED');

    // Mock stats for demo purposes where real data might be missing
    const acceptanceRate = "94%";
    const completionRate = "100%";
    const onTimeRate = "98%";

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-8">Performance & Ratings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Main Rating Card */}
                <div className="card bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 p-8 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl font-black text-yellow-500 mb-2">{averageRating}</div>
                    <div className="text-xl font-bold text-white mb-1">{ratingLabel}</div>
                    <div className="flex gap-1 text-yellow-400 text-sm">
                        {totalReviews > 0 ? (
                            Array.from({ length: Math.round(Number(averageRating)) }).map((_, i) => <span key={i}>★</span>)
                        ) : (
                            <span className="text-slate-500">No ratings yet</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-4 uppercase tracking-widest">{totalReviews} Lifetime Ratings</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="card bg-white/5 border-white/10 p-4 flex flex-col justify-between">
                        <p className="text-xs text-slate-400 uppercase font-bold">Acceptance Rate</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-2">{acceptanceRate}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Target: {'>'}80%</p>
                    </div>
                    <div className="card bg-white/5 border-white/10 p-4 flex flex-col justify-between">
                        <p className="text-xs text-slate-400 uppercase font-bold">Completion Rate</p>
                        <p className="text-3xl font-bold text-white mt-2">{completionRate}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Target: {'>'}90%</p>
                    </div>
                    <div className="card bg-white/5 border-white/10 p-4 flex flex-col justify-between">
                        <p className="text-xs text-slate-400 uppercase font-bold">On-Time</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-2">{onTimeRate}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Target: {'>'}90%</p>
                    </div>
                    <div className="card bg-white/5 border-white/10 p-4 flex flex-col justify-between">
                        <p className="text-xs text-slate-400 uppercase font-bold">Lifetime Deliveries</p>
                        <p className="text-3xl font-bold text-white mt-2">{lifetimeDeliveries}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Recent Feedback</h2>
            <div className="space-y-4">
                {reviews && reviews.length > 0 ? (
                    reviews.map((review: any) => (
                        <div key={review.id} className="card bg-white/5 border-white/5 p-4 flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold shrink-0">
                                {review.rating}★
                            </div>
                            <div>
                                <p className="font-semibold text-white">"{review.comment || "Rated without comment"}"</p>
                                <div className="flex gap-2 items-center text-xs text-slate-500 mt-1">
                                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{review.customer?.name || "Customer"}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-slate-500 border border-white/10 border-dashed rounded-xl">
                        No reviews yet. keep driving safely!
                    </div>
                )}
            </div>
        </div>
    );
}
