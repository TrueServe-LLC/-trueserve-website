import { cookies } from "next/headers";
import { getDriverOrRedirect } from "@/lib/driver-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import PreferencesClient from "./PreferencesClient";

export const dynamic = 'force-dynamic';

const PREVIEW_PREFS = {
    navigationApp: 'google_maps',
    acceptAlcohol: true,
    acceptCash: false,
    longDistance: true,
};

export default async function DriverPreferences() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    if (isPreview) {
        return <PreferencesClient initial={PREVIEW_PREFS} />;
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) await getDriverOrRedirect();

    const { data: driver } = await supabaseAdmin
        .from('Driver')
        .select('navigationApp, acceptAlcohol, acceptCash, longDistance')
        .eq('userId', user!.id)
        .single();

    const initial = {
        navigationApp: driver?.navigationApp ?? 'google_maps',
        acceptAlcohol:  driver?.acceptAlcohol  ?? true,
        acceptCash:     driver?.acceptCash     ?? false,
        longDistance:   driver?.longDistance   ?? true,
    };

    return <PreferencesClient initial={initial} />;
}
