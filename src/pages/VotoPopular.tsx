import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CategoriaRankingItem, getRelatorioCategoria, getTop3ByCategoriaSql } from '@/lib/evaluationService';
import { getDeviceFingerprint, getStoredVote, storeVote, clearAllVotes } from '@/utils/fingerprint';
import { submitVotoPopular, getVotosCountByCategoria } from '@/lib/votoPopularService';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica' | 'categoria-especial-ia';

const categorias: { key: CategoriaKey; label: string }[] = [
  { key: 'finalistica-projeto', label: 'Projetos Finalísticos' },
  { key: 'estruturante-projeto', label: 'Projetos Estruturantes' },
  { key: 'finalistica-pratica', label: 'Práticas Finalísticas' },
  { key: 'estruturante-pratica', label: 'Práticas Estruturantes' },
  { key: 'categoria-especial-ia', label: 'Categoria Especial (IA)' },
];

const SITE_KEY = undefined;

const VotoPopular: React.FC = () => {
  const { toast } = useToast();
  const expandDevText = (text?: string) => {
    const base = text || '';
    if (!(import.meta as any).env?.DEV) return base;
    const filler = ' Este projeto foi concebido para atender a demandas reais identificadas ao longo de análises internas e externas, contemplando aspectos de usabilidade, acessibilidade, governança e integração de dados. A iniciativa considera riscos, premissas e dependências, adotando abordagem iterativa com validação contínua junto aos usuários e gestores. O desenho das soluções prioriza simplicidade na experiência, transparência nos resultados e rastreabilidade das decisões, com foco em impacto institucional e atendimento qualificado ao cidadão.';
    return `${base} ${filler} ${filler}`;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalistas, setFinalistas] = useState<Record<CategoriaKey, CategoriaRankingItem[]>>({
    'finalistica-projeto': [],
    'estruturante-projeto': [],
    'finalistica-pratica': [],
    'estruturante-pratica': [],
    'categoria-especial-ia': [],
  });
  const [votosCount, setVotosCount] = useState<Record<CategoriaKey, Record<string, number>>>({
    'finalistica-projeto': {},
    'estruturante-projeto': {},
    'finalistica-pratica': {},
    'estruturante-pratica': {},
    'categoria-especial-ia': {},
  });
  const [selecionados, setSelecionados] = useState<Record<CategoriaKey, string>>({
    'finalistica-projeto': '',
    'estruturante-projeto': '',
    'finalistica-pratica': '',
    'estruturante-pratica': '',
    'categoria-especial-ia': '',
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [detalheItem, setDetalheItem] = useState<CategoriaRankingItem | null>(null);

  const formatAreaAtuacao = (area: string) => {
    const areaMap: { [key: string]: string } = {
      'finalistica-pratica': 'Prática Finalística',
      'finalistica-projeto': 'Projeto Finalístico',
      'estruturante-pratica': 'Prática Estruturante',
      'estruturante-projeto': 'Projeto Estruturante',
      'categoria-especial-ia': 'Categoria Especial – Inteligência Artificial'
    };
    return areaMap[area] || area;
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const results: Record<CategoriaKey, CategoriaRankingItem[]> = {
          'finalistica-projeto': [],
          'estruturante-projeto': [],
          'finalistica-pratica': [],
          'estruturante-pratica': [],
          'categoria-especial-ia': [],
        };
        await Promise.all(
          categorias.map(async (cat) => {
            try {
              const viaSql = await getTop3ByCategoriaSql(cat.key);
              if (viaSql.success && (viaSql.data || []).length > 0) {
                const top = (viaSql.data || []).slice(0, 3).sort((a, b) => (a.inscricao.titulo_iniciativa || '').localeCompare(b.inscricao.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' }));
                results[cat.key] = top;
                return;
              }
              const rel = await getRelatorioCategoria(cat.key);
              const list = (rel.data || []);
              const sorted = list.slice().sort((a, b) => {
                if (b.total_geral !== a.total_geral) return b.total_geral - a.total_geral;
                if (b.total_resolutividade !== a.total_resolutividade) return b.total_resolutividade - a.total_resolutividade;
                if (b.total_replicabilidade !== a.total_replicabilidade) return b.total_replicabilidade - a.total_replicabilidade;
                return a.inscricao.titulo_iniciativa.localeCompare(b.inscricao.titulo_iniciativa);
              });
              results[cat.key] = sorted.slice(0, 3);
            } catch {
              results[cat.key] = [];
            }
          })
        );
        setFinalistas(results);
        // Contagem de votos via RPC agregada (se disponível)
        const counts: Record<CategoriaKey, Record<string, number>> = {
          'finalistica-projeto': {},
          'estruturante-projeto': {},
          'finalistica-pratica': {},
          'estruturante-pratica': {},
          'categoria-especial-ia': {},
        };
        for (const cat of categorias) {
          try {
            counts[cat.key] = await getVotosCountByCategoria(cat.key);
          } catch {
            counts[cat.key] = {};
          }
        }
        setVotosCount(counts);
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar os finalistas.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const hasVoted = (cat: CategoriaKey) => Boolean(getStoredVote(cat));

  const onSelect = (cat: CategoriaKey, inscricaoId: string) => {
    setSelecionados((prev) => ({ ...prev, [cat]: inscricaoId }));
  };

  const openDetalhes = (item: CategoriaRankingItem) => {
    setDetalheItem(item);
    setDetalheOpen(true);
  };

  const openConfirm = () => {
    const faltantes = categorias.filter((c) => !selecionados[c.key]);
    if (faltantes.length > 0) {
      toast({ title: 'Selecione um finalista por categoria', description: 'Escolha para todas as categorias antes de confirmar.' });
      return;
    }
    const jaVotou = categorias.some((c) => hasVoted(c.key));
    if (jaVotou) {
      toast({ title: 'Voto já registrado neste dispositivo', description: 'A votação é limitada a uma participação por dispositivo.' });
      return;
    }
    confirmarVotos();
  };

  const confirmarVotos = async () => {
    try {
      const fp = await getDeviceFingerprint();
      let submetidos = 0;
      for (const cat of categorias) {
        const id = selecionados[cat.key];
        if (!id || hasVoted(cat.key)) continue;
        const res = await submitVotoPopular({ categoria: cat.key, inscricao_id: id, fingerprint: fp });
        storeVote(cat.key, id);
        submetidos += 1;
        if (!res.success) {
          toast({ title: 'Voto registrado localmente', description: `Categoria: ${cat.label}. Houve um problema ao registrar no servidor.` });
        }
      }
      if (submetidos === 0) {
        toast({ title: 'Voto já registrado neste dispositivo', description: 'A votação é limitada a uma participação por dispositivo.' });
        return;
      }
      try {
        const updatedCounts: Record<CategoriaKey, Record<string, number>> = {
          'finalistica-projeto': {},
          'estruturante-projeto': {},
          'finalistica-pratica': {},
          'estruturante-pratica': {},
          'categoria-especial-ia': {},
        };
        for (const c of categorias) {
          try {
            updatedCounts[c.key] = await getVotosCountByCategoria(c.key);
          } catch {
            updatedCounts[c.key] = votosCount[c.key];
          }
        }
        setVotosCount(updatedCounts);
      } catch {}
      toast({ title: 'Votos confirmados', description: 'Obrigado por participar do Voto Popular!' });
    } catch (e: any) {
      toast({ title: 'Votos registrados', description: 'Seus votos foram salvos no dispositivo.' });
    } finally {
      
    }
  };

  

  return (
    <div className="bg-white">
      <main className="max-w-6xl mx-auto px-3 py-3">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="text-sm">Voto Popular</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-3">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
              <div className="text-[11px] text-blue-900">
                <div className="font-semibold">Selecione um finalista em todas as categorias para confirmar.</div>
                <div>• Você escolhe um finalista por categoria e confirma tudo de uma vez. Votos são limitados por dispositivo.</div>
              </div>
              <Button
                size="sm"
                onClick={openConfirm}
                disabled={!categorias.every((c) => !!selecionados[c.key]) || categorias.some((c) => hasVoted(c.key))}
                aria-disabled={!categorias.every((c) => !!selecionados[c.key]) || categorias.some((c) => hasVoted(c.key))}
              >
                Confirmar votos
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categorias.map((cat) => (
                <section key={cat.key} className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xs font-semibold text-gray-800">{cat.label}</h2>
                    {hasVoted(cat.key) && (
                      <span className="text-[11px] text-green-700">Voto registrado neste dispositivo</span>
                    )}
                  </div>
                  {loading ? (
                    <div className="text-xs text-gray-500">Carregando finalistas...</div>
                  ) : finalistas[cat.key].length === 0 ? (
                    <div className="text-xs text-gray-500">Nenhum finalista disponível.</div>
                  ) : (
                    <div className="space-y-1">
                      {finalistas[cat.key]
                        .slice()
                        .sort((a, b) => (a.inscricao.titulo_iniciativa || '').localeCompare(b.inscricao.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' }))
                        .map((item) => {
                        const id = item.inscricao.id;
                        const selected = selecionados[cat.key] === id;
                        const count = votosCount[cat.key]?.[id];
                        const countDisplay = typeof count === 'number' ? count : 0;
                        return (
                          <label
                            key={id}
                            className={`flex items-center justify-between rounded border px-3 py-2 text-xs transition-colors ${
                              selected
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`sel-${cat.key}`}
                                checked={selected}
                                onChange={() => onSelect(cat.key, id)}
                                className="h-3 w-3"
                              />
                              <div>
                                <div className="font-medium text-gray-900">{item.inscricao.titulo_iniciativa}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selected && (
                                <span className="text-[10px] px-2 py-[2px] rounded-full bg-black text-white">Selecionado</span>
                              )}
                              <span className="text-[11px] text-gray-700">{countDisplay} votos</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        openDetalhes(item);
                                      }}
                                      aria-label="Ver detalhes da inscrição"
                                    >
                                      <FileText className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span className="text-xs">Ver detalhes da inscrição</span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}
            </div>

            

            

            {/* Detalhes da inscrição */}
            <Dialog open={detalheOpen} onOpenChange={setDetalheOpen}>
              <DialogContent hideClose className="sm:max-w-[650px] max-h-[75vh] overflow-y-auto">
                <DialogHeader className="bg-primary text-primary-foreground -mx-4 -mt-4 px-4 py-2">
                  <DialogTitle className="text-sm text-primary-foreground">Detalhes da inscrição</DialogTitle>
                </DialogHeader>
                {detalheItem && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold">Título: </span>
                      <span>{detalheItem.inscricao.titulo_iniciativa}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-semibold">Proponente: </span>
                        <span>{detalheItem.inscricao.nome_completo}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Lotação: </span>
                        <span>{detalheItem.inscricao.lotacao}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Área: </span>
                        <span>{formatAreaAtuacao(detalheItem.inscricao.area_atuacao)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold">Resumo: </span>
                      <span className="text-gray-700">{expandDevText(detalheItem.inscricao.descricao_iniciativa)}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <span className="font-semibold">Problema-Necessidade: </span>
                        <span className="text-gray-700">{expandDevText(detalheItem.inscricao.problema_necessidade)}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Metodologia: </span>
                        <span className="text-gray-700">{expandDevText(detalheItem.inscricao.metodologia)}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Resultados: </span>
                        <span className="text-gray-700">{expandDevText(detalheItem.inscricao.principais_resultados)}</span>
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="secondary" size="sm" onClick={() => setDetalheOpen(false)}>Voltar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            
            
            {/* Botão de reset para testes - apenas em desenvolvimento */}
            {import.meta.env.DEV && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-[10px] text-yellow-800 mb-1">
                  <strong>Modo Desenvolvimento:</strong> Use o botão abaixo para resetar votos e testar novamente.
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearAllVotes();
                    window.location.reload();
                  }}
                  className="text-[10px]"
                >
                  🔄 Resetar votos para teste
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VotoPopular;
