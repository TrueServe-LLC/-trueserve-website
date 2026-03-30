import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { getLiveChats } from "./actions";
import { logout } from "../actions";
import LiveChatDashboard from "@/components/admin/LiveChatDashboard";

export default async function LiveChatsPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();

    let isAuthorized = !!adminSession || (isAuth && role === "ADMIN");

    if (!isAuthorized) {
        redirect("/admin/login");
    }

    const chats = await getLiveChats();

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
                            <Link href="/admin/pricing" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing</Link>
                            <Link href="/admin/support" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Tickets</Link>
                            <Link href="/admin/live-chats" className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary pb-1">Live Chats</Link>
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
                   <h2 className="text-4xl font-black tracking-tighter mb-2 underline decoration-primary/30">AI Live <span className="text-gradient">Escalations</span></h2>
                   <p className="text-slate-500 font-medium">Real-time view of Claude AI interactions and human handoff requests.</p>
                </div>
                
                <LiveChatDashboard initialChats={chats} />
            </main>
        </div>
    );
}
