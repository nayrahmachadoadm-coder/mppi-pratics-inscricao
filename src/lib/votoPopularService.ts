import { supabase as client } from '@/integrations/supabase/client';

export type SubmitVotoPayload = {
  categoria: string;
  inscricao_id: string;
  fingerprint: string;
  email?: string;
};

export async function submitVotoPopular(payload: SubmitVotoPayload): Promise<{ success: boolean; error?: string }>{
  if (!client) {
    console.warn('[VotoPopular] Supabase não configurado. Voto será apenas local.');
    return { success: true };
  }
  try {
    const { error } = await client
      .from('votos_populares')
      .insert({
        categoria: payload.categoria,
        inscricao_id: payload.inscricao_id,
        fingerprint: payload.fingerprint,
        email: payload.email || null,
      });
    if (error) {
      console.error('[VotoPopular] Erro ao registrar voto:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.error('[VotoPopular] Erro inesperado:', e);
    return { success: false, error: e?.message || 'Erro inesperado' };
  }
}

export async function getVotosCountByCategoria(categoria: string): Promise<Record<string, number>> {
  if (!client) return {};
  try {
    const { data, error } = await (client as any).rpc('votos_count', { categoria });
    if (error || !data) return {};
    const counts: Record<string, number> = {};
    for (const row of data as any[]) {
      const id = row.inscricao_id as string;
      const votos = Number(row.votos) || 0;
      counts[id] = votos;
    }
    return counts;
  } catch {
    return {};
  }
}
