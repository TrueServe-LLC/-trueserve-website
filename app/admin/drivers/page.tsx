import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { approveDriver, markDriverReadyForReview, rejectDriver, requestDriverDocuments } from "@/app/admin/actions";
import AdminPortalWrapper from "@/app/admin/AdminPortalWrapper";
import DriverApplicationActions from "@/components/admin/DriverApplicationActions";
import DriverPipeline from "@/components/admin/DriverPipeline";
import { filterAdminUsers, isMockAdminRecord, shouldHideMockAdminData } from "@/lib/admin-data";
import { resolveDriverDocumentUrl } from "@/lib/driver-documents";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function docCount(driver: any) {
    return [driver.licenseUrl, driver.insuranceUrl, driver.registrationUrl].filter(Boolean).length;
}

export default async function AdminDriversPage({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string }>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const query = (resolvedSearchParams.q || "").trim().toLowerCase();
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, "drivers"));
    if (!isAuthorized) redirect("/admin/login");

    const { data: drivers } = await supabaseAdmin
        .from("Driver")
        .select(`
            id,
            userId,
            status,
            complianceStatus,
            vehicleType,
            createdAt,
            updatedAt,
            vehicleVerified,
            backgroundCheckStatus,
            aiMetadata,
            insuranceDocumentUrl,
            registrationDocumentUrl,
            user:User(id, name, email, phone)
        `)
        .order("updatedAt", { ascending: false })
        .limit(300);

    const driverDocs = await Promise.all((drivers || []).map(async (driver: any) => {
        const documentPaths = driver.aiMetadata?.documentPaths || {};
        const [licenseUrl, insuranceUrl, registrationUrl] = await Promise.all([
            resolveDriverDocumentUrl(documentPaths.idDocumentPath || null, 60 * 60),
            resolveDriverDocumentUrl(documentPaths.insuranceDocumentPath || driver.insuranceDocumentUrl || null, 60 * 60),
            resolveDriverDocumentUrl(documentPaths.registrationDocumentPath || driver.registrationDocumentUrl || null, 60 * 60),
        ]);
        return { ...driver, licenseUrl, insuranceUrl, registrationUrl };
    }));

    const visibleDrivers = (shouldHideMockAdminData()
        ? driverDocs.filter((driver: any) => !isMockAdminRecord(driver.user))
        : driverDocs
    ).filter((driver: any) => {
        if (!query) return true;
        return [driver.user?.name, driver.user?.email, driver.user?.phone, driver.status, driver.complianceStatus, driver.vehicleType].some((value) =>
            String(value || "").toLowerCase().includes(query)
        );
    });

    const active = visibleDrivers.filter((driver: any) => String(driver.complianceStatus || "").toUpperCase() === "ACTIVE" || driver.vehicleVerified).length;
    const ready = visibleDrivers.filter((driver: any) => ["READY_FOR_REVIEW", "IN_REVIEW"].includes(String(driver.complianceStatus || "").toUpperCase())).length;
    const pendingDocs = visibleDrivers.filter((driver: any) => docCount(driver) < 3 && !driver.vehicleVerified).length;
    const open = visibleDrivers.length - active;

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .drv-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
                .drv-card, .drv-list, .drv-workflow {
                    background: rgba(20,26,24,0.92);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.16);
                }
                .drv-card { padding: 16px; }
                .drv-label { color: #777; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
                .drv-value { color: #fff; font-size: 28px; font-weight: 800; margin-top: 7px; }
                .drv-sub { color: #888; font-size: 12px; margin-top: 4px; }
                .drv-search { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
                .drv-input { min-width: 280px; border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.04); color: #fff; border-radius: 12px; padding: 10px 12px; outline: none; transition: border-color 140ms ease, box-shadow 140ms ease; }
                .drv-input:focus { border-color: rgba(249,115,22,0.72); box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
                .drv-btn { border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.04); color: #fff; border-radius: 12px; padding: 10px 14px; text-decoration: none; cursor: pointer; font-weight: 800; }
                .drv-list { padding: 16px; }
                .drv-list h2 { color: #fff; font-size: 15px; margin: 0 0 6px; }
                .drv-list p { color: #777; font-size: 12px; line-height: 1.5; margin: 0 0 14px; }
                .drv-workflow { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; overflow: hidden; margin-bottom: 16px; }
                .drv-step { padding: 16px; border-right: 1px solid rgba(255,255,255,0.06); }
                .drv-step:last-child { border-right: none; }
                .drv-step-num { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 10px; background: rgba(249,115,22,0.12); color: #f97316; font-size: 12px; font-weight: 900; margin-bottom: 12px; }
                .drv-step strong { display: block; color: #fff; font-size: 13px; margin-bottom: 5px; }
                .drv-step span { display: block; color: rgba(255,255,255,0.54); font-size: 12px; line-height: 1.5; }
                .drv-row { display: flex; justify-content: space-between; gap: 16px; padding: 14px; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; background: rgba(255,255,255,0.035); margin-bottom: 10px; }
                .drv-name { color: #fff; font-weight: 800; font-size: 13px; }
                .drv-meta { color: #888; font-size: 12px; margin-top: 4px; }
                .drv-docs { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; align-items: center; }
                .drv-link { display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(52,211,153,.22); background: rgba(52,211,153,.07); color: #34d399; min-height: 32px; padding: 0 10px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: 800; }
                .drv-link.missing { color: #666; border-color: #1e2420; background: rgba(255,255,255,.02); pointer-events: none; }
                .um-app-action-stack { display: flex; flex-direction: column; gap: 7px; min-width: 240px; }
                .um-app-action-row { display: flex; justify-content: flex-end; align-items: center; gap: 7px; flex-wrap: wrap; }
                .um-app-btn {
                    min-height: 32px;
                    border-radius: 9px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.04);
                    color: rgba(255,255,255,0.78);
                    padding: 0 10px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: transform 120ms ease, border-color 120ms ease, background-color 120ms ease;
                }
                .um-app-btn:hover:not(:disabled) { transform: translateY(-1px); border-color: rgba(255,255,255,0.16); }
                .um-app-btn:disabled { opacity: 0.45; cursor: not-allowed; }
                .um-app-btn.ready { color: #fbbf24; border-color: rgba(251,191,36,0.24); background: rgba(251,191,36,0.08); }
                .um-app-btn.approve { color: #34d399; border-color: rgba(52,211,153,0.24); background: rgba(52,211,153,0.08); }
                .um-app-btn.reject { color: #f87171; border-color: rgba(248,113,113,0.24); background: rgba(248,113,113,0.08); }
                .um-app-action-message { max-width: 360px; margin-left: auto; border-radius: 10px; padding: 8px 10px; font-size: 11px; line-height: 1.45; }
                .um-app-action-message.success { color: #bbf7d0; background: rgba(22,163,74,0.12); border: 1px solid rgba(34,197,94,0.2); }
                .um-app-action-message.error { color: #fecaca; background: rgba(220,38,38,0.12); border: 1px solid rgba(248,113,113,0.2); }
                @media (max-width: 980px) { .drv-grid { grid-template-columns: repeat(2, 1fr); } .drv-workflow { grid-template-columns: repeat(2, 1fr); } .drv-step:nth-child(2) { border-right: none; } .drv-row { flex-direction: column; } .drv-docs { justify-content: flex-start; } .um-app-action-stack { min-width: 0; width: 100%; } .um-app-action-row { justify-content: flex-start; } .um-app-action-message { margin-left: 0; } }
                @media (max-width: 640px) { .drv-grid { grid-template-columns: 1fr; } .drv-input { min-width: 0; width: 100%; } }
            `}</style>
            <div className="adm-page-header">
                <h1>Drivers</h1>
                <p>Driver recruiting pipeline, document review, approval status, zones, and background check readiness.</p>
                <form method="get" className="drv-search">
                    <input className="drv-input" name="q" defaultValue={resolvedSearchParams.q || ""} placeholder="Search drivers..." />
                    <button className="drv-btn" type="submit">Search</button>
                    {resolvedSearchParams.q ? <a className="drv-btn" href="/admin/drivers">Clear</a> : null}
                </form>
            </div>
            <div className="adm-page-body">
                <div className="drv-grid">
                    <div className="drv-card"><div className="drv-label">Open pipeline</div><div className="drv-value">{open}</div><div className="drv-sub">Not active yet</div></div>
                    <div className="drv-card"><div className="drv-label">Pending docs</div><div className="drv-value">{pendingDocs}</div><div className="drv-sub">Need license, insurance, registration</div></div>
                    <div className="drv-card"><div className="drv-label">Ready review</div><div className="drv-value">{ready}</div><div className="drv-sub">Admin decision needed</div></div>
                    <div className="drv-card"><div className="drv-label">Active</div><div className="drv-value">{active}</div><div className="drv-sub">$20/hr daily pay pool</div></div>
                </div>
                <section className="drv-workflow" aria-label="Driver document review workflow">
                    <div className="drv-step"><div className="drv-step-num">1</div><strong>Storage upload</strong><span>Driver files live in private Supabase Storage, not inside the database.</span></div>
                    <div className="drv-step"><div className="drv-step-num">2</div><strong>Metadata queue</strong><span>DB records track type, expiry, status, reviewer, and notes for each file.</span></div>
                    <div className="drv-step"><div className="drv-step-num">3</div><strong>Human review</strong><span>Admin opens signed links, verifies documents, then moves the driver to review.</span></div>
                    <div className="drv-step"><div className="drv-step-num">4</div><strong>Approval notice</strong><span>Approval updates compliance, login access, and outbound email/SMS when configured.</span></div>
                </section>
                <DriverPipeline
                    drivers={visibleDrivers.map((driver: any) => ({
                        id: driver.id,
                        userId: driver.userId,
                        complianceStatus: driver.complianceStatus || driver.status || "NEW_APPLICATION",
                        backgroundCheckStatus: driver.backgroundCheckStatus || "PENDING",
                        vehicleType: driver.vehicleType,
                        createdAt: driver.createdAt || new Date().toISOString(),
                        docCount: docCount(driver),
                        user: driver.user,
                    }))}
                    requestDocsAction={requestDriverDocuments}
                    readyAction={markDriverReadyForReview}
                    approveAction={approveDriver}
                    rejectAction={rejectDriver}
                />
                <section id="driver-document-review" className="drv-list">
                    <h2>Document Review</h2>
                    <p>Open the signed document links, then move complete applications to Ready for Review or approve them. Drivers are not cleared until this screen says Active.</p>
                    {visibleDrivers.map((driver: any) => (
                        <div key={driver.id} className="drv-row">
                            <div>
                                <div className="drv-name">{driver.user?.name || "Driver"} · {driver.user?.email || "No email"}</div>
                                <div className="drv-meta">{driver.user?.phone || "No phone"} · {docCount(driver)}/3 docs · {driver.complianceStatus || driver.status || "NEW_APPLICATION"}</div>
                            </div>
                            <div className="drv-docs">
                                <a className={`drv-link${driver.licenseUrl ? "" : " missing"}`} href={driver.licenseUrl || "#"} target="_blank" rel="noreferrer">License</a>
                                <a className={`drv-link${driver.insuranceUrl ? "" : " missing"}`} href={driver.insuranceUrl || "#"} target="_blank" rel="noreferrer">Insurance</a>
                                <a className={`drv-link${driver.registrationUrl ? "" : " missing"}`} href={driver.registrationUrl || "#"} target="_blank" rel="noreferrer">Registration</a>
                                <DriverApplicationActions
                                    driverId={driver.id}
                                    readyAction={markDriverReadyForReview}
                                    readyDisabled={docCount(driver) < 3}
                                    readyDisabledReason={`${docCount(driver)}/3 documents uploaded. License, insurance, and registration are required.`}
                                    approveAction={approveDriver}
                                    rejectAction={rejectDriver}
                                />
                            </div>
                        </div>
                    ))}
                    {visibleDrivers.length === 0 ? <p>No drivers found.</p> : null}
                </section>
            </div>
        </AdminPortalWrapper>
    );
}
