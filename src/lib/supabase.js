import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://digemxlvkswwusheaesk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZ2VteGx2a3N3d3VzaGVhZXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTA3MDYsImV4cCI6MjA5NDk2NjcwNn0.DpfKtHvaDq0o8-IzZ93EUcUWlf8OcJx9B7mP9WJWIJM'

export const supabase = createClient(supabaseUrl, supabaseKey)
