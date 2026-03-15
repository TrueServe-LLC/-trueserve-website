import 'whatwg-fetch'
import '@testing-library/jest-dom'

// Only set mock fallbacks — don't override real keys already loaded from .env.local
// This allows integration tests to use the real Supabase project if keys are present,
// while unit tests (which don't load .env.local) still get safe mock values.
// Note: Integration tests are configured to skip if they detect 'mock' in the URL.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';
}
