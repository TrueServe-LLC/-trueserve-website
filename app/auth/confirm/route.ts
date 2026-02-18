import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            // Check if user session is active
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // SYNC: Ensure the user exists in our public User table
                try {
                    const { data: existingUser } = await supabase
                        .from('User')
                        .select('id')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (!existingUser) {
                        await supabase.from('User').insert({
                            id: user.id,
                            email: user.email,
                            name: user.user_metadata.full_name || user.email?.split('@')[0] || "New User",
                            role: 'CUSTOMER', // Default Role, can be updated later setup
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                    }
                } catch (e) {
                    console.error("User Sync Error:", e);
                    // Continue to redirect even if sync fails
                }
            }
            redirect(next)
        } else {
            console.error("OTP Verification Error:", error.message);
        }
    }

    // return the user to an error page with some instructions
    redirect('/auth/auth-code-error')
}
