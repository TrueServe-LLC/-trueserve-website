import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import MerchantModeToggle from "@/components/MerchantModeToggle";

export const dynamic = 'force-dynamic';

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth, userId, role } = await getAuthSession();
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;

    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect('/login?role=merchant&next=/merchant/dashboard');
    }

    let restaurant: any = null;
    if (isPreview) {
        restaurant = { name: "Emerald Kitchen (Preview)" };
    } else {
        const supabase = await createClient();
        const { data } = await supabase
            .from('Restaurant')
            .select('*')
            .eq('ownerId', activeUserId)
            .maybeSingle();
        restaurant = data;
    }

    const merchantInitials = restaurant?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'M';

    return (
        <>
            <style>{`
                /* ── MERCHANT LAYOUT TOKENS ── */
                .ml-bg { background: #0c0e13; }
                .ml-border { border-color: #1c1f28; }
                .ml-panel { background: #0f1219; }
                .ml-surface { background: #131720; }

                /* ── TOP NAV ── */
                .ml-top-nav {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 24px; height: 52px;
                    background: #0c0e13; border-bottom: 1px solid #1c1f28;
                    position: sticky; top: 0; z-index: 50;
                }
                .ml-nav-left { display: flex; align-items: center; gap: 24px; }
                .ml-nav-brand { font-size: 15px; font-weight: 700; color: #fff; text-decoration: none; }
                .ml-nav-brand span { color: #e8a230; }
                .ml-nav-links { display: flex; gap: 2px; }
                .ml-nav-link {
                    font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
                    text-transform: uppercase; color: #555; padding: 6px 12px;
                    cursor: pointer; display: flex; align-items: center; gap: 5px;
                    text-decoration: none; border-bottom: 2px solid transparent;
                }
                .ml-nav-link:hover { color: #aaa; }
                .ml-nav-link.active { color: #e8a230; border-bottom-color: #e8a230; }
                .ml-nav-right { display: flex; align-items: center; gap: 8px; }
                .ml-store-status { display: flex; flex-direction: column; align-items: flex-end; margin-right: 8px; }
                .ml-store-status-label { font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #555; }
                .ml-store-status-live { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; }
                .ml-live-dot { width: 6px; height: 6px; background: #3dd68c; border-radius: 50%; animation: ml-pulse 2s infinite; flex-shrink: 0; }
                @keyframes ml-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
                .ml-mode-tabs { display: flex; gap: 1px; }
                .ml-mode-tab {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
                    text-transform: uppercase; padding: 7px 14px;
                    background: #131720; border: 1px solid #1c1f28; color: #555; cursor: pointer;
                }
                .ml-mode-tab.active { background: #e8a230; color: #000; border-color: #e8a230; }
                .ml-nav-avatar {
                    width: 32px; height: 32px; background: #e8a230; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 13px; font-weight: 700; color: #000; cursor: pointer;
                }
            `}</style>

            <div style={{ background: '#0c0e13', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
                {/* TOP NAV */}
                <div className="ml-top-nav">
                    <div className="ml-nav-left">
                        <Link href="/" className="ml-nav-brand">True<span>Serve</span></Link>
                        <div className="ml-nav-links">
                            <Link href="/" className="ml-nav-link">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M1 3h10M1 6h7M1 9h9" stroke="#555" strokeWidth="1.3" strokeLinecap="round"/>
                                </svg>
                                Customer Preview
                            </Link>
                            <Link href="/merchant/dashboard/integrations" className="ml-nav-link">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M4 4h4M4 8h4M2 6h8" stroke="#555" strokeWidth="1.3" strokeLinecap="round"/>
                                </svg>
                                Integrations
                            </Link>
                            <Link href="/merchant/dashboard" className="ml-nav-link active">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <rect x="1" y="1" width="10" height="10" rx="1" stroke="#e8a230" strokeWidth="1.3"/>
                                    <path d="M4 6h4M6 4v4" stroke="#e8a230" strokeWidth="1.3"/>
                                </svg>
                                Merchant Hub
                            </Link>
                        </div>
                    </div>
                    <div className="ml-nav-right">
                        <div className="ml-store-status">
                            <div className="ml-store-status-label">Store Status</div>
                            <div className="ml-store-status-live">
                                <span className="ml-live-dot"></span>
                                Live Terminal
                            </div>
                        </div>
                        <MerchantModeToggle />
                        <div className="ml-nav-avatar">{merchantInitials}</div>
                    </div>
                </div>

                <main>{children}</main>
            </div>
        </>
    );
}
