import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljbxctmywdpsfmjvmlmh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYnhjdG15d2Rwc2ZtanZtbG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzY5MTYsImV4cCI6MjA3MzUxMjkxNn0.7A5d6_TvKyRV2Csqf43hkXzvaCd-5b2tKKlAU4ucyaY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  const dummyData = {
    nome_completo: "Teste",
    cargo_funcao: "Teste",
    matricula: "123",
    telefone: "123",
    email_institucional: "teste@teste.com",
    lotacao: "Teste",
    area_atuacao: "Teste",
    titulo_iniciativa: "Teste",
    data_inicio: "2024",
    publico_alvo: "Teste",
    descricao_iniciativa: "Teste",
    objetivos: "Teste",
    metodologia: "Teste",
    principais_resultados: "Teste",
    cooperacao: "Teste",
    inovacao: "Teste",
    resolutividade: "Teste",
    impacto_social: "Teste",
    alinhamento_ods: "Teste",
    replicabilidade: "Teste",
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    declaracao: true,
    cadastro_banco_praticas: false,
    institucionalizado_ato: false,
    area: "Teste",
    ano_inicio_execucao: "2024",
    unidade_setor: "Teste",
    telefone_institucional: "123",
    equipe_envolvida: "Teste",
    resumo_executivo: "Teste",
    objetivos_estrategicos: "Teste",
    etapas_metodologia: "Teste",
    resultados_alcancados: "Teste",
    concorda_termos: true,
    situacao_atual: null,
    problema_necessidade: null,
    local_data: null
  }

  console.log("Inserting...")
  const { data, error } = await supabase.from('inscricoes').insert([dummyData]).select().single()
  console.log("Error:", error)
  console.log("Data:", data)
}

testInsert()
