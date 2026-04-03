import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function PersonalInfoPage() {
    const { isAuth, userId } = await getAuthSession();
    if (!isAuth || !userId) return null;

    const supabase = await createClient();
    const { data: user } = await supabase.from('User').select('*').eq('id', userId).single();

    return (
        <div className="min-h-screen bg-[#000] text-[#F0EDE8] font-sans pb-40">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                .bebas { font-family: 'Bebas Neue', sans-serif; }
                .barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
                .fi::placeholder { color: #222; }
                .fi:focus { border-color: #e8a230; background: #080808; }
            ` }} />

            <nav className="flex items-center gap-4 px-8 pt-10 pb-6 max-w-[440px] mx-auto">
                <Link href="/user/settings" className="text-[#555] hover:text-white transition-colors">←</Link>
                <div className="flex-1 flex justify-center pr-6"><Logo size="sm" /></div>
            </nav>

            <main className="px-8 max-w-[440px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                    <h1 className="bebas text-5xl italic tracking-wide text-white uppercase">PERSONAL<span className="text-[#e8a230]">INFO.</span></h1>
                    <p className="barlow-cond text-[10px] font-black uppercase tracking-[0.3em] text-[#333] mt-1 pr-1 italic">Uplink your identity configuration</p>
                </header>

                <form className="space-y-8">
                    <div className="space-y-2">
                        <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.2em] text-[#e8a230] ml-1">FULL NAME</label>
                        <input type="text" className="fi w-full bg-[#0d0d0d] border border-white/5 text-[16px] px-6 py-5 text-white outline-none rounded-2xl transition-all shadow-xl" defaultValue={user?.name || ""} />
                    </div>

                    <div className="space-y-2">
                        <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.2em] text-[#333] ml-1">NETWORK EMAIL</label>
                        <input type="email" className="fi w-full bg-[#0d0d0d] border border-white/5 text-[16px] px-6 py-5 text-white/40 outline-none rounded-2xl transition-all shadow-xl cursor-not-allowed" defaultValue={user?.email || ""} readOnly />
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#222] ml-1 italic">Email verification protocol locked.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.2em] text-[#333] ml-1">MOBILE CONTACT</label>
                        <input type="tel" className="fi w-full bg-[#0d0d0d] border border-white/5 text-[16px] px-6 py-5 text-white outline-none rounded-2xl transition-all shadow-xl" placeholder="(336) 000-0000" defaultValue={user?.phone || ""} />
                    </div>

                    <div className="space-y-2">
                        <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.2em] text-[#333] ml-1">PRIMARY MISSION ZONE</label>
                        <input type="text" className="fi w-full bg-[#0d0d0d] border border-white/5 text-[16px] px-6 py-5 text-white outline-none rounded-2xl transition-all shadow-xl" placeholder="Ex: Charlotte, NC" defaultValue={user?.address || ""} />
                    </div>

                    <div className="pt-6">
                        <button type="button" className="w-full bg-[#e8a230] text-black bebas italic text-[24px] tracking-wider py-6 rounded-2xl transition-all shadow-[0_20px_50px_rgba(232,162,48,0.2)] active:scale-95">
                            SYNC IDENTITY DATA →
                        </button>
                    </div>
                </form>

                <div className="text-center opacity-10 pt-10">
                    <p className="barlow-cond text-[9px] font-black tracking-[0.4em] uppercase">Security Level 4 Authorization Active</p>
                </div>
            </main>
        </div>
    );
}
