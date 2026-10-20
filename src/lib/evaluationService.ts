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
  // Edital nº 88/2026: Cada avaliador atribui notas inteiras de 0 a 5 para os 5 critérios oficiais (máx. 25 pontos).
  return (
    (s.cooperacao || 0) +
    (s.inovacao || 0) +
    (s.resolutividade || 0) +
    (s.impacto_social || 0) +
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
  media_total: number; // média do total por jurado (0 a 25)
  media_cooperacao: number;
  media_inovacao: number;
  media_resolutividade: number;
  media_impacto_social: number;
  media_replicabilidade: number;
  total_cooperacao: number;
  total_inovacao: number;
  total_resolutividade: number;
  total_impacto_social: number;
  total_replicabilidade: number;
  nota_tecnica_100: number; // Edital 8.3: (media_total / 25) * 100
  votos_populares: number; // Edital 8.4: quantidade de votos válidos
  nota_popular_100: number; // Edital 8.5: (votos / max_votos) * 100
  pontuacao_final: number; // Edital 8.6 & 8.8: (nota_tecnica * 0.8) + (nota_popular * 0.2) com até 2 casas
  posicao?: number;
  criterio_desempate?: string; // Edital 8.9: Critério aplicado em caso de empate
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
        const sumCoop = list.reduce((sum, r) => sum + (r.cooperacao || 0), 0);
        const sumInovacao = list.reduce((sum, r) => sum + (r.inovacao || 0), 0);
        const sumResol = list.reduce((sum, r) => sum + (r.resolutividade || 0), 0);
        const sumImpacto = list.reduce((sum, r) => sum + (r.impacto_social || 0), 0);
        const sumReplic = list.reduce((sum, r) => sum + (r.replicabilidade || 0), 0);

        // Edital 8.2 & 8.2.3: Média aritmética das notas válidas (ausência de nota não é computada como zero nem integra divisor)
        const mediaTotal = count > 0 ? totalGeral / count : 0;
        const mediaCoop = count > 0 ? sumCoop / count : 0;
        const mediaInovacao = count > 0 ? sumInovacao / count : 0;
        const mediaResol = count > 0 ? sumResol / count : 0;
        const mediaImpacto = count > 0 ? sumImpacto / count : 0;
        const mediaReplic = count > 0 ? sumReplic / count : 0;

        // Edital 8.3: Nota Técnica = (média das notas válidas atribuídas pela Comissão Julgadora / 25) x 100
        const notaTecnica100 = count > 0 ? (mediaTotal / 25.0) * 100.0 : 0;

        // Edital 8.4 e 8.5: Nota Popular proporcional (o mais votado da categoria recebe 100)
        const votosIniciativa = votosCount[insc.id] || 0;
        const notaPopular100 = maxVotos > 0 ? (votosIniciativa / maxVotos) * 100.0 : 0;

        // Edital 8.6 e 8.8: Pontuação Final = (Nota Técnica × 0,80) + (Nota Popular × 0,20), com até 2 casas decimais
        const pontuacaoFinal = Number(((notaTecnica100 * 0.80) + (notaPopular100 * 0.20)).toFixed(2));

        return {
          inscricao: insc,
          avaliacoes_count: count,
          total_geral: totalGeral,
          media_total: mediaTotal,
          media_cooperacao: mediaCoop,
          media_inovacao: mediaInovacao,
          media_resolutividade: mediaResol,
          media_impacto_social: mediaImpacto,
          media_replicabilidade: mediaReplic,
          total_cooperacao: sumCoop,
          total_inovacao: sumInovacao,
          total_resolutividade: sumResol,
          total_impacto_social: sumImpacto,
          total_replicabilidade: sumReplic,
          nota_tecnica_100: Number(notaTecnica100.toFixed(2)),
          votos_populares: votosIniciativa,
          nota_popular_100: Number(notaPopular100.toFixed(2)),
          pontuacao_final: pontuacaoFinal,
        } as CategoriaRankingItem;
      })
    );

    // Edital 8.7 e 8.9: Classificação decrescente com critérios sucessivos de desempate
    // I — maior Nota Técnica atribuída pela Comissão Julgadora;
    // II — maior nota no critério cooperação;
    // III — maior nota no critério resolutividade;
    // IV — maior nota no critério impacto social ou institucional;
    // V — maior nota no critério replicabilidade;
    // VI — maior nota no critério inovação; e
    // VII — persistindo o empate, decisão fundamentada da Comissão Julgadora.
    items.sort((a, b) => {
      if (Math.abs(b.pontuacao_final - a.pontuacao_final) > 0.0001) {
        return b.pontuacao_final - a.pontuacao_final;
      }
      // I — maior Nota Técnica
      if (Math.abs(b.nota_tecnica_100 - a.nota_tecnica_100) > 0.0001) {
        return b.nota_tecnica_100 - a.nota_tecnica_100;
      }
      // II — maior nota no critério cooperação
      if (Math.abs(b.media_cooperacao - a.media_cooperacao) > 0.0001) {
        return b.media_cooperacao - a.media_cooperacao;
      }
      // III — maior nota no critério resolutividade
      if (Math.abs(b.media_resolutividade - a.media_resolutividade) > 0.0001) {
        return b.media_resolutividade - a.media_resolutividade;
      }
      // IV — maior nota no critério impacto social ou institucional
      if (Math.abs(b.media_impacto_social - a.media_impacto_social) > 0.0001) {
        return b.media_impacto_social - a.media_impacto_social;
      }
      // V — maior nota no critério replicabilidade
      if (Math.abs(b.media_replicabilidade - a.media_replicabilidade) > 0.0001) {
        return b.media_replicabilidade - a.media_replicabilidade;
      }
      // VI — maior nota no critério inovação
      if (Math.abs(b.media_inovacao - a.media_inovacao) > 0.0001) {
        return b.media_inovacao - a.media_inovacao;
      }
      // VII — persistindo o empate, alfabético como ordenação determinística
      return (a.inscricao.titulo_iniciativa || '').localeCompare(b.inscricao.titulo_iniciativa || '', 'pt-BR');
    });

    // Atribuir posição e identificar o critério de desempate se houve empate na pontuação final
    items.forEach((item, idx) => {
      item.posicao = idx + 1;
      if (idx > 0) {
        const prev = items[idx - 1];
        if (Math.abs(item.pontuacao_final - prev.pontuacao_final) < 0.001) {
          if (Math.abs(prev.nota_tecnica_100 - item.nota_tecnica_100) >= 0.001) {
            item.criterio_desempate = 'Item 8.9, I (Nota Técnica)';
          } else if (Math.abs(prev.media_cooperacao - item.media_cooperacao) >= 0.001) {
            item.criterio_desempate = 'Item 8.9, II (Cooperação)';
          } else if (Math.abs(prev.media_resolutividade - item.media_resolutividade) >= 0.001) {
            item.criterio_desempate = 'Item 8.9, III (Resolutividade)';
          } else if (Math.abs(prev.media_impacto_social - item.media_impacto_social) >= 0.001) {
            item.criterio_desempate = 'Item 8.9, IV (Impacto Social/Institucional)';
          } else if (Math.abs(prev.media_replicabilidade - item.media_replicabilidade) >= 0.001) {
            item.criterio_desempate = 'Item 8.9, V (Replicabilidade)';
          } else if (Math.abs(prev.media_inovacao - item.media_inovacao) >= 0.001) {
            item.criterio_desempate = 'Item 8.9, VI (Inovação)';
          } else {
            item.criterio_desempate = 'Item 8.9, VII (Decisão Comissão Julgadora)';
          }
        } else {
          item.criterio_desempate = 'Sem empate';
        }
      } else {
        item.criterio_desempate = 'Sem empate';
      }
    });

    return { success: true, data: items };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao gerar relatório.' };
  }
}

export function exportRelatorioCsv(items: CategoriaRankingItem[], areaLabel: string): string {
  const headers = [
    'Posicao',
    'Titulo',
    'Proponente',
    'Lotacao',
    'Avaliacoes Validas',
    'Media Tecnica (0 a 25)',
    'Nota Tecnica 100 (80%)',
    'Votos Populares',
    'Nota Popular 100 (20%)',
    'Pontuacao Final (0 a 100)',
    'Criterio Desempate',
    'Media Cooperacao',
    'Media Resolutividade',
    'Media Impacto Social',
    'Media Replicabilidade',
    'Media Inovacao'
  ];
  const rows = items.map((item, idx) => [
    String(item.posicao || idx + 1),
    sanitize(item.inscricao.titulo_iniciativa),
    sanitize(item.inscricao.nome_completo),
    sanitize(item.inscricao.lotacao),
    String(item.avaliacoes_count),
    String(item.media_total.toFixed(2)),
    String(item.nota_tecnica_100.toFixed(2)),
    String(item.votos_populares),
    String(item.nota_popular_100.toFixed(2)),
    String(item.pontuacao_final.toFixed(2)),
    sanitize(item.criterio_desempate || 'Sem empate'),
    String(item.media_cooperacao.toFixed(2)),
    String(item.media_resolutividade.toFixed(2)),
    String(item.media_impacto_social.toFixed(2)),
    String(item.media_replicabilidade.toFixed(2)),
    String(item.media_inovacao.toFixed(2)),
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
      .select('*, inscricoes!inner(edicao_ano)')
      .eq('jurado_username', juradoUsername)
      .eq('inscricoes.edicao_ano', 2026)
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
      .select('jurado_username,total,inscricoes!inner(area_atuacao,edicao_ano)')
      .eq('inscricoes.area_atuacao', areaKey)
      .eq('inscricoes.edicao_ano', 2026);

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
      .select('*, inscricoes!inner(id,titulo_iniciativa,area_atuacao,nome_completo,lotacao,edicao_ano)')
      .eq('jurado_username', juradoUsername)
      .eq('inscricoes.edicao_ano', 2026)
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
      // Desempate conforme Edital 8.9: Cooperação -> Resolutividade -> Impacto Social -> Replicabilidade -> Inovação
      const ca = a.avaliacao?.cooperacao || 0;
      const cb = b.avaliacao?.cooperacao || 0;
      if (cb !== ca) return cb - ca;
      const ra = a.avaliacao?.resolutividade || 0;
      const rb = b.avaliacao?.resolutividade || 0;
      if (rb !== ra) return rb - ra;
      const ia = a.avaliacao?.impacto_social || 0;
      const ib = b.avaliacao?.impacto_social || 0;
      if (ib !== ia) return ib - ia;
      const pa = a.avaliacao?.replicabilidade || 0;
      const pb = b.avaliacao?.replicabilidade || 0;
      if (pb !== pa) return pb - pa;
      const va = a.avaliacao?.inovacao || 0;
      const vb = b.avaliacao?.inovacao || 0;
      if (vb !== va) return vb - va;
      return (a.inscricao?.titulo_iniciativa || '').localeCompare(b.inscricao?.titulo_iniciativa || '', 'pt-BR');
    });

    return { success: true, data: items };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao buscar suas avaliações.' };
  }
}

export function exportMinhasAvaliacoesCsv(items: MinhasAvaliacaoItem[], areaLabel?: string): string {
  const headers = ['Titulo','Area','Nome','Lotacao','Cooperação','Inovação','Resolutividade','Impacto Social','Replicabilidade','Total','Data'];
  const rows = items.map((it) => [
    sanitize(it.inscricao?.titulo_iniciativa || ''),
    sanitize(it.inscricao?.area_atuacao || ''),
    sanitize(it.inscricao?.nome_completo || ''),
    sanitize(it.inscricao?.lotacao || ''),
    String(it.avaliacao?.cooperacao ?? 0),
    String(it.avaliacao?.inovacao ?? 0),
    String(it.avaliacao?.resolutividade ?? 0),
    String(it.avaliacao?.impacto_social ?? 0),
    String(it.avaliacao?.replicabilidade ?? 0),
    String((it.avaliacao?.total ?? 0).toFixed(2)),
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
export type FinalistaPublicoItem = Pick<CategoriaRankingItem,
  'inscricao' | 'avaliacoes_count' | 'total_geral' | 'media_total' |
  'media_cooperacao' | 'media_inovacao' | 'media_resolutividade' | 'media_impacto_social' | 'media_replicabilidade' |
  'total_cooperacao' | 'total_inovacao' | 'total_resolutividade' | 'total_impacto_social' | 'total_replicabilidade' |
  'nota_tecnica_100' | 'votos_populares' | 'nota_popular_100' | 'pontuacao_final'>;

export async function getTop3ByCategoriaSql(areaKey: string): Promise<{ success: boolean; error?: string; data?: FinalistaPublicoItem[] }>{
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

    const items: FinalistaPublicoItem[] = rows.map((r) => {
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
