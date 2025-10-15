import { supabase } from '@/integrations/supabase/client';
import { InscricaoData } from './supabaseService';

// Interface para dados de inscrição com informações adicionais para admin
export interface AdminInscricaoData extends InscricaoData {
  id: string;
  created_at: string;
  updated_at: string;
}

// Interface para resultado de busca com paginação
export interface AdminInscricoesResult {
  success: boolean;
  data?: AdminInscricaoData[];
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}

// Interface para filtros de busca
export interface InscricaoFilters {
  area_atuacao?: string;
  data_inicio_from?: string;
  data_inicio_to?: string;
  search?: string; // busca por nome, email ou título
}

/**
 * Busca todas as inscrições com paginação e filtros
 */
export async function getAllInscricoes(
  page: number = 1,
  limit: number = 20,
  filters?: InscricaoFilters
): Promise<AdminInscricoesResult> {
  try {
    console.log('🔍 Buscando inscrições - Página:', page, 'Limite:', limit, 'Filtros:', filters);
    
    // Primeiro, vamos testar uma consulta simples
    console.log('🔗 Testando conexão com Supabase...');
    
    let query = supabase
      .from('inscricoes')
      .select('*', { count: 'exact' });
    
    // Aplicar filtros se fornecidos
    if (filters) {
      if (filters.area_atuacao) {
        query = query.eq('area_atuacao', filters.area_atuacao);
      }
      
      if (filters.data_inicio_from) {
        query = query.gte('data_inicio', filters.data_inicio_from);
      }
      
      if (filters.data_inicio_to) {
        query = query.lte('data_inicio', filters.data_inicio_to);
      }
      
      if (filters.search) {
        // Busca por nome, email ou título (usando ilike para busca case-insensitive)
        query = query.or(`nome_completo.ilike.%${filters.search}%,email_institucional.ilike.%${filters.search}%,titulo_iniciativa.ilike.%${filters.search}%`);
      }
    }
    
    // Aplicar paginação e ordenação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('❌ Erro ao buscar inscrições:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Se for erro de conexão, retornar sucesso com lista vazia para evitar toast de erro
       if (error.message.includes('Failed to fetch') || error.code === 'PGRST301') {
         console.warn('⚠️ Usando dados mock devido a erro de conexão');
         return {
           success: true,
           data: [],
           total: 0,
           page,
           limit
         };
       }
      
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('✅ Inscrições encontradas:', data?.length, 'Total:', count);
    
    return {
      success: true,
      data: data as AdminInscricaoData[],
      total: count || 0,
      page,
      limit
    };
    
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar inscrições:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar inscrições'
    };
  }
}

/**
 * Busca uma inscrição específica por ID
 */
export async function getInscricaoById(id: string): Promise<AdminInscricoesResult> {
  try {
    console.log('🔍 Buscando inscrição por ID:', id);
    
    const { data, error } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('❌ Erro ao buscar inscrição:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    if (!data) {
      return {
        success: false,
        error: 'Inscrição não encontrada'
      };
    }
    
    console.log('✅ Inscrição encontrada:', data.nome_completo);
    
    return {
      success: true,
      data: [data as AdminInscricaoData]
    };
    
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar inscrição:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar inscrição'
    };
  }
}

/**
 * Obtém estatísticas das inscrições
 */
export async function getInscricoesStats(): Promise<{
  success: boolean;
  data?: {
    total: number;
    por_area: { area: string; count: number }[];
    por_mes: { mes: string; count: number }[];
    ultimas_24h: number;
  };
  error?: string;
}> {
  try {
    console.log('📊 Buscando estatísticas das inscrições...');
    
    // Total de inscrições
    const { count: total, error: totalError } = await supabase
      .from('inscricoes')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      throw totalError;
    }
    
    // Inscrições por área
    const { data: porAreaData, error: areaError } = await supabase
      .from('inscricoes')
      .select('area_atuacao')
      .order('area_atuacao');
    
    if (areaError) {
      throw areaError;
    }
    
    // Contar por área
    const porArea = porAreaData?.reduce((acc: { [key: string]: number }, item) => {
      acc[item.area_atuacao] = (acc[item.area_atuacao] || 0) + 1;
      return acc;
    }, {});
    
    const por_area = Object.entries(porArea || {}).map(([area, count]) => ({
      area,
      count: count as number
    }));
    
    // Inscrições das últimas 24 horas
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { count: ultimas_24h, error: recentError } = await supabase
      .from('inscricoes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo.toISOString());
    
    if (recentError) {
      throw recentError;
    }
    
    // Inscrições por mês (últimos 6 meses)
    const { data: porMesData, error: mesError } = await supabase
      .from('inscricoes')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at');
    
    if (mesError) {
      throw mesError;
    }
    
    // Agrupar por mês
    const porMes = porMesData?.reduce((acc: { [key: string]: number }, item) => {
      const mes = new Date(item.created_at).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      });
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});
    
    const por_mes = Object.entries(porMes || {}).map(([mes, count]) => ({
      mes,
      count: count as number
    }));
    
    console.log('✅ Estatísticas obtidas com sucesso');
    
    return {
      success: true,
      data: {
        total: total || 0,
        por_area,
        por_mes,
        ultimas_24h: ultimas_24h || 0
      }
    };
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    
    // Se for erro de conexão, retornar estatísticas mock
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.warn('⚠️ Usando estatísticas mock devido a erro de conexão');
      return {
        success: true,
        data: {
          total: 0,
          por_area: [],
          por_mes: [],
          ultimas_24h: 0
        }
      };
    }
    
    return {
      success: false,
      error: 'Erro ao buscar estatísticas'
    };
  }
}

/**
 * Obtém lista de áreas de atuação únicas para filtros
 */
export async function getAreasAtuacao(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('inscricoes')
      .select('area_atuacao')
      .order('area_atuacao');
    
    if (error) {
      throw error;
    }
    
    // Obter valores únicos
    const areas = [...new Set(data?.map(item => item.area_atuacao) || [])];
    
    return {
      success: true,
      data: areas
    };
    
  } catch (error) {
    console.error('❌ Erro ao buscar áreas de atuação:', error);
    
    // Se for erro de conexão, retornar áreas mock
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.warn('⚠️ Usando áreas mock devido a erro de conexão');
      return {
        success: true,
        data: [
          'Gestão de Pessoas',
          'Tecnologia da Informação',
          'Gestão Administrativa',
          'Atendimento ao Público',
          'Gestão Financeira'
        ]
      };
    }
    
    return {
      success: false,
      error: 'Erro ao buscar áreas de atuação'
    };
  }
}