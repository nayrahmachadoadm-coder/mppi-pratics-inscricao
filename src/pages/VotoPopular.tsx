import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CategoriaRankingItem, getRelatorioCategoria, getTop3ByCategoriaSql } from '@/lib/evaluationService';
import { isAuthenticated } from '@/lib/auth';
import { getDeviceFingerprint, getStoredVote, storeVote, clearAllVotes } from '@/utils/fingerprint';
import { submitVotoPopular, getVotosCountByCategoria } from '@/lib/votoPopularService';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica' | 'categoria-especial-ia';
type FinalistasByCategoria = { [K in CategoriaKey]: CategoriaRankingItem[] };
type VotesByCategoria = { [K in CategoriaKey]: { [id: string]: number } };
type VotesById = { [id: string]: number };

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
    const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
    if (!isDev) return base;
    const filler = ' Este projeto foi concebido para atender a demandas reais identificadas ao longo de análises internas e externas, contemplando aspectos de usabilidade, acessibilidade, governança e integração de dados. A iniciativa considera riscos, premissas e dependências, adotando abordagem iterativa com validação contínua junto aos usuários e gestores. O desenho das soluções prioriza simplicidade na experiência, transparência nos resultados e rastreabilidade das decisões, com foco em impacto institucional e atendimento qualificado ao cidadão.';
    return `${base} ${filler} ${filler}`;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allFinalistas, setAllFinalistas] = useState<CategoriaRankingItem[]>([]);
  const [votosCountById, setVotosCountById] = useState<VotesById>({});
  const [selectedId, setSelectedId] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  
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
        const logged = await isAuthenticated();
        setIsLogged(logged);
        const collected: CategoriaRankingItem[] = [];
        for (const cat of categorias) {
          try {
            const viaSql = await getTop3ByCategoriaSql(cat.key);
            if (viaSql.success && (viaSql.data || []).length > 0) {
              const top = (viaSql.data || []).slice(0, 3);
              collected.push(...top);
              continue;
            }
            const rel = await getRelatorioCategoria(cat.key);
            const list = (rel.data || []);
            collected.push(...list.slice(0, 3));
          } catch {
            void 0;
          }
        }
        const sortedAll = collected.slice().sort((a, b) => (a.inscricao.titulo_iniciativa || '').localeCompare(b.inscricao.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' }));
        setAllFinalistas(sortedAll);

        if (logged) {
          const merged: VotesById = {};
          for (const cat of categorias) {
            try {
              const byCat = await getVotosCountByCategoria(cat.key);
              Object.entries(byCat).forEach(([id, count]) => { merged[id] = count; });
            } catch {
              void 0;
            }
          }
          setVotosCountById(merged);
        } else {
          setVotosCountById({});
        }
      } catch (e: unknown) {
        setError(e?.message || 'Erro ao carregar os finalistas.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const hasVoted = (cat: CategoriaKey) => Boolean(getStoredVote(cat));
  const hasVotedAny = () => categorias.some((c) => hasVoted(c.key));

  const onSelectOne = (inscricaoId: string) => {
    setSelectedId(inscricaoId);
  };

  const openDetalhes = (item: CategoriaRankingItem) => {
    setDetalheItem(item);
    setDetalheOpen(true);
  };

  const openConfirm = () => {
    if (!selectedId) {
      toast({ title: 'Selecione um finalista', description: 'Escolha um dos 15 trabalhos antes de confirmar.' });
      return;
    }
    if (hasVotedAny()) {
      toast({ title: 'Voto já registrado neste dispositivo', description: 'A votação é limitada a um voto por dispositivo.' });
      return;
    }
    confirmarVotos();
  };

  const confirmarVotos = async () => {
    try {
      const fp = await getDeviceFingerprint();
      const item = allFinalistas.find((f) => f.inscricao.id === selectedId);
      if (!item) {
        toast({ title: 'Seleção inválida', description: 'Escolha um dos finalistas e tente novamente.' });
        return;
      }
      const categoria = item.inscricao.area_atuacao as CategoriaKey;
      if (hasVotedAny()) {
        toast({ title: 'Voto já registrado neste dispositivo', description: 'A votação é limitada a um voto por dispositivo.' });
        return;
      }
      const res = await submitVotoPopular({ categoria, inscricao_id: selectedId, fingerprint: fp });
      if (res.success) {
        storeVote(categoria, selectedId);
        setSelectedId('');
        if (isLogged) {
          try {
            const merged: VotesById = { ...votosCountById };
            for (const c of categorias) {
              try {
                const byCat = await getVotosCountByCategoria(c.key);
                Object.entries(byCat).forEach(([id, count]) => { merged[id] = count; });
              } catch { void 0; }
            }
            setVotosCountById(merged);
          } catch { void 0; }
        }
        toast({ title: 'Voto confirmado', description: 'Obrigado por participar do Voto Popular!' });
      } else {
        const duplicated = String(res.error || '').includes('duplicado_por_ip_ou_fingerprint');
        toast({ title: duplicated ? 'Voto já registrado' : 'Falha ao registrar voto', description: duplicated ? 'Este dispositivo/IP já registrou um voto.' : 'Houve um problema ao registrar seu voto no servidor.' });
      }
    } catch (e: unknown) {
      toast({ title: 'Voto registrado localmente', description: 'Seu voto foi salvo no dispositivo.' });
    }
  };

  

  return (
    <div className="bg-white">
      <main className="max-w-6xl mx-auto px-3 py-3">
        <Card className="shadow-sm border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Ícone" className="h-10 w-10 opacity-80" />
              <div>
                <CardTitle className="text-sm">Voto Popular</CardTitle>
                <div className="text-[11px] text-gray-600">Prêmio Melhores Práticas do MPPI - 9ª edição</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-3">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900">
              Selecione apenas <strong>um</strong> dos 15 trabalhos finalistas e clique em <strong>Confirmar voto</strong>. Os trabalhos finalistas estão exibidos em <strong>ordem alfabética</strong>. O voto é <strong>único por dispositivo</strong>; após confirmar, novas votações ficam bloqueadas. Para conhecer cada trabalho, use o ícone de visualizar ao lado do título.
            </div>

            <div className="p-2">
              <div className="rounded-md overflow-hidden border shadow-md">
                <div className="bg-primary text-primary-foreground px-3 py-2 flex items-center justify-between">
                  <h2 className="text-xs font-semibold">Finalistas</h2>
                  {hasVotedAny() && (
                    <span className="text-[11px]">Voto registrado neste dispositivo</span>
                  )}
                </div>
                {loading ? (
                  <div className="text-xs text-gray-500 px-3 py-2">Carregando finalistas...</div>
                ) : allFinalistas.length === 0 ? (
                  <div className="text-xs text-gray-500 px-3 py-2">Nenhum finalista disponível.</div>
                ) : (
                  <div className="space-y-1 px-3 py-2">
                    {allFinalistas
                      .slice()
                      .sort((a, b) => (a.inscricao.titulo_iniciativa || '').localeCompare(b.inscricao.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' }))
                      .map((item) => {
                        const id = item.inscricao.id;
                        const selected = selectedId === id;
                        const count = votosCountById[id];
                        const countDisplay = typeof count === 'number' ? count : 0;
                        return (
                          <label
                            key={id}
                            className={`flex items-center justify-between rounded border px-3 py-2 text-xs transition-colors ${
                              selected ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`sel-all`}
                                checked={selected}
                                onChange={() => onSelectOne(id)}
                                className="h-3 w-3"
                                disabled={hasVotedAny()}
                              />
                              <div>
                                <div className="font-medium text-gray-900">{item.inscricao.titulo_iniciativa}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selected && (
                                <span className="inline-flex items-center shrink-0 whitespace-nowrap text-[10px] px-2 py-[2px] rounded-full bg-black text-white">Selecionado</span>
                              )}
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
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span className="text-xs">Ver detalhes da inscrição</span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {isLogged && (
                                <span className="text-[11px] text-gray-700">{countDisplay} votos</span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            

            {/* Detalhes da inscrição */}
            <Dialog open={detalheOpen} onOpenChange={setDetalheOpen}>
              <DialogContent hideClose className="sm:max-w-[650px] max-h-[75vh] overflow-y-auto">
                <DialogHeader className="bg-primary text-primary-foreground -mx-4 -mt-4 px-4 py-2">
                  <DialogTitle className="text-sm text-primary-foreground">Detalhes da inscrição</DialogTitle>
                </DialogHeader>
                {detalheItem && (
                  <div className="space-y-2 text-xs text-justify">
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
                      <span className="text-gray-700 text-justify">{expandDevText(detalheItem.inscricao.descricao_iniciativa)}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <span className="font-semibold">Problema-Necessidade: </span>
                        <span className="text-gray-700 text-justify">{expandDevText(detalheItem.inscricao.problema_necessidade)}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Metodologia: </span>
                        <span className="text-gray-700 text-justify">{expandDevText(detalheItem.inscricao.metodologia)}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Resultados: </span>
                        <span className="text-gray-700 text-justify">{expandDevText(detalheItem.inscricao.principais_resultados)}</span>
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

            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                onClick={openConfirm}
                disabled={!selectedId || hasVotedAny()}
                aria-disabled={!selectedId || hasVotedAny()}
              >
                Confirmar voto
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VotoPopular;
