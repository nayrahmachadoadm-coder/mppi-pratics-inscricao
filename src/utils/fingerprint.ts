// Gera um fingerprint avançado de hardware do dispositivo para limitar múltiplos votos na edição atual (2026).
// Projetado especificamente para impedir múltiplos votos através de navegação anônima / guias privadas,
// combinando assinaturas determinísticas de Canvas 2D, WebGL GPU, AudioContext DSP, resolução de tela
// e arquitetura de hardware, que permanecem 100% idênticas mesmo em abas anônimas do mesmo computador/celular.
export const EDICAO_VOTO_POPULAR = '2026_v2';

const CATEGORIAS_VOTO = [
  'finalistica-projeto',
  'estruturante-projeto',
  'finalistica-pratica',
  'estruturante-pratica',
];

// Fallback de armazenamento em memória para navegadores com restrições extremas de storage
const memoryStore = new Map<string, string>();

// Funções auxiliares para leitura/escrita em cookies para sincronização multi-storage
function getCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, days = 365): void {
  try {
    if (typeof document === 'undefined') return;
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
  } catch {
    void 0;
  }
}

function removeCookie(name: string): void {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  } catch {
    void 0;
  }
}

export function safeStorageGet(key: string): string | null {
  // 1. Tenta localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val) return val;
    }
  } catch {
    // Modo privado/restrito
  }

  // 2. Tenta sessionStorage
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const val = window.sessionStorage.getItem(key);
      if (val) return val;
    }
  } catch {
    // Modo privado/restrito
  }

  // 3. Tenta Cookie persistente
  const cookieVal = getCookie(key);
  if (cookieVal) return cookieVal;

  // 4. Fallback em memória
  return memoryStore.get(key) || null;
}

export function safeStorageSet(key: string, value: string): void {
  // Sincroniza em todos os meios de persistência disponíveis
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    void 0;
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    void 0;
  }

  setCookie(key, value);
  memoryStore.set(key, value);
}

export function safeStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    void 0;
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    void 0;
  }

  removeCookie(key);
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

// Assinatura de renderização 2D Canvas (determinado por antialiasing do SO, fontes instaladas, subpixel rendering e GPU)
function getCanvasFingerprint(): string {
  try {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Fundo com gradiente suave
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#7A1C1C');
    grad.addColorStop(0.5, '#C5A880');
    grad.addColorStop(1, '#1A365D');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Formas com transparência e blending
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(35, 30, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Renderização tipográfica complexa e emoji (sensível ao motor de rasterização DirectWrite / FreeType / CoreText)
    ctx.textBaseline = 'alphabetic';
    ctx.font = "14px 'Arial', 'Times New Roman', sans-serif";
    ctx.fillStyle = '#069';
    ctx.fillText('MPPI 10ª Edição 🏆⚖️ <canvas>', 12, 28);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.75)';
    ctx.font = '16px monospace';
    ctx.fillText('VotoPopular2026', 120, 48);

    return canvas.toDataURL();
  } catch {
    return '';
  }
}

// Assinatura do hardware gráfico WebGL (GPU física e limites de renderização do driver de vídeo)
function getWebGLFingerprint(): string {
  try {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return '';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);

    return `${vendor}~${renderer}~${maxTextureSize}~${maxVertexAttribs}~${maxVaryingVectors}`;
  } catch {
    return '';
  }
}

// Assinatura de processamento DSP de áudio (sensível ao chip de som e cálculos de ponto flutuante da CPU)
async function getAudioFingerprint(): Promise<string> {
  try {
    const AudioCtx = (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    if (!AudioCtx) return '';

    const context = new AudioCtx(1, 44100, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.reduction.setValueAtTime(-20, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const audioBuffer = await context.startRendering();
    const channelData = audioBuffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < 5000; i++) {
      sum += Math.abs(channelData[i]);
    }
    return sum.toString();
  } catch {
    return '';
  }
}

// Detecta se o navegador está operando em modo anônimo / navegação privada
export async function isIncognitoMode(): Promise<boolean> {
  try {
    // 1. Verificação de cota de armazenamento no Chromium (Chrome / Edge / Opera / Brave)
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      // Em modo anônimo no Chromium, a cota de disco é limitada (< 1.2 GB), enquanto no normal é tipicamente > 10 GB
      if (quota > 0 && quota < 1200000000) {
        return true;
      }
    }

    // 2. Firefox: teste de escrita em IndexedDB
    if (typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent)) {
      try {
        const dbResult = await new Promise<boolean>((resolve) => {
          const req = indexedDB.open('__mppi_test_priv');
          req.onsuccess = () => resolve(false);
          req.onerror = () => resolve(true);
        });
        if (dbResult) return true;
      } catch {
        return true;
      }
    }

    // 3. Safari WebKit
    if (typeof window !== 'undefined' && (window as any).safari !== undefined) {
      try {
        (window as any).openDatabase(null, null, null, null);
      } catch {
        return true;
      }
    }
  } catch {
    void 0;
  }
  return false;
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

  // Fallback rápido e determinístico de 64 caracteres hexadecimais
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

// Remove chaves legadas da edição 2025 e chaves temporárias
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

/**
 * Gera a assinatura digital exclusiva do dispositivo.
 * Esta assinatura baseia-se exclusivamente em características físicas do hardware e sistema
 * (Canvas 2D, WebGL GPU, AudioContext DSP, tela, proporção de pixels, CPU cores, fuso horário),
 * garantindo que mesmo se o usuário abrir a navegação anônima ou limpar cookies, a mesma máquina física
 * produzirá EXATAMENTE o mesmo hash, impedindo múltiplos votos pela trava no banco de dados.
 */
export async function getDeviceFingerprint(): Promise<string> {
  purgeLegacy2025Votes();

  const [canvasFp, webglFp, audioFp] = await Promise.all([
    Promise.resolve(getCanvasFingerprint()),
    Promise.resolve(getWebGLFingerprint()),
    getAudioFingerprint(),
  ]);

  const screenW = typeof screen !== 'undefined' ? screen.width : '';
  const screenH = typeof screen !== 'undefined' ? screen.height : '';
  const availW = typeof screen !== 'undefined' ? screen.availWidth : '';
  const availH = typeof screen !== 'undefined' ? screen.availHeight : '';
  const colorD = typeof screen !== 'undefined' ? (screen.colorDepth || '') : '';
  const pixelD = typeof screen !== 'undefined' ? (screen.pixelDepth || '') : '';
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || '') : '';
  const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || '') : '';
  const memory = typeof navigator !== 'undefined' ? ((navigator as any).deviceMemory || '') : '';
  const touchPoints = typeof navigator !== 'undefined' ? (navigator.maxTouchPoints || 0) : 0;
  const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
  const tzOffset = String(new Date().getTimezoneOffset());
  const platform = (typeof navigator !== 'undefined' && navigator.platform) || '';
  const lang = (typeof navigator !== 'undefined' && navigator.language) || '';

  // Elementos puramente determinísticos de hardware e ambiente (idênticos em modo normal e anônimo)
  const hardwareComponents = [
    `edicao:${EDICAO_VOTO_POPULAR}`,
    canvasFp,
    webglFp,
    audioFp,
    String(screenW),
    String(screenH),
    String(availW),
    String(availH),
    String(colorD),
    String(pixelD),
    String(dpr),
    String(cores),
    String(memory),
    String(touchPoints),
    tz,
    tzOffset,
    platform,
    lang,
  ].join('##');

  return hashStringSha256(hardwareComponents);
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
