
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    console.log('Testing Supabase connection...')
    console.log('URL:', supabaseUrl)

    // Try to access a public table or just check health/auth
    // Since we might not have RLS setup for anonymous access to User table, 
    // we will try to just list tables or do a simple health check 
    // by attempting a select on a table we know exists.
    // Using 'User' as per Prisma schema, but standard Supabase/Postgres is often lowercase 'User' or just user.
    // We'll try a safe query.

    const { data, error } = await supabase.from('User').select('count').limit(1)

    if (error) {
        console.error('Connection/Query Error:', error.message)
        console.log('Note: This might be due to RLS (Row Level Security) policies if the table exists.')
    } else {
        console.log('Connection Successful! Data received:', data)
    }
}

testConnection()
