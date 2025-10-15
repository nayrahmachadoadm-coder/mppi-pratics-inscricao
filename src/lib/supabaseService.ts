import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para inserções públicas usando variáveis de ambiente
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY as string;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Supabase] Variáveis de ambiente ausentes: VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY');
}
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Interface para os dados da inscrição que serão salvos no Supabase
// Baseada na estrutura atual da tabela (migração 006_fix_table_structure.sql)
export interface InscricaoData {
  // Dados pessoais
  nome_completo: string;
  cargo_funcao: string;
  matricula?: string; // Campo opcional
  telefone: string;
  email_institucional: string;
  lotacao: string;
  
  // Dados da iniciativa
  area_atuacao: string;
  titulo_iniciativa: string;
  data_inicio: string;
  data_fim?: string | null;
  publico_alvo: string;
  situacao_atual?: string; // Campo para situação atual da prática
  data_conclusao?: string | null; // Campo para data de conclusão
  
  // Descrição da prática/projeto
  descricao_iniciativa: string;
  problema_necessidade?: string; // Campo para problema ou necessidade
  objetivos: string;
  metodologia: string;
  principais_resultados: string;
  
  // Critérios de avaliação
  cooperacao: string;
  inovacao: string;
  resolutividade: string;
  impacto_social: string;
  alinhamento_ods: string;
  replicabilidade: string;
  
  // Informações adicionais
  participou_edicoes_anteriores: boolean;
  foi_vencedor_anterior: boolean;
  local_data?: string; // Campo para local e data
  
  // Declaração
  declaracao: boolean;
  observacoes?: string | null;
  
  // Campos opcionais do banco
  id?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para o resultado da operação
export interface SupabaseResult {
  success: boolean;
  data?: any;
  error?: string;
  inscricaoId?: string;
}

/**
 * Converte os dados do formulário para o formato do banco de dados
 */
export function convertFormDataToSupabase(formData: any): InscricaoData {
  console.log('🔄 DEBUG: Convertendo dados do formulário para Supabase:', formData);
  
  // Debug específico para Step 5
  console.log('🔍 DEBUG Step 5 - Dados originais:', {
    participouEdicoesAnteriores: formData.participouEdicoesAnteriores,
    foiVencedorAnterior: formData.foiVencedorAnterior,
    especificarEdicoesAnteriores: formData.especificarEdicoesAnteriores,
    concordaTermos: formData.concordaTermos,
    localData: formData.localData
  });
  
  const convertedData = {
    // Dados pessoais - mapeamento correto para a tabela
    nome_completo: formData.nomeCompleto || '',
    cargo_funcao: formData.cargoFuncao || '',
    matricula: formData.matricula || null, // Campo opcional
    telefone: formData.telefoneInstitucional || '',
    email_institucional: formData.emailInstitucional || '',
    lotacao: formData.unidadeSetor || '',
    
    // Dados da iniciativa - mapeamento correto para a tabela
    area_atuacao: formData.area || '',
    titulo_iniciativa: formData.tituloIniciativa || '',
    data_inicio: formData.anoInicioExecucao || '',
    data_fim: null, // Campo opcional
    publico_alvo: formData.equipeEnvolvida || '',
    situacao_atual: formData.situacaoAtual || null, // Campo para situação atual
    data_conclusao: formData.dataConclusao || null, // Campo para data de conclusão
    
    // Descrição da prática/projeto - mapeamento correto para a tabela
    descricao_iniciativa: formData.resumoExecutivo || '',
    problema_necessidade: formData.problemaNecessidade || null, // Campo para problema ou necessidade
    objetivos: formData.objetivosEstrategicos || '',
    metodologia: formData.etapasMetodologia || '',
    principais_resultados: formData.resultadosAlcancados || '',
    
    // Critérios de avaliação - garantir valores padrão para campos obrigatórios
    cooperacao: formData.cooperacao || 'Não informado',
    inovacao: formData.inovacao || 'Não informado',
    resolutividade: formData.resolutividade || 'Não informado',
    impacto_social: formData.impactoSocial || 'Não informado',
    alinhamento_ods: formData.alinhamentoODS || 'Não informado',
    replicabilidade: formData.replicabilidade || 'Não informado',
    
    // Informações adicionais - mapeamento correto para a tabela
    participou_edicoes_anteriores: formData.participouEdicoesAnteriores === 'sim',
    foi_vencedor_anterior: formData.foiVencedorAnterior === 'sim',
    local_data: formData.localData || null, // Campo para local e data
    
    // Declaração - mapeamento correto para a tabela
    declaracao: Boolean(formData.concordaTermos),
    observacoes: formData.especificarEdicoesAnteriores || null
  };
  
  // Debug específico para Step 5 - dados convertidos
  console.log('🔍 DEBUG Step 5 - Dados convertidos:', {
    participou_edicoes_anteriores: convertedData.participou_edicoes_anteriores,
    foi_vencedor_anterior: convertedData.foi_vencedor_anterior,
    observacoes: convertedData.observacoes,
    declaracao: convertedData.declaracao
  });
  
  return convertedData;
}

/**
 * Salva uma nova inscrição no Supabase
 */
export async function saveInscricao(formData: any): Promise<SupabaseResult> {
  try {
    console.log('💾 Iniciando salvamento no Supabase...', { formData });
    
    // Converter dados do formulário para formato do banco
    const inscricaoData = convertFormDataToSupabase(formData);
    
    console.log('🔄 Dados convertidos para Supabase:', inscricaoData);
    console.log('📊 Estrutura dos dados:', Object.keys(inscricaoData));
    
    // Inserir dados na tabela inscricoes usando o cliente público que bypassa RLS
    console.log('📤 Enviando dados para Supabase...');
    
    const { data, error } = await supabasePublic
      .from('inscricoes')
      .insert([inscricaoData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      return {
        success: false,
        error: `Erro no banco de dados: ${error.message}`,
      };
    }
    
    console.log('✅ Inscrição salva com sucesso no Supabase:', data);
    
    return {
      success: true,
      data,
      inscricaoId: data.id,
    };
    
  } catch (error) {
    console.error('❌ Erro inesperado ao salvar no Supabase:', error);
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Função alternativa para salvar inscrição (compatibilidade)
 */
export async function salvarInscricao(formData: InscricaoData): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('🔄 Iniciando salvamento no Supabase...');
    console.log('📝 Dados do formulário:', formData);
    
    const supabaseData = convertFormDataToSupabase(formData);
    console.log('🔄 Dados convertidos para Supabase:', supabaseData);
    
    // Usar o cliente público que bypassa RLS
    const { data, error } = await supabasePublic
      .from('inscricoes')
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      throw new Error(`Erro no banco de dados: ${error.message}`);
    }

    console.log('✅ Inscrição salva com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro ao salvar inscrição:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao salvar inscrição' 
    };
  }
}

/**
 * Busca uma inscrição pelo ID
 */
export async function getInscricaoById(id: string): Promise<SupabaseResult> {
  try {
    const { data, error } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return {
        success: false,
        error: `Erro ao buscar inscrição: ${error.message}`,
      };
    }
    
    return {
      success: true,
      data,
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Lista todas as inscrições (para administradores)
 */
export async function listInscricoes(): Promise<SupabaseResult> {
  try {
    const { data, error } = await supabase
      .from('inscricoes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return {
        success: false,
        error: `Erro ao listar inscrições: ${error.message}`,
      };
    }
    
    return {
      success: true,
      data,
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Atualiza o status de uma inscrição
 */
export async function updateInscricaoStatus(id: string, status: string, observacoes?: string): Promise<SupabaseResult> {
  try {
    const updateData: any = { status };
    if (observacoes) {
      updateData.observacoes = observacoes;
    }
    
    const { data, error } = await supabase
      .from('inscricoes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: `Erro ao atualizar status: ${error.message}`,
      };
    }
    
    return {
      success: true,
      data,
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}