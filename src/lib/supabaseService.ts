import { supabase } from '@/integrations/supabase/client';

// Interface para os dados da inscrição que serão salvos no Supabase
export interface InscricaoData {
  // Dados do proponente
  nome_completo: string;
  cargo_funcao: string;
  matricula: string;
  unidade_setor: string;
  telefone_institucional: string;
  email_institucional: string;
  equipe_envolvida: string;
  
  // Informações sobre a inscrição
  area: string;
  titulo_iniciativa: string;
  ano_inicio_execucao: string;
  situacao_atual: string;
  data_conclusao?: string;
  
  // Descrição da prática/projeto
  resumo_executivo: string;
  problema_necessidade: string;
  objetivos_estrategicos: string;
  etapas_metodologia: string;
  resultados_alcancados: string;
  
  // Critérios de avaliação
  cooperacao: string;
  inovacao: string;
  resolutividade: string;
  impacto_social: string;
  alinhamento_ods: string;
  replicabilidade: string;
  
  // Informações adicionais
  participou_edicoes_anteriores: string;
  especificar_edicoes_anteriores?: string;
  foi_vencedor_anterior: string;
  
  // Declaração
  concorda_termos: boolean;
  local_data: string;
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
  return {
    // Dados do proponente
    nome_completo: formData.nomeCompleto,
    cargo_funcao: formData.cargoFuncao,
    matricula: formData.matricula,
    unidade_setor: formData.unidadeSetor,
    telefone_institucional: formData.telefoneInstitucional,
    email_institucional: formData.emailInstitucional,
    equipe_envolvida: formData.equipeEnvolvida,
    
    // Informações sobre a inscrição
    area: formData.area,
    titulo_iniciativa: formData.tituloIniciativa,
    ano_inicio_execucao: formData.anoInicioExecucao,
    situacao_atual: formData.situacaoAtual,
    data_conclusao: formData.dataConclusao,
    
    // Descrição da prática/projeto
    resumo_executivo: formData.resumoExecutivo,
    problema_necessidade: formData.problemaNecessidade,
    objetivos_estrategicos: formData.objetivosEstrategicos,
    etapas_metodologia: formData.etapasMetodologia,
    resultados_alcancados: formData.resultadosAlcancados,
    
    // Critérios de avaliação
    cooperacao: formData.cooperacao,
    inovacao: formData.inovacao,
    resolutividade: formData.resolutividade,
    impacto_social: formData.impactoSocial,
    alinhamento_ods: formData.alinhamentoODS,
    replicabilidade: formData.replicabilidade,
    
    // Informações adicionais
    participou_edicoes_anteriores: formData.participouEdicoesAnteriores,
    especificar_edicoes_anteriores: formData.especificarEdicoesAnteriores,
    foi_vencedor_anterior: formData.foiVencedorAnterior,
    
    // Declaração
    concorda_termos: formData.concordaTermos,
    local_data: formData.localData,
  };
}

/**
 * Salva uma nova inscrição no Supabase
 */
export async function saveInscricao(formData: any): Promise<SupabaseResult> {
  try {
    console.log('🔄 Iniciando salvamento no Supabase...');
    
    // Converter dados do formulário para formato do banco
    const inscricaoData = convertFormDataToSupabase(formData);
    
    console.log('📝 Dados convertidos:', {
      nome: inscricaoData.nome_completo,
      email: inscricaoData.email_institucional,
      titulo: inscricaoData.titulo_iniciativa
    });
    
    // Inserir dados na tabela inscricoes
    const { data, error } = await supabase
      .from('inscricoes')
      .insert([inscricaoData])
      .select('id')
      .single();
    
    if (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
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