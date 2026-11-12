// Gera um fingerprint simples do dispositivo para limitar múltiplos votos na edição atual (2026)
// Isolado por edição para que votos de edições anteriores (ex.: 2025) não bloqueiem a participação em 2026.
export const EDICAO_VOTO_POPULAR = '2026_v2';

const CATEGORIAS_VOTO = [
  'finalistica-projeto',
  'estruturante-projeto',
  'finalistica-pratica',
  'estruturante-pratica',
];

// Fallback de armazenamento em memória para navegadores que bloqueiam localStorage (ex.: Firefox em navegação restrita/privada)
const memoryStore = new Map<string, string>();

export function safeStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Firefox SecurityError
  }
  return memoryStore.get(key) || null;
}

export function safeStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Firefox SecurityError
  }
  memoryStore.set(key, value);
}

export function safeStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Firefox SecurityError
  }
  memoryStore.delete(key);
}

// Geração de UUID v4 universalmente compatível (Firefox < 95, navegadores corporativos e contextos não seguros)
export function generateSafeUUID(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    void 0;
  }

  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const buf = new Uint8Array(16);
      crypto.getRandomValues(buf);
      buf[6] = (buf[6] & 0x0f) | 0x40; // RFC4122 v4
      buf[8] = (buf[8] & 0x3f) | 0x80;
      const hex = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  } catch {
    void 0;
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Hash SHA-256 universalmente compatível com fallback determinístico caso crypto.subtle não esteja disponível
async function hashStringSha256(str: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      const enc = new TextEncoder();
      const data = enc.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Falha em crypto.subtle (ex.: contexto não seguro ou navegador restrito)
  }

  // Fallback rápido e determinístico de 64 caracteres hexadecimais (compatível com colunas sha256 no banco)
  let h1 = 0x811c9dc5;
  let h2 = 0x55555555;
  let h3 = 0x33333333;
  let h4 = 0x67452301;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = Math.imul(h2 ^ (ch << 3), 0x27d4eb2d);
    h3 = Math.imul(h3 ^ (ch >>> 1), 0x100001b3);
    h4 = Math.imul(h4 + ch, 0x5bd1e995);
  }
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const p3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const p4 = (h4 >>> 0).toString(16).padStart(8, '0');
  const p5 = ((h1 ^ h3) >>> 0).toString(16).padStart(8, '0');
  const p6 = ((h2 ^ h4) >>> 0).toString(16).padStart(8, '0');
  const p7 = ((Math.imul(h1, 31) + h2) >>> 0).toString(16).padStart(8, '0');
  const p8 = ((Math.imul(h3, 17) + h4) >>> 0).toString(16).padStart(8, '0');
  return `${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p8}`;
}

// Remove chaves legadas da edição 2025 e chaves gravadas indevidamente em falhas de envio anteriores
export function purgeLegacy2025Votes() {
  try {
    CATEGORIAS_VOTO.forEach((categoria) => {
      safeStorageRemove(`voto_popular:${categoria}`);
      safeStorageRemove(`voto_popular_2026:${categoria}`);
    });
    safeStorageRemove('device_fp_uuid');
    safeStorageRemove('device_fp_uuid_2026');
  } catch {
    void 0;
  }
}

export async function getDeviceFingerprint(): Promise<string> {
  purgeLegacy2025Votes();

  const uuidStorageKey = `device_fp_uuid_${EDICAO_VOTO_POPULAR}`;
  let uuid = safeStorageGet(uuidStorageKey);
  if (!uuid) {
    uuid = generateSafeUUID();
    safeStorageSet(uuidStorageKey, uuid);
  }

  const screenW = typeof screen !== 'undefined' ? screen.width : '';
  const screenH = typeof screen !== 'undefined' ? screen.height : '';
  const colorD = typeof screen !== 'undefined' ? (screen.colorDepth || '') : '';

  const components = [
    `edicao:${EDICAO_VOTO_POPULAR}`,
    (typeof navigator !== 'undefined' && navigator.userAgent) || '',
    (typeof navigator !== 'undefined' && navigator.language) || '',
    (typeof navigator !== 'undefined' && (navigator.languages || []).join(',')) || '',
    String(new Date().getTimezoneOffset()),
    String(screenW),
    String(screenH),
    String(colorD),
    (typeof navigator !== 'undefined' && navigator.platform) || '',
    uuid || '',
  ].join('|');

  return hashStringSha256(components);
}

export function getLocalVoteKey(categoria: string): string {
  return `voto_popular_${EDICAO_VOTO_POPULAR}:${categoria}`;
}

export function getStoredVote(categoria: string): string | null {
  purgeLegacy2025Votes();
  return safeStorageGet(getLocalVoteKey(categoria));
}

export function storeVote(categoria: string, inscricaoId: string) {
  purgeLegacy2025Votes();
  safeStorageSet(getLocalVoteKey(categoria), inscricaoId);
}

export function removeStoredVote(categoria: string) {
  safeStorageRemove(getLocalVoteKey(categoria));
}

export function clearAllVotes() {
  purgeLegacy2025Votes();
  CATEGORIAS_VOTO.forEach(categoria => {
    safeStorageRemove(getLocalVoteKey(categoria));
  });
  safeStorageRemove(`device_fp_uuid_${EDICAO_VOTO_POPULAR}`);
}
