import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    const headersList = await headers()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        const host = headersList.get('host') || "";
                        const cleanHost = host.split(':')[0];
                        const isLocal = cleanHost.includes("localhost");
                        const isVercel = cleanHost.endsWith(".vercel.app");
                        
                        let cookieDomain: string | undefined = undefined;
                        const pieces = cleanHost.split('.');
                        if (!isLocal && !isVercel && pieces.length >= 2) {
                            cookieDomain = `.${pieces.slice(-2).join('.')}`;
                        }

                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                domain: cookieDomain
                            })
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
