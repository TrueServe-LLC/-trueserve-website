import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { getSupportTickets } from "./actions";
import SupportCenter from "@/components/admin/SupportCenter";
import { logout } from "../actions";

export default async function SupportAdminPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role, userId } = await getAuthSession();

    let isAuthorized = !!adminSession || (isAuth && role === "ADMIN");

    if (!isAuthorized) {
        redirect("/admin/login");
    }

    const tickets = await getSupportTickets();

    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link href="/admin/dashboard" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
                            True<span className="text-gradient">Serve</span> Admin
                        </Link>
                        <div className="hidden md:flex gap-6">
                            <Link href="/admin/dashboard" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Dashboard</Link>
                            <Link href="/admin/pricing" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing Rules</Link>
                            <Link href="/admin/support" className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary pb-1">Support Desk</Link>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <form action={async () => {
                            "use server";
                            await logout();
                        }}>
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Log Out</button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="container py-16">
                <div className="mb-12">
                   <h2 className="text-4xl font-black tracking-tighter mb-2 underline decoration-primary/30">Customer <span className="text-gradient">Advocacy</span></h2>
                   <p className="text-slate-500 font-medium">Resolving pilot disputes, order adjustments, and refund authorization.</p>
                </div>
                <SupportCenter initialTickets={tickets} currentAdminId={userId || "system_admin"} />
            </main>

            <footer className="container py-20 border-t border-white/5 opacity-30 text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">TrueServe Support Desk • v1.0.4-pilot</p>
            </footer>
        </div>
    );
}
