"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type DriverActionResult = {
    success?: boolean;
    error?: string;
};

interface Driver {
    id: string;
    userId: string;
    complianceStatus: string;
    backgroundCheckStatus: string;
    vehicleType?: string;
    createdAt: string;
    docCount?: number;
    user?: { id: string; name: string; email: string; phone?: string };
}

interface Props {
    drivers: Driver[];
    requestDocsAction?: (driverId: string) => Promise<DriverActionResult>;
    readyAction?: (driverId: string) => Promise<DriverActionResult>;
    approveAction?: (driverId: string) => Promise<DriverActionResult>;
    rejectAction?: (driverId: string) => Promise<DriverActionResult>;
}

const BUCKETS = [
    {
        key: "NEW_APPLICATION",
        label: "New Application",
        color: "#818cf8",
        bg: "rgba(129,140,248,0.08)",
        border: "rgba(129,140,248,0.2)",
        desc: "Lead submitted, no docs yet",
    },
    {
        key: "PENDING_DOCUMENTS",
        label: "Pending Documents",
        color: "#fbbf24",
        bg: "rgba(251,191,36,0.08)",
        border: "rgba(251,191,36,0.2)",
        desc: "Waiting on license, insurance, registration",
    },
    {
        key: "READY_FOR_REVIEW",
        label: "Ready for Review",
        color: "#f97316",
        bg: "rgba(249,115,22,0.08)",
        border: "rgba(249,115,22,0.2)",
        desc: "Docs are ready for an admin decision",
    },
    {
        key: "ACTIVE",
        label: "Approved / Active",
        color: "#34d399",
        bg: "rgba(52,211,153,0.08)",
        border: "rgba(52,211,153,0.2)",
        desc: "Cleared and able to drive",
    },
];

function toBucket(driver: Driver): string {
    const cs = (driver.complianceStatus || "").toUpperCase();
    if (cs === "NEW_APPLICATION") return "NEW_APPLICATION";
    if (cs === "PENDING" || cs === "TRAINING") return "PENDING_DOCUMENTS";
    if (cs === "READY_FOR_REVIEW" || cs === "IN_REVIEW") return "READY_FOR_REVIEW";
    if (cs === "ACTIVE") return "ACTIVE";
    return "NEW_APPLICATION";
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.max(0, Math.floor(diff / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function DriverPipeline({
    drivers,
    requestDocsAction,
    readyAction,
    approveAction,
    rejectAction,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ driverId: string; type: "success" | "error"; text: string } | null>(null);

    const grouped: Record<string, Driver[]> = {
        NEW_APPLICATION: [],
        PENDING_DOCUMENTS: [],
        READY_FOR_REVIEW: [],
        ACTIVE: [],
    };

    drivers.forEach((d) => {
        const bucket = toBucket(d);
        grouped[bucket].push(d);
    });

    const totalOpen = grouped.NEW_APPLICATION.length + grouped.PENDING_DOCUMENTS.length + grouped.READY_FOR_REVIEW.length;

    const run = (
        driverId: string,
        label: string,
        action?: (driverId: string) => Promise<DriverActionResult>
    ) => {
        if (!action) return;
        setActiveDriverId(driverId);
        setMessage(null);
        startTransition(async () => {
            try {
                const result = await action(driverId);
                if (result.success) {
                    setMessage({ driverId, type: "success", text: `${label} complete.` });
                    router.refresh();
                } else {
                    setMessage({ driverId, type: "error", text: result.error || `${label} failed.` });
                }
            } catch (error) {
                console.error(`Driver pipeline action failed: ${label}`, error);
                setMessage({ driverId, type: "error", text: `${label} failed. Try again.` });
            } finally {
                setActiveDriverId(null);
            }
        });
    };

    const renderActions = (driver: Driver, bucketKey: string, color: string) => {
        const docCount = driver.docCount || 0;
        const busy = isPending && activeDriverId === driver.id;
        const reviewHref = `/admin/drivers?q=${encodeURIComponent(driver.user?.email || "")}#driver-document-review`;

        return (
            <div className="dp-actions">
                <a href={reviewHref} className="dp-link" style={{ color }}>
                    Open review
                </a>
                {bucketKey === "NEW_APPLICATION" && (
                    <button
                        type="button"
                        className="dp-btn"
                        disabled={busy || !requestDocsAction}
                        onClick={() => run(driver.id, "Document request", requestDocsAction)}
                    >
                        {busy ? "Working..." : "Request docs"}
                    </button>
                )}
                {bucketKey === "PENDING_DOCUMENTS" && (
                    <button
                        type="button"
                        className="dp-btn"
                        disabled={busy || docCount < 3 || !readyAction}
                        title={docCount < 3 ? `${docCount}/3 documents uploaded` : "Move to Ready for Review"}
                        onClick={() => run(driver.id, "Move to review", readyAction)}
                    >
                        {busy ? "Working..." : "Move to review"}
                    </button>
                )}
                {bucketKey === "READY_FOR_REVIEW" && (
                    <>
                        <button
                            type="button"
                            className="dp-btn approve"
                            disabled={busy || !approveAction}
                            onClick={() => run(driver.id, "Approval", approveAction)}
                        >
                            {busy ? "Working..." : "Approve"}
                        </button>
                        <button
                            type="button"
                            className="dp-btn reject"
                            disabled={busy || !rejectAction}
                            onClick={() => run(driver.id, "Rejection", rejectAction)}
                        >
                            Reject
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <section className="dp-shell">
            <style>{`
                .dp-shell { margin-bottom: 32px; }
                .dp-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
                .dp-title { font-size: 16px; font-weight: 700; color: #fff; margin: 0; }
                .dp-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin: 4px 0 0; line-height: 1.5; }
                .dp-public-link { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; border: 1px solid rgba(249,115,22,0.25); border-radius: 8px; padding: 0 12px; color: #f97316; text-decoration: none; font-size: 12px; font-weight: 700; background: rgba(249,115,22,0.06); }
                .dp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
                .dp-col { border-radius: 12px; padding: 14px; min-width: 0; }
                .dp-col-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 8px; }
                .dp-stage { display: flex; align-items: center; gap: 8px; min-width: 0; }
                .dp-dot { width: 8px; height: 8px; border-radius: 999px; flex: 0 0 auto; }
                .dp-stage-label { font-weight: 700; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .dp-count { border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 700; flex: 0 0 auto; }
                .dp-desc { font-size: 11px; color: rgba(255,255,255,0.34); margin: 0 0 10px; line-height: 1.45; min-height: 32px; }
                .dp-list { display: flex; flex-direction: column; gap: 8px; }
                .dp-empty { font-size: 11px; color: rgba(255,255,255,0.22); text-align: center; padding: 12px 0; margin: 0; }
                .dp-card { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 11px; min-width: 0; }
                .dp-name { font-weight: 700; font-size: 13px; color: #fff; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .dp-email { font-size: 11px; color: rgba(255,255,255,0.42); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .dp-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
                .dp-meta span { font-size: 10px; color: rgba(255,255,255,0.34); min-width: 0; }
                .dp-docs { border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; padding: 2px 7px; color: rgba(255,255,255,0.58) !important; white-space: nowrap; }
                .dp-actions { display: flex; flex-wrap: wrap; gap: 6px; }
                .dp-link, .dp-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 30px; border-radius: 7px; padding: 0 9px; font-size: 10px; font-weight: 800; text-decoration: none; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.035); cursor: pointer; }
                .dp-btn { color: #fff; }
                .dp-btn.approve { color: #34d399; border-color: rgba(52,211,153,0.28); }
                .dp-btn.reject { color: #f87171; border-color: rgba(248,113,113,0.24); }
                .dp-btn:disabled { opacity: 0.42; cursor: not-allowed; }
                .dp-msg { margin-top: 7px; border-radius: 7px; padding: 6px 8px; font-size: 10px; line-height: 1.35; }
                .dp-msg.success { border: 1px solid rgba(52,211,153,0.24); background: rgba(52,211,153,0.08); color: #8df0c7; }
                .dp-msg.error { border: 1px solid rgba(248,113,113,0.25); background: rgba(248,113,113,0.08); color: #fca5a5; }
                @media (max-width: 760px) {
                    .dp-grid { grid-template-columns: 1fr; }
                    .dp-public-link { width: 100%; }
                    .dp-actions { align-items: stretch; }
                    .dp-link, .dp-btn { flex: 1 1 auto; min-height: 36px; }
                }
            `}</style>

            <div className="dp-head">
                <div>
                    <h2 className="dp-title">Driver Application Pipeline</h2>
                    <p className="dp-sub">
                        {totalOpen} open application{totalOpen !== 1 ? "s" : ""} · {grouped.ACTIVE.length} active driver{grouped.ACTIVE.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <a href="/drive" className="dp-public-link">
                    Open public Drive & Earn page
                </a>
            </div>

            <div className="dp-grid">
                {BUCKETS.map((bucket) => {
                    const items = grouped[bucket.key] || [];
                    return (
                        <div
                            key={bucket.key}
                            className="dp-col"
                            style={{
                                background: bucket.bg,
                                border: `1px solid ${bucket.border}`,
                            }}
                        >
                            <div className="dp-col-head">
                                <div className="dp-stage">
                                    <span className="dp-dot" style={{ background: bucket.color }} />
                                    <span className="dp-stage-label" style={{ color: bucket.color }}>{bucket.label}</span>
                                </div>
                                <span
                                    className="dp-count"
                                    style={{
                                        background: `${bucket.color}22`,
                                        color: bucket.color,
                                        border: `1px solid ${bucket.color}44`,
                                    }}
                                >
                                    {items.length}
                                </span>
                            </div>
                            <p className="dp-desc">{bucket.desc}</p>

                            <div className="dp-list">
                                {items.length === 0 && <p className="dp-empty">Empty</p>}
                                {items.slice(0, 5).map((driver) => (
                                    <div key={driver.id} className="dp-card">
                                        <div className="dp-name">{driver.user?.name || "Unknown driver"}</div>
                                        <div className="dp-email">{driver.user?.email || "No email on file"}</div>
                                        <div className="dp-meta">
                                            <span>{driver.vehicleType || "No vehicle"} · {timeAgo(driver.createdAt)}</span>
                                            <span className="dp-docs">{driver.docCount || 0}/3 docs</span>
                                        </div>
                                        {renderActions(driver, bucket.key, bucket.color)}
                                        {message?.driverId === driver.id && (
                                            <div className={`dp-msg ${message.type}`}>{message.text}</div>
                                        )}
                                    </div>
                                ))}
                                {items.length > 5 && (
                                    <p className="dp-empty">+{items.length - 5} more</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
