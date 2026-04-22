import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjbondqvxnprntbruiml.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqYm9uZHF2eG5wcm50YnJ1aW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NjUzNDAsImV4cCI6MjA5MjM0MTM0MH0.2CPBvazCEtUi232-Sh7DacJHt6fdxtzbesh5i47o1F8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
