"use client";

interface Driver {
    id: string;
    userId: string;
    complianceStatus: string;
    backgroundCheckStatus: string;
    vehicleType?: string;
    createdAt: string;
    user?: { id: string; name: string; email: string; phone?: string };
}

interface Props {
    drivers: Driver[];
    onApprove?: (driverId: string) => void;
    onReject?: (driverId: string) => void;
}

const BUCKETS = [
    {
        key: "NEW_APPLICATION",
        label: "New Application",
        icon: "📥",
        color: "#818cf8",
        bg: "rgba(129,140,248,0.08)",
        border: "rgba(129,140,248,0.2)",
        desc: "Just submitted micro-form",
    },
    {
        key: "PENDING_DOCUMENTS",
        label: "Pending Documents",
        icon: "📄",
        color: "#fbbf24",
        bg: "rgba(251,191,36,0.08)",
        border: "rgba(251,191,36,0.2)",
        desc: "Waiting on license & insurance",
    },
    {
        key: "READY_FOR_REVIEW",
        label: "Ready for Review",
        icon: "🔍",
        color: "#f97316",
        bg: "rgba(249,115,22,0.08)",
        border: "rgba(249,115,22,0.2)",
        desc: "Documents uploaded",
    },
    {
        key: "ACTIVE",
        label: "Approved / Active",
        icon: "✅",
        color: "#34d399",
        bg: "rgba(52,211,153,0.08)",
        border: "rgba(52,211,153,0.2)",
        desc: "Cleared and delivering",
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
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function DriverPipeline({ drivers }: Props) {
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

    return (
        <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Driver Application Pipeline</h2>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
                        {totalOpen} open application{totalOpen !== 1 ? "s" : ""} · {grouped.ACTIVE.length} active driver{grouped.ACTIVE.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <a
                    href="/drive"
                    target="_blank"
                    style={{ fontSize: 12, color: "#f97316", textDecoration: "none" }}
                >
                    View /drive page ↗
                </a>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {BUCKETS.map((bucket) => {
                    const items = grouped[bucket.key] || [];
                    return (
                        <div key={bucket.key} style={{
                            background: bucket.bg,
                            border: `1px solid ${bucket.border}`,
                            borderRadius: 12, padding: "16px",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 16 }}>{bucket.icon}</span>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: bucket.color }}>{bucket.label}</span>
                                </div>
                                <span style={{
                                    background: bucket.color + "22",
                                    color: bucket.color,
                                    border: `1px solid ${bucket.color}44`,
                                    borderRadius: 999, padding: "2px 8px",
                                    fontSize: 11, fontWeight: 700,
                                }}>
                                    {items.length}
                                </span>
                            </div>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>{bucket.desc}</p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {items.length === 0 && (
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "12px 0" }}>
                                        Empty
                                    </p>
                                )}
                                {items.slice(0, 5).map((driver) => (
                                    <div key={driver.id} style={{
                                        background: "rgba(0,0,0,0.25)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: 8, padding: "10px 12px",
                                    }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 2 }}>
                                            {driver.user?.name || "Unknown"}
                                        </div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                                            {driver.user?.email}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                                                {driver.vehicleType || "—"} · {timeAgo(driver.createdAt)}
                                            </span>
                                            <a
                                                href={`/admin/users?q=${encodeURIComponent(driver.user?.email || "")}`}
                                                style={{ fontSize: 10, color: bucket.color, textDecoration: "none" }}
                                            >
                                                Review →
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                {items.length > 5 && (
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                                        +{items.length - 5} more
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
