import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CategoriaRankingItem, getRelatorioCategoria, getTop3ByCategoriaSql } from '@/lib/evaluationService';
import { Medal } from 'lucide-react';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica' | 'categoria-especial-ia';

const categorias: { key: CategoriaKey; lines: [string, string] }[] = [
  { key: 'finalistica-projeto', lines: ['Projetos', 'Finalísticos'] },
  { key: 'estruturante-projeto', lines: ['Projetos', 'Estruturantes'] },
  { key: 'finalistica-pratica', lines: ['Práticas', 'Finalísticas'] },
  { key: 'estruturante-pratica', lines: ['Práticas', 'Estruturantes'] },
  { key: 'categoria-especial-ia', lines: ['Categoria Especial', '(Inteligência Artificial)'] },
];

const labelPorArea: Record<CategoriaKey, string> = {
  'finalistica-projeto': 'Projetos Finalísticos',
  'estruturante-projeto': 'Projetos Estruturantes',
  'finalistica-pratica': 'Práticas Finalísticas',
  'estruturante-pratica': 'Práticas Estruturantes',
  'categoria-especial-ia': 'Categoria Especial (Inteligência Artificial)',
};

const AdminPremiacao = () => {
  const [selectedArea, setSelectedArea] = useState<CategoriaKey | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [finalistas, setFinalistas] = useState<CategoriaRankingItem[]>([]);
  const [ranking, setRanking] = useState<CategoriaRankingItem[]>([]);
  const [showResultado, setShowResultado] = useState<boolean>(false);

  const sortedFinalistasAlpha = useMemo(() => {
    return [...finalistas].sort((a, b) => (a.inscricao.titulo_iniciativa || '').localeCompare(b.inscricao.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' }));
  }, [finalistas]);

  useEffect(() => {
    const loadCategoria = async () => {
      if (!selectedArea) return;
      try {
        setLoading(true);
        setError('');
        setShowResultado(false);
        // Buscar top3 via SQL; fallback para relatório completo
        const viaSql = await getTop3ByCategoriaSql(selectedArea);
        let top3: CategoriaRankingItem[] = [];
        if (viaSql.success && (viaSql.data || []).length > 0) {
          top3 = (viaSql.data || []).slice(0, 3);
        } else {
          const rel = await getRelatorioCategoria(selectedArea);
          const list = (rel.data || []);
          top3 = list.slice(0, 3);
        }
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
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="min-h-[72vh]">
          <main className="w-full pt-4">
            {error && (
              <div className="mb-4">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            <Card className="shadow-lg border rounded-xl">
              <CardHeader className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] text-[hsl(var(--primary-foreground))] rounded-t-xl pb-2">
                <CardTitle className="text-sm">Premiação</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {categorias.map(({ key, lines }) => (
                    <Button
                      key={key}
                      variant="default"
                      className={`group relative flex flex-col items-center justify-center h-24 px-3 py-2 text-center shadow-md transition-all duration-200 border rounded-xl ${selectedArea === key ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]' : 'bg-white text-gray-900 border-gray-200 hover:shadow-xl hover:bg-primary hover:text-white'}`}
                      disabled={loading}
                      onClick={() => setSelectedArea(key)}
                    >
                      <span className={`font-semibold leading-tight whitespace-normal break-words text-sm ${selectedArea === key ? 'text-white' : 'text-gray-900 group-hover:text-white'}`}>
                        {lines[0]}<br />{lines[1]}
                      </span>
                      <span className={`mt-1 text-xs ${selectedArea === key ? 'text-primary-foreground' : 'text-gray-500 group-hover:text-primary-foreground'}`}>
                        Selecionar
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedArea && (
              <section className="mt-4">
                <Card className="shadow-lg border rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-sm">Finalistas — {labelPorArea[selectedArea]}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    {loading ? (
                      <div className="py-8 text-center text-gray-600">Carregando...</div>
                    ) : finalistas.length === 0 ? (
                      <div className="py-8 text-center text-gray-600">Nenhum finalista disponível.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {sortedFinalistasAlpha.map((it) => (
                          <div key={it.inscricao.id} className="rounded-md border bg-red-50 border-red-200 p-3 shadow-sm">
                            <div className="text-xs font-semibold text-gray-900">{it.inscricao.titulo_iniciativa}</div>
                            <div className="mt-1 text-[11px] text-gray-700"><span className="font-medium">Proponente:</span> {it.inscricao.nome_completo}</div>
                            <div className="mt-1 text-[11px] text-gray-600"><span className="font-medium">Lotação:</span> {it.inscricao.lotacao}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px]"
                        disabled={loading || ranking.length === 0}
                        onClick={() => setShowResultado((v) => !v)}
                      >
                        {showResultado ? 'Ocultar resultado' : 'Exibir o resultado'}
                      </Button>
                    </div>

                    {showResultado && ranking.length > 0 && (
                      <div className="mt-3 rounded border overflow-hidden">
                        <div className="grid grid-cols-12 bg-gray-100 px-3 py-2 text-[11px] font-semibold">
                          <div className="col-span-1">Pos</div>
                          <div className="col-span-1"></div>
                          <div className="col-span-7">Trabalho</div>
                          <div className="col-span-2 text-right">Total</div>
                          <div className="col-span-1 text-right">Média</div>
                        </div>
                        <div className="divide-y">
                          {ranking.map((it, idx) => (
                            <div key={it.inscricao.id} className="grid grid-cols-12 items-center px-3 py-2 text-xs">
                              <div className="col-span-1">{String(idx + 1).padStart(2, '0')}</div>
                              <div className="col-span-1 flex justify-center">
                                {idx === 0 ? <Medal className="w-4 h-4 text-yellow-500" /> : idx === 1 ? <Medal className="w-4 h-4 text-gray-400" /> : idx === 2 ? <Medal className="w-4 h-4 text-amber-700" /> : null}
                              </div>
                              <div className="col-span-7 text-gray-900">{it.inscricao.titulo_iniciativa}</div>
                              <div className="col-span-2 text-right text-gray-700">{it.total_geral.toFixed(2)}</div>
                              <div className="col-span-1 text-right text-gray-700">{(it.media_total / 6).toFixed(2)}</div>
                            </div>
                          ))}
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
