import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logout, updateInAppContent } from "../actions";
import PolicyCMS from "@/components/admin/PolicyCMS";

async function getPolicies() {
    try {
        const { data } = await supabaseAdmin
            .from('InAppContent')
            .select('*')
            .order('key');
        return data || [];
    } catch {
        return [];
    }
}

export default async function ContentCMSPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();

    let isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const policies = await getPolicies();

    return (
        <div className="min-h-screen">
             <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/admin/dashboard" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity font-serif italic text-white">
                        True<span className="text-primary not-italic font-sans uppercase tracking-widest text-lg">Serve</span> <span className="text-slate-500 font-sans text-xs tracking-widest uppercase ml-2">Content Master</span>
                    </Link>
                    <div className="flex gap-6 items-center">
                        <Link href="/admin/dashboard" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Registry</Link>
                        <Link href="/admin/settings" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Settings</Link>
                        <Link href="/admin/content" className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary pb-1">CMS</Link>
                        <form action={logout}>
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors">Log Out</button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="container py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-serif font-bold italic tracking-tighter text-white">Policy & <span className="text-gradient">Legal CMS</span></h1>
                    <p className="text-slate-400 text-sm font-medium mt-2">Manage live documentation, FAQs, and fee disclosures across the platform.</p>
                </header>

                <PolicyCMS 
                    policies={policies} 
                    onSave={async (key, title, content) => {
                        "use server";
                        return await updateInAppContent(key, title, content);
                    }} 
                />
            </main>
        </div>
    );
}
