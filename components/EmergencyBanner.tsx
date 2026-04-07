import { supabase } from '@/lib/supabase';

export default async function EmergencyBanner() {
    try {
        const { data, error } = await supabase
            .from('SystemConfig')
            .select('value')
            .eq('key', 'MARKETPLACE_EMERGENCY_LOCK')
            .maybeSingle();

        if (error || !data) return null;

        const isLocked = data.value === true || data.value === 'true';

        if (!isLocked) return null;

        return (
            <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-red-950 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 justify-center animate-pulse z-[60] border-b border-red-500/30">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p className="text-xs leading-6 text-red-200 font-bold font-barlow-cond uppercase tracking-widest italic">
                        <strong className="font-bebas text-sm bg-red-600 text-white px-2 py-0.5 rounded mr-3 shadow-lg">
                            Alert
                        </strong>
                        Discovery Protocol Active: System in Lock-Down Mode. Ordering temporarily disabled.
                    </p>
                </div>
            </div>
        );
    } catch (e) {
        console.error("Failed to load emergency banner:", e);
        return null;
    }
}
