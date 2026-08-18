import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.EXPO_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL)) ||
  'https://bftsfgoenlgflhpfrqgf.supabase.co'

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdHNmZ29lbmxnZmxocGZycWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MTM5NzQsImV4cCI6MjEwMDE4OTk3NH0.2LSDT2ZD_yFtjTWINJa72KKiZSH0fw-hERTUX08YeQ4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
