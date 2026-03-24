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
            <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-red-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 justify-center animate-pulse z-[60]">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p className="text-sm leading-6 text-white font-bold">
                        <strong className="font-black uppercase tracking-widest text-[10px] bg-white text-red-600 px-2 py-0.5 rounded mr-2">
                            Maintenance Alert
                        </strong>
                        <span className="hidden md:inline italic">We are currently experiencing a system issue. </span>
                        Ordering is temporarily disabled while we resolve an active incident.
                    </p>
                </div>
                <div className="flex flex-1 justify-end">
                    <button type="button" className="-m-3 p-3 focus-visible:outline-offset-[-4px] hidden">
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    } catch (e) {
        console.error("Failed to load emergency banner:", e);
        return null;
    }
}
