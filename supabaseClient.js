import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and Anon Key
const supabaseUrl = 'https://ofjqzcvgabxmwwdnelue.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9manF6Y3ZnYWJ4bXd3ZG5lbHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzcyMTUsImV4cCI6MjA2OTA1MzIxNX0.pQU434HDU5g-IItPeCqOrw15kYYf5hQrex1ubRhLV3w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);