import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zuoaywpcqwsnjqdmdwms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1b2F5d3BjcXdzbmpxZG1kd21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTk3NDcsImV4cCI6MjA4NDA5NTc0N30.FqLEJQCwGmrzUuImBdam42R2tNj3TD3OldFpmud95q4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
