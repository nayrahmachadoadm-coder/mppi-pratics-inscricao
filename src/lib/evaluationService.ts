import { supabase } from '@/integrations/supabase/client';
import { AdminInscricaoData, getAllInscricoes, getInscricaoById as getInscricaoDetalheById } from './adminService';
import { getCurrentProfile } from './auth';
import { getVotosCountByCategoria } from './votoPopularService';

export type ScoreEntry = {
  cooperacao: number;
  inovacao: number;
  resolutividade: number;
  impacto_social: number;
  alinhamento_ods: number | null;
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
  media_impacto_social: number;
  media_inovacao: number;
  total_resolutividade: number; // soma das notas de resolutividade de todos os jurados
  total_replicabilidade: number; // soma das notas de replicabilidade de todos os jurados
  total_impacto_social: number;
  total_inovacao: number;
  nota_tecnica_100: number; // nota técnica convertida para 0-100
  votos_populares: number; // quantidade de votos populares válidos
  nota_popular_100: number; // nota popular proporcional de 0-100
  pontuacao_final: number; // 80% nota técnica + 20% nota popular
};

export async function getRelatorioCategoria(area: string): Promise<{ success: boolean; error?: string; data?: CategoriaRankingItem[] }>{
  try {
    // Buscar inscrições da categoria
    const res = await getAllInscricoes(1, 1000, { area_atuacao: area });
    if (!res.success) {
      return { success: false, error: res.error || 'Erro ao buscar inscrições.' };
    }
    const inscricoes = res.data || [];
    // Obter votos populares da categoria
    const votosCount = await getVotosCountByCategoria(area);
    const votosArray = Object.values(votosCount);
    const maxVotos = votosArray.length > 0 ? Math.max(...votosArray) : 0;

    const items: CategoriaRankingItem[] = await Promise.all(
      inscricoes.map(async (insc) => {
        const av = await getAvaliacoesByInscricao(insc.id);
        const list = av.success ? (av.data || []) : [];
        const count = list.length;
        const totalGeral = list.reduce((sum, r) => sum + (r.total || 0), 0);
        const sumResol = list.reduce((sum, r) => sum + (r.resolutividade || 0), 0);
        const sumReplic = list.reduce((sum, r) => sum + (r.replicabilidade || 0), 0);
        const sumImpacto = list.reduce((sum, r) => sum + (r.impacto_social || 0), 0);
        const sumInovacao = list.reduce((sum, r) => sum + (r.inovacao || 0), 0);
        const sumCoop = list.reduce((sum, r) => sum + (r.cooperacao || 0), 0);
        const mediaTotal = count > 0 ? totalGeral / count : 0;
        const mediaResol = count > 0 ? sumResol / count : 0;
        const mediaReplic = count > 0 ? sumReplic / count : 0;
        const mediaImpacto = count > 0 ? sumImpacto / count : 0;
        const mediaInovacao = count > 0 ? sumInovacao / count : 0;
        const mediaCoop = count > 0 ? sumCoop / count : 0;

        // Converter média para escala 0-100 (a pontuação máxima de 5 critérios é 25 pontos por jurado)
        const maxPontosPossivel = 25;
        const notaTecnica100 = count > 0 ? (mediaTotal / maxPontosPossivel) * 100 : 0;

        // Obter número de votos para esta iniciativa e calcular nota proporcional
        const votosIniciativa = votosCount[insc.id] || 0;
        const notaPopular100 = maxVotos > 0 ? (votosIniciativa / maxVotos) * 100 : 0;

        // Calcular pontuação final
        const pontuacaoFinal = (notaTecnica100 * 0.8) + (notaPopular100 * 0.2);

        return {
          inscricao: insc,
          avaliacoes_count: count,
          total_geral: totalGeral,
          media_total: mediaTotal,
          media_resolutividade: mediaResol,
          media_replicabilidade: mediaReplic,
          media_impacto_social: mediaImpacto,
          media_inovacao: mediaInovacao,
          media_cooperacao: mediaCoop,
          total_resolutividade: sumResol,
          total_replicabilidade: sumReplic,
          total_impacto_social: sumImpacto,
          total_inovacao: sumInovacao,
          total_cooperacao: sumCoop,
          nota_tecnica_100: notaTecnica100,
          votos_populares: votosIniciativa,
          nota_popular_100: notaPopular100,
          pontuacao_final: pontuacaoFinal,
        } as CategoriaRankingItem;
      })
    );

  items.sort((a, b) => {
    // 8.9 Em caso de empate na Pontuação Final, serão aplicados sucessivamente:
    // I — maior Nota Técnica;
    // II — maior nota em cooperação;
    // III — maior nota em impacto social ou institucional;
    // IV — maior nota em replicabilidade;
    // V — maior nota em inovação;
    if (Math.abs(b.pontuacao_final - a.pontuacao_final) > 0.0001) return b.pontuacao_final - a.pontuacao_final;
    if (Math.abs(b.nota_tecnica_100 - a.nota_tecnica_100) > 0.0001) return b.nota_tecnica_100 - a.nota_tecnica_100;
    // (a propriedade media_cooperacao foi adicionada acima ao objeto retornado, mas se o TypeScript reclamar precisaremos adicionar ao interface. 
    // Como a interface CategoriaRankingItem no arquivo pode não ter media_cooperacao, vamos converter o cast implícito se necessário. 
    // Vou usar a.media_cooperacao com segurança acessando via `any` se TS der erro, mas primeiro farei sem tipagem explícita para não complicar).
    if (Math.abs((b as any).media_cooperacao - (a as any).media_cooperacao) > 0.0001) return (b as any).media_cooperacao - (a as any).media_cooperacao;
    if (Math.abs(b.media_impacto_social - a.media_impacto_social) > 0.0001) return b.media_impacto_social - a.media_impacto_social;
    if (Math.abs(b.media_replicabilidade - a.media_replicabilidade) > 0.0001) return b.media_replicabilidade - a.media_replicabilidade;
    if (Math.abs(b.media_inovacao - a.media_inovacao) > 0.0001) return b.media_inovacao - a.media_inovacao;
    return a.inscricao.titulo_iniciativa.localeCompare(b.inscricao.titulo_iniciativa);
  });

    return { success: true, data: items };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao gerar relatório.' };
  }
}

export function exportRelatorioCsv(items: CategoriaRankingItem[], areaLabel: string): string {
  const headers = [
    'Posicao','Titulo','Proponente','Lotacao','Media Jurados','Nota Tecnica (80%)','Votos Populares','Nota Popular (20%)','Pontuacao Final (100)','Media Resolutividade','Avaliacoes'];
  const rows = items.map((item, idx) => [
    String(idx + 1),
    sanitize(item.inscricao.titulo_iniciativa),
    sanitize(item.inscricao.nome_completo),
    sanitize(item.inscricao.lotacao),
    String(item.media_total.toFixed(2)),
    String(item.nota_tecnica_100.toFixed(2)),
    String(item.votos_populares),
    String(item.nota_popular_100.toFixed(2)),
    String(item.pontuacao_final.toFixed(2)),
    String(item.media_resolutividade.toFixed(2)),
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
export async function getTop3ByCategoriaSql(areaKey: string): Promise<{ success: boolean; error?: string; data?: CategoriaRankingItem[] }>{
  try {
    const { data, error } = await (supabase as any).rpc('voto_popular_top3_por_categoria', { area_key: areaKey });
    if (error) {
      return { success: false, error: error.message };
    }
    const rows = (data || []) as Array<{
      categoria: string;
      inscricao_id: string;
      titulo_iniciativa: string;
      nome_completo: string;
      lotacao: string;
      descricao_iniciativa: string;
      problema_necessidade: string;
      metodologia: string;
      principais_resultados: string;
      publico_alvo: string;
      objetivos: string;
      cooperacao: string;
      inovacao: string;
      resolutividade: string;
      impacto_social: string;
      alinhamento_ods: string;
      replicabilidade: string;
      data_inicio: string;
      cargo_funcao: string;
      area_atuacao: string;
      avaliacoes_count: number;
      total_geral: number;
      total_resolutividade: number;
      total_replicabilidade: number;
      posicao: number;
    }>;

    const items: CategoriaRankingItem[] = rows.map((r) => {
      const inscricao: AdminInscricaoData = {
        id: r.inscricao_id,
        nome_completo: r.nome_completo,
        cargo_funcao: r.cargo_funcao,
        telefone: '',
        email_institucional: '',
        lotacao: r.lotacao,
        area_atuacao: r.area_atuacao,
        titulo_iniciativa: r.titulo_iniciativa,
        data_inicio: r.data_inicio,
        publico_alvo: r.publico_alvo,
        descricao_iniciativa: r.descricao_iniciativa,
        problema_necessidade: r.problema_necessidade,
        objetivos: r.objetivos,
        metodologia: r.metodologia,
        principais_resultados: r.principais_resultados,
        cooperacao: r.cooperacao,
        inovacao: r.inovacao,
        resolutividade: r.resolutividade,
        impacto_social: r.impacto_social,
        alinhamento_ods: r.alinhamento_ods,
        replicabilidade: r.replicabilidade,
        participou_edicoes_anteriores: false,
        foi_vencedor_anterior: false,
        declaracao: false,
        created_at: '',
        updated_at: '',
      };
      return {
        inscricao,
        avaliacoes_count: Number(r.avaliacoes_count || 0),
        total_geral: Number(r.total_geral || 0),
        media_total: 0,
        media_resolutividade: 0,
        media_replicabilidade: 0,
        total_resolutividade: Number(r.total_resolutividade || 0),
        total_replicabilidade: Number(r.total_replicabilidade || 0),
      };
    });

    return { success: true, data: items };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao consolidar top3 via SQL' };
  }
}
