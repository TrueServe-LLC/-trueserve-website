import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function DriverRatings() {
    const driver = await getDriverOrRedirect();
    const isPreview = driver?.id === "preview-driver";

    const rating = isPreview ? "N/A" : (driver?.rating || "N/A");
    const lifetimeDeliveries = isPreview ? 0 : (driver?.orders?.length || 0);

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .page-wrap { padding: 24px 28px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 30px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.01em; margin-bottom: 20px; }
                .page-title span { color: #e8a230; }

                .ratings-grid { display: grid; grid-template-columns: 280px 1fr; gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; margin-bottom: 20px; }
                .rating-hero { background: #0f1219; padding: 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                .rating-na { font-size: 64px; font-weight: 700; font-family: 'DM Mono', monospace; color: #e8a230; line-height: 1; margin-bottom: 6px; }
                .rating-tier { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; }
                .rating-sub { font-size: 11px; color: #444; margin-bottom: 4px; }
                .rating-lifetime { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #333; }

                .stats-quad { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1c1f28; }
                .stat-quad-cell { background: #0f1219; padding: 18px 20px; }
                .sq-lbl { font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #555; margin-bottom: 8px; }
                .sq-val { font-size: 32px; font-weight: 700; font-family: 'DM Mono', monospace; color: #fff; line-height: 1; margin-bottom: 4px; }
                .sq-val.grn { color: #3dd68c; }
                .sq-target { font-size: 10px; color: #333; font-family: 'DM Mono', monospace; }

                .feedback-block { background: #0f1219; border: 1px solid #1c1f28; padding: 16px 20px; }
                .feedback-title { font-size: 13px; font-weight: 700; color: #ccc; margin-bottom: 12px; }
                .feedback-empty { background: #0c0e13; border: 1px solid #1c1f28; padding: 20px; text-align: center; font-size: 12px; color: #333; font-style: italic; }
            ` }} />
            
            <div className="page-wrap">
                <div className="page-title">Performance <span>&amp; Ratings</span></div>
                
                <div className="ratings-grid">
                    <div className="rating-hero">
                        <div className="rating-na">{rating}</div>
                        <div className="rating-tier">{isPreview ? "New" : "Fleet Driver"}</div>
                        <div className="rating-sub">{isPreview ? "No ratings yet" : "Based on last 100 trips"}</div>
                        <div className="rating-lifetime">{lifetimeDeliveries} Lifetime Ratings</div>
                    </div>
                    
                    <div className="stats-quad">
                        <div className="stat-quad-cell">
                            <div className="sq-lbl">Acceptance Rate</div>
                            <div className="sq-val grn">94%</div>
                            <div className="sq-target">Target: &gt;80%</div>
                        </div>
                        <div className="stat-quad-cell">
                            <div className="sq-lbl">Completion Rate</div>
                            <div className="sq-val">100%</div>
                            <div className="sq-target">Target: &gt;90%</div>
                        </div>
                        <div className="stat-quad-cell">
                            <div className="sq-lbl">On-Time</div>
                            <div className="sq-val grn">98%</div>
                            <div className="sq-target">Target: &gt;90%</div>
                        </div>
                        <div className="stat-quad-cell">
                            <div className="sq-lbl">Lifetime Deliveries</div>
                            <div className="sq-val">{lifetimeDeliveries}</div>
                        </div>
                    </div>
                </div>

                <div className="feedback-block">
                    <div className="feedback-title">Recent Feedback</div>
                    <div className="feedback-empty">No reviews yet. Keep driving safely!</div>
                </div>
            </div>
        </div>
    );
}
