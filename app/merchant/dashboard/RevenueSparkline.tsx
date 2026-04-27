"use client";

interface RevenueSparklineProps {
    orders: any[];
}

export default function RevenueSparkline({ orders }: RevenueSparklineProps) {
    // Build last-7-days buckets
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
    });

    const completed = (orders || []).filter((o: any) =>
        ["DELIVERED", "READY_FOR_PICKUP", "PICKED_UP"].includes(o.status)
    );

    const data = days.map((date) => {
        const dayOrders = completed.filter((o: any) =>
            (o.createdAt || "").startsWith(date)
        );
        return {
            date,
            label: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
            amount: dayOrders.reduce((s: number, o: any) => s + Number(o.total || 0), 0),
            count: dayOrders.length,
        };
    });

    const max = Math.max(...data.map((d) => d.amount), 1);
    const total7 = data.reduce((s, d) => s + d.amount, 0);
    const totalOrders = data.reduce((s, d) => s + d.count, 0);

    // SVG sparkline path
    const W = 200, H = 44;
    const pts = data.map((d, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - (d.amount / max) * (H - 8) - 2;
        return `${x},${y}`;
    });
    const pathD = pts.map((p, i) => (i === 0 ? `M${p}` : `L${p}`)).join(" ");
    const areaD = `M${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(" ")} L${W},${H} L0,${H} Z`;

    return (
        <>
            <style>{`
                .rspark-panel {
                    background: #141a18; border: 1px solid #1e2420;
                    border-radius: 8px; padding: 14px 16px; margin-bottom: 14px;
                }
                .rspark-head {
                    display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
                }
                .rspark-label {
                    font-size: 10px; font-weight: 800; color: #777;
                    letter-spacing: 0.12em; text-transform: uppercase;
                }
                .rspark-period {
                    font-size: 9px; color: #555; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.1em;
                }
                .rspark-stats {
                    display: flex; gap: 20px; margin-bottom: 12px;
                }
                .rspark-stat-val {
                    font-size: 24px; font-weight: 700; color: #fff; letter-spacing: -0.5px; line-height: 1;
                }
                .rspark-stat-lbl {
                    font-size: 10px; color: #555; margin-top: 3px;
                }
                .rspark-bars {
                    display: flex; align-items: flex-end; gap: 4px; height: 48px;
                }
                .rspark-bar-wrap {
                    flex: 1; display: flex; flex-direction: column;
                    align-items: center; gap: 4px; height: 100%;
                    position: relative;
                }
                .rspark-bar {
                    width: 100%; border-radius: 3px 3px 0 0;
                    background: linear-gradient(to top, rgba(249,115,22,0.25), rgba(249,115,22,0.7));
                    transition: height 0.6s cubic-bezier(.34,1.56,.64,1);
                    min-height: 3px;
                }
                .rspark-bar.today {
                    background: linear-gradient(to top, rgba(249,115,22,0.45), #f97316);
                }
                .rspark-bar-day {
                    font-size: 8px; font-weight: 800; color: #444;
                    text-transform: uppercase; letter-spacing: 0.08em;
                    white-space: nowrap;
                }
                .rspark-bar-day.today { color: #f97316; }
                .rspark-tooltip {
                    position: absolute; bottom: 100%; left: 50%;
                    transform: translateX(-50%) translateY(-4px);
                    background: #1e2420; border: 1px solid #2a3228;
                    border-radius: 5px; padding: 3px 7px;
                    font-size: 10px; font-weight: 700; color: #fff;
                    white-space: nowrap; opacity: 0; pointer-events: none;
                    transition: opacity 0.15s; z-index: 10;
                }
                .rspark-bar-wrap:hover .rspark-tooltip { opacity: 1; }
            `}</style>

            <div className="rspark-panel">
                <div className="rspark-head">
                    <span className="rspark-label">Revenue · 7 days</span>
                    <span className="rspark-period">Last 7 days</span>
                </div>

                <div className="rspark-stats">
                    <div>
                        <div className="rspark-stat-val">${total7.toFixed(2)}</div>
                        <div className="rspark-stat-lbl">Total Revenue</div>
                    </div>
                    <div>
                        <div className="rspark-stat-val">{totalOrders}</div>
                        <div className="rspark-stat-lbl">Orders Completed</div>
                    </div>
                    <div>
                        <div className="rspark-stat-val">
                            ${totalOrders > 0 ? (total7 / totalOrders).toFixed(2) : "0.00"}
                        </div>
                        <div className="rspark-stat-lbl">Avg. Order</div>
                    </div>
                </div>

                <div className="rspark-bars">
                    {data.map((d, i) => {
                        const isToday = i === data.length - 1;
                        const pct = max > 0 ? Math.max((d.amount / max) * 100, d.count > 0 ? 8 : 0) : 0;
                        return (
                            <div key={d.date} className="rspark-bar-wrap">
                                <div className="rspark-tooltip">
                                    ${d.amount.toFixed(2)} · {d.count} order{d.count !== 1 ? "s" : ""}
                                </div>
                                <div
                                    className={`rspark-bar${isToday ? " today" : ""}`}
                                    style={{ height: `${pct}%` }}
                                />
                                <span className={`rspark-bar-day${isToday ? " today" : ""}`}>
                                    {isToday ? "Today" : d.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
