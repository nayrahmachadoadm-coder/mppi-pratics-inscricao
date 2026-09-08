import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljbxctmywdpsfmjvmlmh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYnhjdG15d2Rwc2ZtanZtbG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzY5MTYsImV4cCI6MjA3MzUxMjkxNn0.7A5d6_TvKyRV2Csqf43hkXzvaCd-5b2tKKlAU4ucyaY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_schema_columns', { table_name: 'inscricoes' })
  if (error) {
    // se rpc falhar, vamos tentar ler 1 registro
    const { data: d2, error: e2 } = await supabase.from('inscricoes').select('*').limit(1)
    console.log("Error:", e2)
    console.log("Columns:", d2 && d2.length > 0 ? Object.keys(d2[0]) : "No data")
  } else {
    console.log(data)
  }
}

checkSchema()
