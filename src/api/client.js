import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzvzontsjcdqjkvvnuyc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dnpvbnRzamNkcWprdnZudXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTc0MzksImV4cCI6MjA5MjM3MzQzOX0.3HxRGthKfruxPMqxKkxdG57DZLyQz-j9GyvecasI-0k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
