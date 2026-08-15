const EXPECTED_SUPABASE_URL = 'https://qdfuddoznqlrkgkbylgu.supabase.co';
const SUPABASE_URL = 'https://qdfuddoznqlrkgkbylgu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JiydRHQ3JZXfFeJXzgCkdw_AlGmJtBy';

if (SUPABASE_URL !== EXPECTED_SUPABASE_URL) {
    throw new Error(`Supabase URL mismatch. Expected ${EXPECTED_SUPABASE_URL}`);
}

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
