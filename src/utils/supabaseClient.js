import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gmqfzlnwgvchhzrcpyvs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcWZ6bG53Z3ZjaGh6cmNweXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjEwODIsImV4cCI6MjEwNjc5NzA4Mn0.XsyDy995Aa2hgFd0uIrNoL7V1akp6iNDVLdJozhD9QE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)