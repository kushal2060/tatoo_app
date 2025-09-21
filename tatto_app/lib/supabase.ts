import { createClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('Supabase Environment Check:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Create the main client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
(async () => {
  try {
    const { error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful');
    }
  } catch (err) {
    console.error('Supabase connection error:', err);
  }
})();
// Test connection function (call when needed, not immediately)
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    } else {
      console.log('Supabase connection successful');
      return true;
    }
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
};

// For server-side operations (optional)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;