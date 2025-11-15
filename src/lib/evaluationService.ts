import { supabase } from '@/integrations/supabase/client';
import { AdminInscricaoData, getAllInscricoes } from './adminService';
import { getCurrentProfile } from './auth';

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
    // Obter perfil do usuário autenticado
    const profile = await getCurrentProfile();
    if (!profile?.username) {
      return { success: false, error: 'Sessão inválida. Faça login como administrador ou jurado.' };
    }
    const reviewerUsername = profile.username;

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
  total_resolutividade: number; // soma das notas de resolutividade de todos os jurados
  total_replicabilidade: number; // soma das notas de replicabilidade de todos os jurados
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
    const sumResol = list.reduce((sum, r) => sum + (r.resolutividade || 0), 0);
    const sumReplic = list.reduce((sum, r) => sum + (r.replicabilidade || 0), 0);
    const mediaTotal = count > 0 ? totalGeral / count : 0;
    const mediaResol = count > 0 ? sumResol / count : 0;
    const mediaReplic = count > 0 ? sumReplic / count : 0;

      items.push({
        inscricao: insc,
        avaliacoes_count: count,
        total_geral: totalGeral,
        media_total: mediaTotal,
        media_resolutividade: mediaResol,
        media_replicabilidade: mediaReplic,
        total_resolutividade: sumResol,
        total_replicabilidade: sumReplic,
      });
  }

  // Ordenar aplicando desempate: maior total_geral => maior total resolutividade => maior total replicabilidade
  items.sort((a, b) => {
    if (b.total_geral !== a.total_geral) return b.total_geral - a.total_geral;
    if (b.total_resolutividade !== a.total_resolutividade) return b.total_resolutividade - a.total_resolutividade;
    if (b.total_replicabilidade !== a.total_replicabilidade) return b.total_replicabilidade - a.total_replicabilidade;
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

export type JurorAverageItem = {
  jurado_username: string;
  full_name?: string;
  seat_label?: string;
  count: number;
  media_total: number;
};

// Consolida médias por jurado em uma categoria (área_atuacao)
export async function getJurorAveragesByCategoria(areaKey: string): Promise<{ success: boolean; error?: string; data?: JurorAverageItem[] }>{
  try {
    const { data, error } = await (supabase as any)
      .from('avaliacoes')
      .select('jurado_username,total,inscricoes!inner(area_atuacao)')
      .eq('inscricoes.area_atuacao', areaKey);

    if (error) {
      return { success: false, error: error.message };
    }

    const rows = (data || []) as Array<{ jurado_username: string; total: number; inscricoes: { area_atuacao: string } }>;
    const acc: Record<string, { sum: number; count: number }> = {};
    for (const r of rows) {
      const u = r.jurado_username;
      if (!acc[u]) acc[u] = { sum: 0, count: 0 };
      acc[u].sum += (r.total || 0);
      acc[u].count += 1;
    }

    const usernames = Object.keys(acc);
    let profilesMap: Record<string, { full_name?: string; seat_label?: string }> = {};
    if (usernames.length > 0) {
      const { data: profilesData } = await (supabase as any)
        .from('profiles')
        .select('username, full_name, seat_label')
        .in('username', usernames);
      for (const p of (profilesData || [])) {
        profilesMap[p.username] = { full_name: p.full_name, seat_label: p.seat_label };
      }
    }

    const items: JurorAverageItem[] = usernames.map(u => ({
      jurado_username: u,
      full_name: profilesMap[u]?.full_name,
      seat_label: profilesMap[u]?.seat_label,
      count: acc[u].count,
      media_total: acc[u].count > 0 ? acc[u].sum / acc[u].count : 0,
    }));

    items.sort((a, b) => b.media_total - a.media_total);
    return { success: true, data: items };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao consolidar médias por jurado.' };
  }
}

export function exportJurorAveragesCsv(items: JurorAverageItem[], areaLabel: string): string {
  const headers = ['Posicao','Jurado','Nome','Vaga','Avaliacoes','Media Total'];
  const rows = items.map((item, idx) => [
    String(idx + 1),
    sanitize(item.jurado_username || ''),
    sanitize(item.full_name || ''),
    sanitize(item.seat_label || ''),
    String(item.count),
    String(item.media_total.toFixed(2)),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return `Relatorio_Jurados_${areaLabel.replace(/\s+/g,'_')}.csv::${csv}`;
}

export type MinhasAvaliacaoItem = {
  inscricao: AdminInscricaoData;
  avaliacao: AvaliacaoRecord;
};

export async function getMinhasAvaliacoes(juradoUsername: string, areaKey?: string): Promise<{ success: boolean; error?: string; data?: MinhasAvaliacaoItem[] }>{
  try {
    let query = (supabase as any)
      .from('avaliacoes')
      .select('*, inscricoes!inner(id,titulo_iniciativa,area_atuacao,nome_completo,lotacao)')
      .eq('jurado_username', juradoUsername)
      .order('created_at', { ascending: false });

    if (areaKey) {
      query = query.eq('inscricoes.area_atuacao', areaKey);
    }

    const { data, error } = await query;
    if (error) {
      return { success: false, error: error.message };
    }
    const rows = (data || []) as any[];
    const items: MinhasAvaliacaoItem[] = rows.map((r) => ({
      inscricao: r.inscricoes as AdminInscricaoData,
      avaliacao: {
        id: r.id,
        inscricao_id: r.inscricao_id,
        jurado_username: r.jurado_username,
        cooperacao: r.cooperacao,
        inovacao: r.inovacao,
        resolutividade: r.resolutividade,
        impacto_social: r.impacto_social,
        alinhamento_ods: r.alinhamento_ods,
        replicabilidade: r.replicabilidade,
        total: r.total,
        created_at: r.created_at,
      } as AvaliacaoRecord,
    }));

    items.sort((a, b) => {
      const ta = a.avaliacao?.total || 0;
      const tb = b.avaliacao?.total || 0;
      if (tb !== ta) return tb - ta;
      const ra = a.avaliacao?.resolutividade || 0;
      const rb = b.avaliacao?.resolutividade || 0;
      if (rb !== ra) return rb - ra;
      const pa = a.avaliacao?.replicabilidade || 0;
      const pb = b.avaliacao?.replicabilidade || 0;
      if (pb !== pa) return pb - pa;
      return (a.inscricao?.titulo_iniciativa || '').localeCompare(b.inscricao?.titulo_iniciativa || '');
    });

    return { success: true, data: items };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao buscar suas avaliações.' };
  }
}

export function exportMinhasAvaliacoesCsv(items: MinhasAvaliacaoItem[], areaLabel?: string): string {
  const headers = ['Titulo','Area','Nome','Lotacao','Total','Resolutividade','Replicabilidade','Data'];
  const rows = items.map((it) => [
    sanitize(it.inscricao?.titulo_iniciativa || ''),
    sanitize(it.inscricao?.area_atuacao || ''),
    sanitize(it.inscricao?.nome_completo || ''),
    sanitize(it.inscricao?.lotacao || ''),
    String((it.avaliacao?.total ?? 0).toFixed(2)),
    String(it.avaliacao?.resolutividade ?? 0),
    String(it.avaliacao?.replicabilidade ?? 0),
    sanitize((it.avaliacao?.created_at || '').slice(0, 19).replace('T',' ')),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const base = areaLabel ? `Minhas_Avaliacoes_${areaLabel.replace(/\s+/g,'_')}` : 'Minhas_Avaliacoes';
  return `${base}.csv::${csv}`;
}
export async function isVotacaoFinalizada(juradoUsername: string, areaKey: string): Promise<boolean> {
  try {
    const { data, error } = await (supabase as any)
      .from('votacao_finalizada')
      .select('id')
      .eq('jurado_username', juradoUsername)
      .eq('categoria', areaKey)
      .limit(1);
    if (error) return false;
    return Array.isArray(data) && data.length > 0;
  } catch { return false; }
}

export async function finalizeVotacao(juradoUsername: string, areaKey: string): Promise<{ success: boolean; error?: string }>{
  try {
    const { error } = await (supabase as any)
      .from('votacao_finalizada')
      .insert({ jurado_username: juradoUsername, categoria: areaKey });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao finalizar votação' };
  }
}
