// Gera um fingerprint simples do dispositivo para limitar múltiplos votos
// OBS: não é infalível, mas ajuda a reduzir votos repetidos do mesmo dispositivo.
export async function getDeviceFingerprint(): Promise<string> {
  // Tenta recuperar um UUID persistente
  const persisted = localStorage.getItem('device_fp_uuid');
  let uuid = persisted;
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem('device_fp_uuid', uuid);
  }

  const components = [
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
  return `voto_popular:${categoria}`;
}

export function getStoredVote(categoria: string): string | null {
  return localStorage.getItem(getLocalVoteKey(categoria));
}

export function storeVote(categoria: string, inscricaoId: string) {
  localStorage.setItem(getLocalVoteKey(categoria), inscricaoId);
}

export function clearAllVotes() {
  const categorias = ['finalistica-projeto', 'estruturante-projeto', 'finalistica-pratica', 'estruturante-pratica', 'categoria-especial-ia'];
  categorias.forEach(categoria => {
    localStorage.removeItem(getLocalVoteKey(categoria));
  });
  // Também remove o UUID do dispositivo para permitir novo fingerprint
  localStorage.removeItem('device_fp_uuid');
}