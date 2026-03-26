"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { loginWithPassword } from "../../auth/actions";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function MerchantLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#080c14] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <MerchantLoginContent />
        </Suspense>
    );
}

function MerchantLoginContent() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const data = new FormData();
        data.append("email", formData.email);
        data.append("password", formData.password);

        const res = await loginWithPassword(data);
        if (res.success) {
            if (res.role === 'MERCHANT') router.push("/merchant/dashboard");
            else router.push("/merchant/dashboard"); // Default for merchant login
        } else {
            setMessage({ text: res.message, type: 'error' });
        }
        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen bg-[#080c14] font-sans selection:bg-primary/30">
            {/* Sidebar - Inspired by HouseEats */}
            <aside className="hidden lg:flex w-[420px] bg-[#0a0a0b] border-r border-white/5 flex-col p-12 relative overflow-hidden shrink-0">
                {/* Decorative radial gradient */}
                <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                    {/* Logo */}
                    <Logo size="lg" />

                    {/* Program Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 w-fit">
                        🏪 Merchant Program
                    </div>

                    {/* Title */}
                    <h2 className="text-4xl md:text-5xl font-serif italic text-white leading-[1.1] mb-6">
                        Welcome Back, <br />
                        <span className="text-primary">Partner.</span>
                    </h2>

                    <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-xs">
                        Your kitchen's command center is ready. Access your orders, manage your menu, and track performance.
                    </p>

                    {/* Perks */}
                    <div className="space-y-4 mt-auto">
                        <PerkItem 
                            icon="🚀" 
                            title="Real-Time Orders" 
                            desc="Track every ticket from kitchen to customer." 
                        />
                        <PerkItem 
                            icon="📊" 
                            title="Growth Insights" 
                            desc="Understand your best-selling dishes instantly." 
                            amber 
                        />
                        <PerkItem 
                            icon="🛡️" 
                            title="Elite Support" 
                            desc="Priority 24/7 assistance for our partners." 
                        />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-y-auto">
                {/* Background Grid - HouseEats Style */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
                </div>

                {/* Mobile Nav Header */}
                <div className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl">
                    <Logo size="sm" />
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary">Merchant Login</div>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 md:p-16">
                    <div className="w-full max-w-md space-y-12">
                        {/* Header */}
                        <div className="space-y-2">
                            <h3 className="text-3xl font-serif italic text-white tracking-tight leading-tight">Merchant Access</h3>
                            <p className="text-slate-500 text-sm">Enter your credentials to manage your store.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message && (
                                <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
                                    message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'
                                }`}>
                                    <span>{message.type === 'error' ? '⚠️' : '✅'}</span>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="partner@yourstore.com"
                                        className="w-full bg-[#1c1916] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-700"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mr-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                                        <Link href="/login?mode=reset" className="text-[9px] font-black text-primary/60 uppercase tracking-widest hover:text-primary transition-colors">Forgot?</Link>
                                    </div>
                                    <input 
                                        type="password" 
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-[#1c1916] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-700"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-black font-black uppercase tracking-[0.3em] text-[11px] h-14 rounded-2xl italic shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                            >
                                {isLoading ? "Authorizing..." : "Continue to Dashboard →"}
                            </button>
                        </form>

                        {/* Footer Link */}
                        <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest italic opacity-60">New to the Network?</p>
                            <Link href="/merchant" className="badge-outline-white !py-3.5 !px-12 !text-[11px] !rounded-full">
                                Apply to Partner
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function PerkItem({ icon, title, desc, amber }: { icon: string; title: string; desc: string; amber?: boolean }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${amber ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 text-white border border-white/10'}`}>
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-[13px] font-bold text-white tracking-wide">{title}</p>
                <p className="text-[11px] text-slate-500 leading-tight">{desc}</p>
            </div>
        </div>
    );
}
