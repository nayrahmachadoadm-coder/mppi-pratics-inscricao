import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CategoriaRankingItem, getRelatorioCategoria, getTop3ByCategoriaSql } from '@/lib/evaluationService';
import { Medal, Crown } from 'lucide-react';
import { useCallback } from 'react';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica';

const categorias: { key: CategoriaKey; lines: [string, string] }[] = [
  { key: 'finalistica-projeto', lines: ['Projetos', 'Finalísticos'] },
  { key: 'estruturante-projeto', lines: ['Projetos', 'Estruturantes'] },
  { key: 'finalistica-pratica', lines: ['Práticas', 'Finalísticas'] },
  { key: 'estruturante-pratica', lines: ['Práticas', 'Estruturantes'] },
];

const labelPorArea: Record<CategoriaKey, string> = {
  'finalistica-projeto': 'Projetos Finalísticos',
  'estruturante-projeto': 'Projetos Estruturantes',
  'finalistica-pratica': 'Práticas Finalísticas',
  'estruturante-pratica': 'Práticas Estruturantes',
};

const AdminPremiacao = () => {
  const [selectedArea, setSelectedArea] = useState<CategoriaKey | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [finalistas, setFinalistas] = useState<CategoriaRankingItem[]>([]);
  const [ranking, setRanking] = useState<CategoriaRankingItem[]>([]);
  const [showResultado, setShowResultado] = useState<boolean>(false);
  const winnerId = showResultado && ranking.length > 0 ? ranking[0]?.inscricao?.id : undefined;

  const sortedFinalistasAlpha = useMemo(() => {
    return [...finalistas].sort((a, b) => (a.inscricao.titulo_iniciativa || '').localeCompare(b.inscricao.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' }));
  }, [finalistas]);

  const triggerConfetti = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const setSize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    setSize();
    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    const colors = ['#e11d48', '#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#14b8a6'];
    const shapes = ['rect', 'circle', 'triangle'];
    const particles: Array<any> = [];
    const burst = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 4;
        const size = 2 + Math.random() * 6;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          g: 0.08 + Math.random() * 0.12,
          size,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.1,
          life: 120 + Math.random() * 60,
        });
      }
    };
    burst(window.innerWidth * 0.25, window.innerHeight * 0.2, 80);
    burst(window.innerWidth * 0.5, window.innerHeight * 0.15, 120);
    burst(window.innerWidth * 0.75, window.innerHeight * 0.2, 80);
    const streamCount = 140;
    for (let i = 0; i < streamCount; i++) {
      const x = Math.random() * window.innerWidth;
      particles.push({
        x,
        y: -10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 2 + Math.random() * 3,
        g: 0.05 + Math.random() * 0.08,
        size: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.08,
        life: 160 + Math.random() * 100,
      });
    }
    let frame = 0;
    let running = true;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.life -= 1;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life <= 0 || particles[i].y > window.innerHeight + 20) particles.splice(i, 1);
      }
      frame++;
      if (frame < 240 || particles.length > 0) {
        requestAnimationFrame(draw);
      } else {
        running = false;
        canvas.remove();
        window.removeEventListener('resize', setSize);
      }
    };
    window.addEventListener('resize', setSize);
    requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const loadCategoria = async () => {
      if (!selectedArea) return;
      try {
        setLoading(true);
        setError('');
        setShowResultado(false);
        // Agora utilizamos sempre o getRelatorioCategoria que possui a nova lógica de pontuação (80/20)
        const rel = await getRelatorioCategoria(selectedArea);
        const list = (rel.data || []);
        const top3 = list.slice(0, 3);
        setFinalistas(top3);
        // Ranking completo pela regra do regulamento (ordenado pelo serviço)
        const rel2 = await getRelatorioCategoria(selectedArea);
        setRanking(rel2.success ? (rel2.data || []) : []);
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar a categoria.');
        setFinalistas([]);
        setRanking([]);
      } finally {
        setLoading(false);
      }
    };
    loadCategoria();
  }, [selectedArea]);

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="min-h-[72vh]">
          <main className="w-full pt-5">
            {error && (
              <div className="mb-4">
                <Alert variant="destructive" className="rounded-none border-red-300">
                  <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                </Alert>
              </div>
            )}

            <Card className="shadow-xs border border-black/20 rounded-none overflow-hidden bg-white">
              <CardHeader className="bg-[#760A25] text-white py-4 px-5 rounded-none border-b border-black/20">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo-mppi.png"
                    alt="MPPI"
                    className="h-8 w-auto object-contain bg-white/10 p-1 border border-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/favicon.ico';
                    }}
                  />
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold tracking-wide text-white">
                      Cerimônia de Premiação — 10ª Edição
                    </CardTitle>
                    <p className="text-xs text-white/80">
                      Prêmio Melhores Práticas do Ministério Público do Estado do Piauí (Edital nº 88/2026)
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-5 px-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {categorias.map(({ key, lines }) => (
                    <Button
                      key={key}
                      variant="default"
                      className={`group relative flex flex-col items-center justify-center h-28 px-4 py-3 text-center transition-all duration-150 border-2 rounded-none ${
                        selectedArea === key
                          ? 'bg-[#760A25] text-white border-[#760A25] shadow-xs'
                          : 'bg-white text-slate-900 border-black/15 hover:border-[#760A25] hover:bg-[#760A25]/5 hover:text-[#760A25] shadow-2xs'
                      }`}
                      disabled={loading}
                      onClick={() => setSelectedArea(key)}
                    >
                      <span
                        className={`font-bold leading-snug whitespace-normal break-words text-base sm:text-lg ${
                          selectedArea === key ? 'text-white' : 'text-slate-900 group-hover:text-[#760A25]'
                        }`}
                      >
                        {lines[0]}
                        <br />
                        {lines[1]}
                      </span>
                      <span
                        className={`mt-2 text-xs font-semibold uppercase tracking-wider ${
                          selectedArea === key ? 'text-amber-300' : 'text-slate-500 group-hover:text-[#760A25]'
                        }`}
                      >
                        {selectedArea === key ? '● Categoria Selecionada' : 'Selecionar'}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedArea && (
              <section className="mt-5">
                <Card className="shadow-xs border border-black/20 rounded-none bg-white">
                  <CardHeader className="border-b border-black/15 bg-slate-50 rounded-none py-3.5 px-5 flex flex-row items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                      Finalistas — {labelPorArea[selectedArea]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 pb-6 px-5">
                    {loading ? (
                      <div className="py-10 text-center text-base font-medium text-slate-600">Carregando...</div>
                    ) : finalistas.length === 0 ? (
                      <div className="py-10 text-center text-base font-medium text-slate-600">
                        Nenhum finalista disponível.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        {sortedFinalistasAlpha.map((it) => {
                          const isWinner = winnerId === it.inscricao.id;
                          return (
                            <div
                              key={it.inscricao.id}
                              className={`relative rounded-none border p-4 sm:p-5 transition-all duration-200 ${
                                isWinner
                                  ? 'bg-gradient-to-br from-amber-50 via-yellow-50/60 to-amber-100/40 border-2 border-amber-500 shadow-sm'
                                  : 'bg-white border-black/15 shadow-2xs hover:border-black/30'
                              }`}
                            >
                              {isWinner && (
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white border-2 border-amber-500 rounded-none px-3 py-1 shadow-md pointer-events-none z-10 flex items-center gap-1.5">
                                  <Crown className="w-5 h-5 text-amber-600 fill-amber-400" />
                                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">1º Lugar Oficial</span>
                                </div>
                              )}
                              <div className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                                {it.inscricao.titulo_iniciativa}
                              </div>
                              <div className="mt-2.5 text-sm sm:text-base text-slate-800">
                                <span className="font-bold text-slate-900">Proponente:</span>{' '}
                                {it.inscricao.nome_completo}
                              </div>
                              <div className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                                <span className="font-bold text-slate-700">Lotação:</span> {it.inscricao.lotacao}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <Button
                        size="default"
                        variant={showResultado ? 'outline' : 'default'}
                        className={`text-sm sm:text-base font-bold px-6 py-2.5 h-auto rounded-none shadow-2xs ${
                          showResultado
                            ? 'border-black/30 text-slate-800 hover:bg-slate-100'
                            : 'bg-[#760A25] hover:bg-[#5c081d] text-white border border-[#760A25]'
                        }`}
                        disabled={loading || ranking.length === 0}
                        onClick={() => {
                          setShowResultado((v) => {
                            const next = !v;
                            if (!v && ranking.length > 0) triggerConfetti();
                            return next;
                          });
                        }}
                      >
                        {showResultado ? 'Ocultar Resultado' : 'Exibir Resultado Oficial'}
                      </Button>
                    </div>

                    {showResultado && ranking.length > 0 && (
                      <div className="mt-5 rounded-none border border-black/20 overflow-hidden shadow-xs bg-white">
                        <div className="grid grid-cols-12 items-center bg-[#760A25] px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white border-b border-black/20">
                          <div className="col-span-1">Pos.</div>
                          <div className="col-span-5">Iniciativa / Proponente</div>
                          <div className="col-span-2 text-right">Nota Téc. (80%)</div>
                          <div className="col-span-2 text-right">Nota Pop. (20%)</div>
                          <div className="col-span-2 text-right">Pontuação Final</div>
                        </div>
                        <div className="divide-y divide-black/10">
                          {ranking.map((it, idx) => {
                            const isTop1 = idx === 0;
                            const isTop3 = idx < 3;
                            return (
                              <div
                                key={it.inscricao.id}
                                className={`grid grid-cols-12 items-center px-4 py-3.5 transition-colors ${
                                  isTop1
                                    ? 'bg-amber-50/90 border-l-4 border-l-amber-600'
                                    : isTop3
                                    ? 'bg-slate-50/60 border-l-4 border-l-[#760A25]/70'
                                    : 'bg-white hover:bg-slate-50/60'
                                }`}
                              >
                                <div className="col-span-1 flex items-center gap-2">
                                  <span
                                    className={`text-base sm:text-lg font-extrabold tabular-nums ${
                                      isTop1
                                        ? 'text-amber-800'
                                        : isTop3
                                        ? 'text-slate-900'
                                        : 'text-slate-600'
                                    }`}
                                  >
                                    {String(idx + 1).padStart(2, '0')}º
                                  </span>
                                  {idx === 0 ? (
                                    <Medal className="w-5 h-5 text-amber-600 shrink-0" />
                                  ) : idx === 1 ? (
                                    <Medal className="w-5 h-5 text-slate-400 shrink-0" />
                                  ) : idx === 2 ? (
                                    <Medal className="w-5 h-5 text-amber-700 shrink-0" />
                                  ) : null}
                                </div>

                                <div className="col-span-5 pr-3">
                                  <div
                                    className={`text-sm sm:text-base font-bold leading-snug ${
                                      isTop3 ? 'text-slate-950' : 'text-slate-800'
                                    }`}
                                  >
                                    {it.inscricao.titulo_iniciativa}
                                  </div>
                                  <div className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
                                    {it.inscricao.nome_completo}{' '}
                                    <span className="text-slate-300">•</span>{' '}
                                    <span className="text-slate-600">{it.inscricao.lotacao}</span>
                                  </div>
                                  {it.criterio_desempate && it.criterio_desempate !== 'Sem empate' && (
                                    <span className="inline-block mt-1.5 text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-none font-semibold border border-amber-300">
                                      Desempate: {it.criterio_desempate}
                                    </span>
                                  )}
                                </div>

                                <div className="col-span-2 text-right font-mono tabular-nums">
                                  <div className="text-base sm:text-lg font-extrabold text-slate-900">
                                    {(it.nota_tecnica_100 * 0.8).toFixed(2)} pts
                                  </div>
                                  <div className="mt-0.5 text-xs font-medium text-slate-500">
                                    ({it.nota_tecnica_100.toFixed(2)}%)
                                  </div>
                                </div>

                                <div className="col-span-2 text-right font-mono tabular-nums">
                                  <div className="text-base sm:text-lg font-extrabold text-slate-900">
                                    {(it.nota_popular_100 * 0.2).toFixed(2)} pts
                                  </div>
                                  <div className="mt-0.5 text-xs font-medium text-slate-500">
                                    ({it.nota_popular_100.toFixed(2)}%)
                                  </div>
                                </div>

                                <div className="col-span-2 text-right font-mono tabular-nums">
                                  <span
                                    className={`inline-block text-lg sm:text-2xl font-extrabold px-3 py-1 rounded-none border ${
                                      isTop1
                                        ? 'bg-[#760A25] text-white border-[#760A25] shadow-2xs'
                                        : isTop3
                                        ? 'bg-[#760A25]/10 text-[#760A25] border-[#760A25]/30'
                                        : 'bg-slate-100 text-slate-800 border-slate-200'
                                    }`}
                                  >
                                    {it.pontuacao_final.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPremiacao;

