// Gera um fingerprint simples do dispositivo para limitar múltiplos votos na edição atual (2026)
// Isolado por edição para que votos de edições anteriores (ex.: 2025) não bloqueiem a participação em 2026.
export const EDICAO_VOTO_POPULAR = '2026_v2';

const CATEGORIAS_VOTO = [
  'finalistica-projeto',
  'estruturante-projeto',
  'finalistica-pratica',
  'estruturante-pratica',
];

// Remove chaves legadas da edição 2025 e chaves gravadas indevidamente em falhas de envio anteriores
export function purgeLegacy2025Votes() {
  try {
    CATEGORIAS_VOTO.forEach((categoria) => {
      localStorage.removeItem(`voto_popular:${categoria}`);
      localStorage.removeItem(`voto_popular_2026:${categoria}`);
    });
    localStorage.removeItem('device_fp_uuid');
    localStorage.removeItem('device_fp_uuid_2026');
  } catch {
    void 0;
  }
}

export async function getDeviceFingerprint(): Promise<string> {
  purgeLegacy2025Votes();

  const uuidStorageKey = `device_fp_uuid_${EDICAO_VOTO_POPULAR}`;
  const persisted = localStorage.getItem(uuidStorageKey);
  let uuid = persisted;
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(uuidStorageKey, uuid);
  }

  const components = [
    `edicao:${EDICAO_VOTO_POPULAR}`,
    navigator.userAgent || '',
    navigator.language || '',
    (navigator.languages || []).join(',') || '',
    String(new Date().getTimezoneOffset()),
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth || ''),
    navigator.platform || '',
    uuid || '',
  ].join('|');

  const enc = new TextEncoder();
  const data = enc.encode(components);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function getLocalVoteKey(categoria: string): string {
  return `voto_popular_${EDICAO_VOTO_POPULAR}:${categoria}`;
}

export function getStoredVote(categoria: string): string | null {
  purgeLegacy2025Votes();
  return localStorage.getItem(getLocalVoteKey(categoria));
}

export function storeVote(categoria: string, inscricaoId: string) {
  purgeLegacy2025Votes();
  localStorage.setItem(getLocalVoteKey(categoria), inscricaoId);
}

export function removeStoredVote(categoria: string) {
  try {
    localStorage.removeItem(getLocalVoteKey(categoria));
  } catch {
    void 0;
  }
}

export function clearAllVotes() {
  purgeLegacy2025Votes();
  CATEGORIAS_VOTO.forEach(categoria => {
    localStorage.removeItem(getLocalVoteKey(categoria));
  });
  localStorage.removeItem(`device_fp_uuid_${EDICAO_VOTO_POPULAR}`);
}
