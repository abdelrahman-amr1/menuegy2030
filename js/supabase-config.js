// Supabase Configuration for H.M Group Storefront
// Replace the values below with your Supabase URL and Anon Key

const supabaseUrl = 'https://dwoodpzhkkwvhdzarags.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2b29kcHpoa2t3dmhkemFyYWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjU5NjksImV4cCI6MjA5ODI0MTk2OX0.JdVk0YetKB1NiqpDlLYHcEQxKcTwD77ES519NR9JCMg';

// Initialize Supabase Client
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  try {
    supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    window.supabaseDb = supabaseClient;
  } catch (e) {
    console.error("Error initializing Supabase client:", e);
  }
} else {
  console.warn("Supabase SDK was not loaded.");
}
