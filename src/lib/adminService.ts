import { supabase } from '@/integrations/supabase/client';
import { InscricaoData } from './supabaseService';

// Interface para dados de inscrição com informações adicionais para admin
export interface AdminInscricaoData extends InscricaoData {
  id: string;
  created_at: string;
  updated_at: string;
  parecer_triagem?: string;
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
    
    // Calcular intervalo de paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Se filtro por categoria estiver presente, usar RPC que normaliza áreas legadas
    if (filters?.area_atuacao) {
      console.log('🛰️ Usando RPC rpc_inscricoes_list_by_area para área:', filters.area_atuacao);
      const { data, error } = await (supabase as any).rpc('rpc_inscricoes_list_by_area', {
        area_key: filters.area_atuacao,
        p_offset: from,
        p_limit_rows: limit,
      });

      if (error) {
        console.error('❌ Erro na RPC de listagem por área:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ RPC retornou inscrições:', (data || []).length);
      return {
        success: true,
        data: (data || []) as AdminInscricaoData[],
        total: undefined,
        page,
        limit,
      };
    }

    // Consulta padrão quando não há filtro por categoria
    console.log('🔗 Testando conexão com Supabase...');
    let query = supabase
      .from('inscricoes')
      .select('*', { count: 'exact' })
      .eq('edicao_ano', 2026);
    
    // Aplicar outros filtros
    if (filters) {
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

    // 1) Tentar via RPC SECURITY DEFINER para contornar RLS
    try {
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('rpc_inscricao_by_id', { _id: id });
      if (!rpcError && rpcData) {
        const first = Array.isArray(rpcData) ? rpcData[0] : rpcData;
        if (first) {
          console.log('✅ Inscrição encontrada via RPC:', first.nome_completo);
          return {
            success: true,
            data: [first as AdminInscricaoData]
          };
        }
      } else if (rpcError) {
        console.warn('⚠️ RPC rpc_inscricao_by_id falhou, aplicando fallback ao select:', rpcError.message);
      }
    } catch (e) {
      console.warn('⚠️ Erro inesperado ao executar RPC rpc_inscricao_by_id, seguindo para fallback.', e);
    }
    
    // 2) Fallback: consulta direta (pode ser afetada por RLS)
    // Evitar erro "Cannot coerce the result to a single JSON object" do PostgREST
    // Não usar .single(); pegar o primeiro da lista limitada.
    const { data: listData, error: listError } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('id', id)
      .eq('edicao_ano', 2026)
      .order('created_at', { ascending: false })
      .limit(1);

    if (listError) {
      console.error('❌ Erro ao buscar inscrição:', listError);
      return {
        success: false,
        error: listError.message
      };
    }

    const first = (listData && listData.length > 0) ? listData[0] : null;
    if (!first) {
      return {
        success: false,
        error: 'Inscrição não encontrada'
      };
    }

    console.log('✅ Inscrição encontrada:', first.nome_completo);

    return {
      success: true,
      data: [first as AdminInscricaoData]
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

    // Helper para normalizar valores de área (suporta rótulos legados)
    const normalizeArea = (raw: string): string => {
      if (!raw) return raw;
      const s = raw
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, ''); // remove acentos

      // Mapeamentos diretos das chaves atuais
      const directKeys = [
        'finalistica-pratica',
        'finalistica-projeto',
        'estruturante-pratica',
        'estruturante-projeto',
        'categoria-especial-ia',
      ];
      if (directKeys.includes(s)) return s;

      // Heurísticas para rótulos legados
      if (s.includes('categoria') && s.includes('especial')) return 'categoria-especial-ia';
      if (s.includes('inteligencia') && s.includes('artificial')) return 'categoria-especial-ia';

      const isProjeto = s.includes('projeto');
      const isPratica = s.includes('pratica');
      const isFinalistica = s.includes('finalist'); // cobre "finalistica" e variações sem acento
      const isEstruturante = s.includes('estruturante');

      if (isProjeto && isFinalistica) return 'finalistica-projeto';
      if (isProjeto && isEstruturante) return 'estruturante-projeto';
      if (isPratica && isFinalistica) return 'finalistica-pratica';
      if (isPratica && isEstruturante) return 'estruturante-pratica';

      // Sem correspondência clara: devolver original para não perder informação
      return raw.trim();
    };
    // Primeiro tenta usar RPC com SECURITY DEFINER para contornar RLS em agregações
    let total = 0;
    let por_area: { area: string; count: number }[] = [];
    try {
      const { data: rpcArea, error: rpcAreaError } = await supabase.rpc('rpc_inscricoes_por_area' as any);
      if (rpcAreaError) {
        console.warn('⚠️ Falha na RPC rpc_inscricoes_por_area, voltando ao select padrão:', rpcAreaError.message);
      } else if (Array.isArray(rpcArea) && rpcArea.length > 0) {
        // Normaliza chaves e agrega novamente já normalizado
        const agg: Record<string, number> = {};
        for (const row of rpcArea as any[]) {
          const key = normalizeArea(String(row.area || ''));
          const c = Number(row.count || 0) || 0;
          agg[key] = (agg[key] || 0) + c;
        }
        por_area = Object.entries(agg).map(([area, count]) => ({ area, count }));
        total = por_area.reduce((sum, it) => sum + it.count, 0);
      }
    } catch (e) {
      console.warn('⚠️ Erro inesperado ao executar RPC de estatísticas por área, usando fallback.', e);
    }

    // Fallback: se RPC não retornou nada, usa select (pode ser limitado por RLS)
    if (por_area.length === 0) {
      // Total de inscrições
      const { count: totalFallback, error: totalError } = await supabase
        .from('inscricoes')
        .select('*', { count: 'exact', head: true })
        .eq('edicao_ano', 2026);
      if (totalError) throw totalError;
      total = totalFallback || 0;

      // Inscrições por área
      const { data: porAreaData, error: areaError } = await supabase
        .from('inscricoes')
        .select('area_atuacao')
        .eq('edicao_ano', 2026)
        .order('area_atuacao');
      if (areaError) throw areaError;

      const agg = porAreaData?.reduce((acc: { [key: string]: number }, item) => {
        const key = normalizeArea(String(item.area_atuacao || ''));
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      por_area = Object.entries(agg || {}).map(([area, count]) => ({ area, count: count as number }));
    }
    
    // Inscrições das últimas 24 horas (tenta, mas não falha se RLS bloquear)
    let ultimas_24h = 0;
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const { count, error: recentError } = await supabase
        .from('inscricoes')
        .select('*', { count: 'exact', head: true })
        .eq('edicao_ano', 2026)
        .gte('created_at', oneDayAgo.toISOString());
      if (!recentError) ultimas_24h = count || 0;
    } catch (e) {
      console.warn('⚠️ Falha ao calcular últimas 24h, seguindo com zero.', e);
    }
    
    // Inscrições por mês (últimos 6 meses)
    let porMesData: { created_at: string }[] = [];
    try {
      const { data, error: mesError } = await supabase
        .from('inscricoes')
        .select('created_at')
        .eq('edicao_ano', 2026)
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');
      if (!mesError) porMesData = (data || []) as any[];
    } catch (e) {
      console.warn('⚠️ Falha ao calcular por mês, seguindo com vazio.', e);
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
      .eq('edicao_ano', 2026)
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

/**
 * Atualiza o status e o parecer de uma inscrição (Triagem Administrativa)
 */
export async function updateInscricaoStatus(
  id: string,
  status: string,
  parecer?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('rpc_update_status_inscricao', {
      p_inscricao_id: id,
      p_status: status,
      p_parecer: parecer || null
    });

    if (error) {
      console.error('❌ Erro na RPC update_status_inscricao:', error);
      return { success: false, error: error.message };
    }

    const result = data as any;
    if (!result?.success) {
      return { success: false, error: result?.error || 'Erro ao atualizar status' };
    }

    return { success: true, message: result.message };
  } catch (err: any) {
    console.error('❌ Erro inesperado ao atualizar status:', err);
    return { success: false, error: err?.message || 'Erro inesperado' };
  }
}
