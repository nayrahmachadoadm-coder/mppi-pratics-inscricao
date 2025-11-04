import { supabase } from '@/integrations/supabase/client';
import { AdminInscricaoData, getInscricaoById, getAllInscricoes } from './adminService';
import { getAdminSession } from './adminAuth';
import { getUserSession } from './userAuth';

export type ScoreEntry = {
  cooperacao: number;
  inovacao: number;
  resolutividade: number;
  impacto_social: number;
  alinhamento_ods: number;
  replicabilidade: number;
};

export type AvaliacaoRecord = {
  id: string;
  inscricao_id: string;
  jurado_username: string;
  cooperacao: number;
  inovacao: number;
  resolutividade: number;
  impacto_social: number;
  alinhamento_ods: number;
  replicabilidade: number;
  total: number;
  created_at: string;
};

export const computeTotal = (s: ScoreEntry): number => {
  return (
    (s.cooperacao || 0) +
    (s.inovacao || 0) +
    (s.resolutividade || 0) +
    (s.impacto_social || 0) +
    (s.alinhamento_ods || 0) +
    (s.replicabilidade || 0)
  );
};

export async function submitAvaliacao(inscricaoId: string, scores: ScoreEntry): Promise<{ success: boolean; error?: string; record?: AvaliacaoRecord }> {
  try {
    // Aceitar sessão de admin ou sessão de usuário (jurado)
    const adminSession = getAdminSession();
    const userSession = getUserSession();
    const reviewerUsername = adminSession?.username || userSession?.username;
    if (!reviewerUsername) {
      return { success: false, error: 'Sessão inválida. Faça login como administrador ou jurado.' };
    }

    const total = computeTotal(scores);
    const payload = {
      inscricao_id: inscricaoId,
      jurado_username: reviewerUsername,
      cooperacao: scores.cooperacao,
      inovacao: scores.inovacao,
      resolutividade: scores.resolutividade,
      impacto_social: scores.impacto_social,
      alinhamento_ods: scores.alinhamento_ods,
      replicabilidade: scores.replicabilidade,
      total,
    };

    // Usar any para evitar conflito com tipos gerados
    const { data, error } = await (supabase as any)
      .from('avaliacoes')
      .upsert(payload, { onConflict: 'inscricao_id,jurado_username' })
      .select()
      .single();

    if (error) {
      // Em caso de erro de conexão, retornar sucesso falso com mensagem amigável
      if (String(error.message).includes('Failed to fetch')) {
        return { success: false, error: 'Falha de conexão com o banco. Tente novamente.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, record: data as AvaliacaoRecord };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro inesperado ao salvar avaliação.' };
  }
}

export async function getAvaliacoesByInscricao(inscricaoId: string): Promise<{ success: boolean; error?: string; data?: AvaliacaoRecord[] }>{
  try {
    const { data, error } = await (supabase as any)
      .from('avaliacoes')
      .select('*')
      .eq('inscricao_id', inscricaoId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: (data || []) as AvaliacaoRecord[] };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao buscar avaliações.' };
  }
}

export type CategoriaRankingItem = {
  inscricao: AdminInscricaoData;
  avaliacoes_count: number;
  total_geral: number; // soma dos totais dos jurados
  media_total: number; // média do total por jurado
  media_resolutividade: number;
  media_replicabilidade: number;
};

export async function getRelatorioCategoria(area: string): Promise<{ success: boolean; error?: string; data?: CategoriaRankingItem[] }>{
  try {
    // Buscar inscrições da categoria
    const res = await getAllInscricoes(1, 1000, { area_atuacao: area });
    if (!res.success) {
      return { success: false, error: res.error || 'Erro ao buscar inscrições.' };
    }
    const inscricoes = res.data || [];

    const items: CategoriaRankingItem[] = [];

    for (const insc of inscricoes) {
      const av = await getAvaliacoesByInscricao(insc.id);
      const list = av.success ? (av.data || []) : [];
      const count = list.length;
      const totalGeral = list.reduce((sum, r) => sum + (r.total || 0), 0);
      const mediaTotal = count > 0 ? totalGeral / count : 0;
      const mediaResol = count > 0 ? list.reduce((sum, r) => sum + (r.resolutividade || 0), 0) / count : 0;
      const mediaReplic = count > 0 ? list.reduce((sum, r) => sum + (r.replicabilidade || 0), 0) / count : 0;

      items.push({
        inscricao: insc,
        avaliacoes_count: count,
        total_geral: totalGeral,
        media_total: mediaTotal,
        media_resolutividade: mediaResol,
        media_replicabilidade: mediaReplic,
      });
    }

    // Ordenar aplicando desempate: maior total_geral => maior média resolutividade => maior média replicabilidade
    items.sort((a, b) => {
      if (b.total_geral !== a.total_geral) return b.total_geral - a.total_geral;
      if (b.media_resolutividade !== a.media_resolutividade) return b.media_resolutividade - a.media_resolutividade;
      if (b.media_replicabilidade !== a.media_replicabilidade) return b.media_replicabilidade - a.media_replicabilidade;
      return a.inscricao.titulo_iniciativa.localeCompare(b.inscricao.titulo_iniciativa);
    });

    return { success: true, data: items };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao gerar relatório.' };
  }
}

export function exportRelatorioCsv(items: CategoriaRankingItem[], areaLabel: string): string {
  const headers = [
    'Posicao','Titulo','Proponente','Lotacao','Total Geral','Media Total','Media Resolutividade','Media Replicabilidade','Avaliacoes'];
  const rows = items.map((item, idx) => [
    String(idx + 1),
    sanitize(item.inscricao.titulo_iniciativa),
    sanitize(item.inscricao.nome_completo),
    sanitize(item.inscricao.lotacao),
    String(item.total_geral.toFixed(2)),
    String(item.media_total.toFixed(2)),
    String(item.media_resolutividade.toFixed(2)),
    String(item.media_replicabilidade.toFixed(2)),
    String(item.avaliacoes_count),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return `Relatorio_${areaLabel.replace(/\s+/g,'_')}.csv::${csv}`;
}

function sanitize(v: string) {
  return (v || '').replace(/\n/g,' ').replace(/"/g,'"');
}

export async function getAvaliacoesByJurado(juradoUsername: string): Promise<{ success: boolean; error?: string; data?: AvaliacaoRecord[] }>{
  try {
    const { data, error } = await (supabase as any)
      .from('avaliacoes')
      .select('*')
      .eq('jurado_username', juradoUsername)
      .order('created_at', { ascending: false });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: (data || []) as AvaliacaoRecord[] };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao buscar avaliações do jurado.' };
  }
}