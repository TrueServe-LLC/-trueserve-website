import { getDriverOrRedirect } from "@/lib/driver-auth";
import { fetchDriverPerformanceMetrics } from "@/lib/driver-metrics";

export const dynamic = "force-dynamic";

function formatPercentage(value: number | null) {
    return value === null ? "—" : `${value.toFixed(1)}%`;
}

function formatFeedbackDate(createdAt: string | null) {
    if (!createdAt) return "Recently";
    return new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export default async function DriverRatings() {
    const driver = await getDriverOrRedirect();
    const metrics = await fetchDriverPerformanceMetrics(driver.id, { orders: driver.orders || [] });

    const ratingDisplay = metrics.averageRating?.toFixed(1) ?? "—";
    const ratingBasis = metrics.reviewWindowCount
        ? `Based on the latest ${metrics.reviewWindowCount} customer review${metrics.reviewWindowCount === 1 ? "" : "s"}`
        : "No customer reviews have been submitted yet";
    const ratingLifetime = `${metrics.reviewCount} customer rating${metrics.reviewCount === 1 ? "" : "s"}`;

    const statCards = [
        {
            label: "Review Coverage",
            value: formatPercentage(metrics.reviewCoverage),
            tone: metrics.reviewCoverage !== null && metrics.reviewCoverage >= 25 ? "grn" : "",
            detail: metrics.completedTrips
                ? `${metrics.reviewCount} review${metrics.reviewCount === 1 ? "" : "s"} across ${metrics.completedTrips} delivered trip${metrics.completedTrips === 1 ? "" : "s"}`
                : "Coverage starts after your first completed delivery",
        },
        {
            label: "Completion Rate",
            value: formatPercentage(metrics.completionRate),
            tone: metrics.completionRate !== null && metrics.completionRate >= 90 ? "grn" : "",
            detail: metrics.assignedTrips
                ? `${metrics.completedTrips}/${metrics.assignedTrips} assigned trip${metrics.assignedTrips === 1 ? "" : "s"} finished`
                : "No assigned trips yet",
        },
        {
            label: "On-Time",
            value: formatPercentage(metrics.onTimeRate),
            tone: metrics.onTimeRate !== null && metrics.onTimeRate >= 90 ? "grn" : "",
            detail: metrics.tripsWithMeasuredEta
                ? `${metrics.onTimeCompletedTrips}/${metrics.tripsWithMeasuredEta} ETA-tracked trips completed on time`
                : "We’ll measure this once ETA-tracked deliveries are completed",
        },
        {
            label: "Lifetime Deliveries",
            value: String(metrics.completedTrips),
            tone: "",
            detail: metrics.assignedTrips
                ? `${metrics.assignedTrips} trip${metrics.assignedTrips === 1 ? "" : "s"} assigned overall`
                : "No trip history yet",
        },
    ];

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .page-wrap { padding: 32px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 52px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: -0.02em; line-height: 0.9; margin-bottom: 32px; }
                .page-title span { color: #f97316; }

                .ratings-grid { display: grid; grid-template-columns: 320px 1fr; gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; margin-bottom: 24px; }
                @media (max-width: 1024px) { .ratings-grid { grid-template-columns: 1fr; } }

                .rating-hero { background: #0c0c0e; padding: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                .rating-na { font-size: 110px; font-weight: 700; font-family: 'DM Mono', monospace; color: #f97316; line-height: 0.8; margin-bottom: 12px; letter-spacing: -0.1em; }
                .rating-tier { font-size: 11px; font-weight: 900; letter-spacing: 0.4em; text-transform: uppercase; color: #fff; margin-bottom: 16px; font-style: italic; }
                .rating-sub { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #555; margin-bottom: 8px; }
                .rating-lifetime { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: #272727; }

                .stats-quad { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1c1f28; }
                @media (max-width: 640px) { .stats-quad { grid-template-columns: 1fr; } }

                .stat-quad-cell { background: #080808; padding: 32px; }
                .sq-lbl { font-size: 10px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; color: #444; margin-bottom: 16px; }
                .sq-val { font-size: 44px; font-weight: 800; font-family: 'DM Mono', monospace; color: #fff; line-height: 1; margin-bottom: 8px; letter-spacing: -0.05em; }
                .sq-val.grn { color: #3dd68c; }
                .sq-target { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #555; line-height: 1.5; }

                .feedback-block { background: #0c0c0e; border: 1px solid #1c1f28; padding: 32px; border-radius: 0; }
                .feedback-title { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.1em; margin-bottom: 24px; }
                .feedback-empty { background: #080808; border: 1px solid #131720; padding: 48px; text-align: center; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; color: #333; font-style: italic; }
                .feedback-list { display: grid; gap: 12px; }
                .feedback-card { background: #080808; border: 1px solid #131720; padding: 18px 20px; }
                .feedback-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
                .feedback-stars { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.14em; color: #f97316; }
                .feedback-date { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: #555; }
                .feedback-comment { font-size: 13px; color: #e0e0e0; line-height: 1.6; }
                .feedback-meta { margin-top: 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: #444; }

                @media (max-width: 900px) {
                    .page-wrap { padding: 20px 16px; }
                    .page-title { font-size: 38px; margin-bottom: 20px; }
                    .rating-hero { padding: 28px 20px; }
                    .rating-na { font-size: 74px; margin-bottom: 8px; }
                    .stat-quad-cell { padding: 20px; }
                    .sq-val { font-size: 34px; }
                    .feedback-block { padding: 20px; }
                }

                @media (max-width: 640px) {
                    .rating-na { font-size: 58px; }
                    .rating-tier { letter-spacing: 0.22em; }
                    .feedback-empty { padding: 28px 16px; font-size: 10px; }
                }
            ` }} />

            <div className="page-wrap">
                <div className="page-title">Performance <span>&amp; Ratings</span></div>

                <div className="ratings-grid">
                    <div className="rating-hero">
                        <div className="rating-na">{ratingDisplay}</div>
                        <div className="rating-tier">Fleet Driver</div>
                        <div className="rating-sub">{ratingBasis}</div>
                        <div className="rating-lifetime">{ratingLifetime}</div>
                    </div>

                    <div className="stats-quad">
                        {statCards.map((card) => (
                            <div key={card.label} className="stat-quad-cell">
                                <div className="sq-lbl">{card.label}</div>
                                <div className={`sq-val ${card.tone}`}>{card.value}</div>
                                <div className="sq-target">{card.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="feedback-block">
                    <div className="feedback-title">Recent Feedback</div>
                    {metrics.recentFeedback.length === 0 ? (
                        <div className="feedback-empty">No reviews yet. Customer feedback will populate here after completed deliveries.</div>
                    ) : (
                        <div className="feedback-list">
                            {metrics.recentFeedback.map((review) => (
                                <div key={review.id} className="feedback-card">
                                    <div className="feedback-top">
                                        <div className="feedback-stars">{review.rating.toFixed(1)} ★</div>
                                        <div className="feedback-date">{formatFeedbackDate(review.createdAt)}</div>
                                    </div>
                                    <div className="feedback-comment">
                                        {review.comment || "Customer left a star rating without a written note."}
                                    </div>
                                    <div className="feedback-meta">
                                        {review.orderId ? `Order ${review.orderId.slice(-6).toUpperCase()}` : "Customer review"}
                                        {review.photoUrl ? " · photo attached" : ""}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
