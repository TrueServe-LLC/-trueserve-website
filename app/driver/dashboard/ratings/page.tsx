import { getDriverOrRedirect } from "@/lib/driver-auth";

export const dynamic = 'force-dynamic';

export default async function DriverRatings() {
    const driver = await getDriverOrRedirect();

    const rating = driver?.rating || "N/A";
    const lifetimeDeliveries = driver?.orders?.length || 0;

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .page-wrap { padding: 32px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 52px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: -0.02em; line-height: 0.9; margin-bottom: 32px; }
                .page-title span { color: #e8a230; }

                .ratings-grid { display: grid; grid-template-columns: 320px 1fr; gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; margin-bottom: 24px; }
                @media (max-width: 1024px) { .ratings-grid { grid-template-columns: 1fr; } }
                
                .rating-hero { background: #0c0c0e; padding: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                .rating-na { font-size: 110px; font-weight: 700; font-family: 'DM Mono', monospace; color: #e8a230; line-height: 0.8; margin-bottom: 12px; letter-spacing: -0.1em; }
                .rating-tier { font-size: 11px; font-weight: 900; letter-spacing: 0.4em; text-transform: uppercase; color: #fff; margin-bottom: 16px; font-style: italic; }
                .rating-sub { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #333; margin-bottom: 4px; }
                .rating-lifetime { font-size: 10px; font-weight: 800; tracking-widest uppercase color: #1a1a1a; }

                .stats-quad { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1c1f28; }
                @media (max-width: 640px) { .stats-quad { grid-template-columns: 1fr; } }
                
                .stat-quad-cell { background: #080808; padding: 32px; }
                .sq-lbl { font-size: 10px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; color: #444; margin-bottom: 16px; }
                .sq-val { font-size: 44px; font-weight: 800; font-family: 'DM Mono', monospace; color: #fff; line-height: 1; margin-bottom: 8px; letter-spacing: -0.05em; }
                .sq-val.grn { color: #3dd68c; }
                .sq-target { font-size: 10px; font-weight: 800; tracking-widest uppercase color: #1a1a1a; font-family: 'DM Mono', monospace; }

                .feedback-block { background: #0c0c0e; border: 1px solid #1c1f28; padding: 32px; border-radius: 0; }
                .feedback-title { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.1em; margin-bottom: 24px; }
                .feedback-empty { background: #080808; border: 1px solid #131720; padding: 48px; text-align: center; font-size: 11px; font-weight: 800; tracking-widest uppercase color: #222; font-style: italic; }

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
                        <div className="rating-na">{rating}</div>
                        <div className="rating-tier">Fleet Driver</div>
                        <div className="rating-sub">Based on last 100 trips</div>
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
