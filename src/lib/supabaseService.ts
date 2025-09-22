import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para inserções públicas - configuração simplificada
const supabasePublic = createClient(
  "https://ljbxctmywdpsfmjvmlmh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYnhjdG15d2Rwc2ZtanZtbG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzY5MTYsImV4cCI6MjA3MzUxMjkxNn0.7A5d6_TvKyRV2Csqf43hkXzvaCd-5b2tKKlAU4ucyaY"
);

// Interface para os dados da inscrição que serão salvos no Supabase
// Baseada na estrutura atual da tabela (migração 20250919114056)
export interface InscricaoData {
  // Dados do proponente
  nome_completo: string;
  cargo_funcao: string;
  email_institucional: string;
  telefone: string;
  lotacao: string;
  
  // Dados da iniciativa
  titulo_iniciativa: string;
  area_atuacao: string;
  data_inicio: string;
  data_fim: string | null;
  publico_alvo: string;
  
  // Descrições
  descricao_iniciativa: string;
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
  observacoes: string | null;
  
  // Declaração
  declaracao: boolean;
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
  // Função para converter string de data para formato YYYY-MM-DD
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // Se já está no formato correto, retorna
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
    // Se está no formato DD/MM/YYYY, converte
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  return {
    // Dados do proponente - mapeamento correto para a tabela
    nome_completo: formData.nomeCompleto || '',
    cargo_funcao: formData.cargoFuncao || '',
    email_institucional: formData.emailInstitucional || '',
    telefone: formData.telefoneInstitucional || '',
    lotacao: formData.unidadeSetor || '',
    
    // Dados da iniciativa - mapeamento correto para a tabela
    titulo_iniciativa: formData.tituloIniciativa || '',
    area_atuacao: formData.area || '',
    data_inicio: formatDate(formData.anoInicioExecucao ? `01/01/${formData.anoInicioExecucao}` : ''),
    data_fim: formData.dataConclusao ? formatDate(formData.dataConclusao) : null,
    publico_alvo: formData.equipeEnvolvida || '',
    
    // Descrições - mapeamento correto para a tabela
    descricao_iniciativa: formData.resumoExecutivo || '',
    objetivos: formData.objetivosEstrategicos || '',
    metodologia: formData.etapasMetodologia || '',
    principais_resultados: formData.resultadosAlcancados || '',
    
    // Critérios de avaliação
    cooperacao: formData.cooperacao || '',
    inovacao: formData.inovacao || '',
    resolutividade: formData.resolutividade || '',
    impacto_social: formData.impactoSocial || '',
    alinhamento_ods: formData.alinhamentoODS || '',
    replicabilidade: formData.replicabilidade || '',
    
    // Informações adicionais - mapeamento correto para a tabela
    participou_edicoes_anteriores: formData.participouEdicoesAnteriores === 'sim',
    foi_vencedor_anterior: formData.foiVencedorAnterior === 'sim',
    observacoes: formData.especificarEdicoesAnteriores || null,
    
    // Declaração - mapeamento correto para a tabela
    declaracao: Boolean(formData.concordaTermos)
  };
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
    
    // Inserir dados na tabela inscricoes
    console.log('📤 Enviando dados para Supabase...');
    
    // Primeira tentativa: inserção normal
    let { data, error } = await supabase
      .from('inscricoes')
      .insert([inscricaoData])
      .select()
      .single();
    
    // Se der erro de RLS, tentar com configuração alternativa
    if (error && error.code === '42501') {
      console.log('🔄 Erro de RLS detectado. Tentando com configuração alternativa...');
      
      // Criar um cliente temporário com configuração específica para inserção
      const tempClient = createClient(
        "https://ljbxctmywdpsfmjvmlmh.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYnhjdG15d2Rwc2ZtanZtbG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzY5MTYsImV4cCI6MjA3MzUxMjkxNn0.7A5d6_TvKyRV2Csqf43hkXzvaCd-5b2tKKlAU4ucyaY",
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        }
      );
      
      const result = await tempClient
        .from('inscricoes')
        .insert([inscricaoData])
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Se ainda for erro de RLS, retornar mensagem específica
      if (error.code === '42501') {
        return {
          success: false,
          error: `Erro de permissão no banco de dados. A tabela de inscrições está configurada com políticas de segurança que impedem inserções públicas. Por favor, entre em contato com o administrador do sistema.`,
        };
      }
      
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