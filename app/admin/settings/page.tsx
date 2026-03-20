import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { updateConfigParam, logout } from "../actions";

async function getConfigs() {
    const { data } = await supabaseAdmin.from('SystemConfig').select('*').order('key');
    return data || [];
}

async function getAuditLogs() {
    const { data } = await supabaseAdmin
        .from('Audit_Log') // Wait, did I name it AuditLog or Audit_Log? Checking...
        // Actually, previous subagent tasks used "AuditLog". Let's check the schema again.
        .select(`*, actor:User(*)`)
        .eq('entityType', 'SystemConfig')
        .order('createdAt', { ascending: false })
        .limit(20);
    return data || [];
}

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();

    let isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const configs = await getConfigs();
    // Re-check AuditLog table name. In my SQL it was "AuditLog".
    const { data: auditLogs } = await supabaseAdmin
        .from('AuditLog')
        .select(`*, actor:User(*)`)
        .eq('entityType', 'SystemConfig')
        .order('createdAt', { ascending: false })
        .limit(10);

    return (
        <div className="min-h-screen bg-[#050505] text-white">
             {/* Navigation */}
             <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/5 px-6 py-4 bg-black/50">
                <div className="container flex justify-between items-center">
                    <Link href="/admin/dashboard" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
                        True<span className="text-gradient">Serve</span> <span className="text-slate-500 font-medium">Settings</span>
                    </Link>
                    <div className="flex gap-6 items-center">
                        <Link href="/admin/dashboard" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Registry</Link>
                        <Link href="/admin/pricing" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing</Link>
                        <Link href="/admin/settings" className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary pb-1">Settings</Link>
                        <form action={logout}>
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors">Log Out</button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="container py-12 max-w-5xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Operational <span className="text-gradient">Parameters</span></h1>
                    <p className="text-slate-400 text-sm font-medium">Fine-tune global platform constraints and feature rollouts.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Config Grid */}
                    <div className="lg:col-span-2 space-y-4">
                        {configs.map((config) => (
                            <div key={config.key} className="card p-6 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-white">{config.key.replace(/_/g, ' ')}</h3>
                                        <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded cursor-help" title="Config Key">{config.key}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">{config.description}</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <form action={async (formData: FormData) => {
                                        "use server";
                                        const val = formData.get('value');
                                        // Attempt to parse as boolean or number if applicable
                                        let parsedVal: any = val;
                                        if (val === 'true') parsedVal = true;
                                        else if (val === 'false') parsedVal = false;
                                        else if (!isNaN(Number(val))) parsedVal = Number(val);
                                        
                                        await updateConfigParam(config.key as any, parsedVal);
                                    }} className="flex-1 md:flex-none flex gap-2">
                                        {typeof config.value === 'boolean' ? (
                                            <input type="hidden" name="value" value={config.value ? 'false' : 'true'} />
                                        ) : (
                                            <input 
                                                name="value" 
                                                defaultValue={config.value} 
                                                className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold w-24 focus:border-primary outline-none transition-all"
                                            />
                                        )}
                                        <button className={`btn ${typeof config.value === 'boolean' ? (config.value ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20') : 'btn-primary'} text-[10px] font-black uppercase tracking-widest px-4`}>
                                            {typeof config.value === 'boolean' ? (config.value ? 'ENABLED' : 'DISABLED') : 'UPDATE'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Change History (Side Panel) */}
                    <aside className="space-y-6">
                        <section className="card p-6 border-white/5 bg-white/[0.01]">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center justify-between">
                                Audit History
                                <span className="bg-white/5 px-2 py-0.5 rounded-full text-[9px] font-bold">Recent Changes</span>
                            </h2>
                            <div className="space-y-4">
                                {auditLogs?.map((log: any) => (
                                    <div key={log.id} className="border-l-2 border-primary/20 pl-4 py-1">
                                        <p className="text-[10px] font-black uppercase text-white mb-1">{log.targetId.replace(/_/g, ' ')}</p>
                                        <div className="flex justify-between items-center text-[9px]">
                                            <span className="text-slate-500 font-bold">{log.actor?.name || 'ADMIN'}</span>
                                            <span className="text-slate-600">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!auditLogs || auditLogs.length === 0) && (
                                    <p className="text-[10px] text-slate-600 italic">No recent configuration changes logged.</p>
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}
