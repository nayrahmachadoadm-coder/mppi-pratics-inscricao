import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { CategoriaRankingItem, getRelatorioCategoria, getTop3ByCategoriaSql } from '@/lib/evaluationService';
import { isAuthenticated, hasRole } from '@/lib/auth';
import { getDeviceFingerprint, getStoredVote, storeVote } from '@/utils/fingerprint';
import { submitVotoPopular, getVotosCountByCategoria, getVotoPopularCandidatos, VotoPopularCandidato } from '@/lib/votoPopularService';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica';
type FinalistasByCategoria = { [K in CategoriaKey]: CategoriaRankingItem[] };
type VotesByCategoria = { [K in CategoriaKey]: { [id: string]: number } };
type VotesById = { [id: string]: number };

const categorias: { key: CategoriaKey; label: string }[] = [
  { key: 'finalistica-projeto', label: 'Projetos Finalísticos' },
  { key: 'estruturante-projeto', label: 'Projetos Estruturantes' },
  { key: 'finalistica-pratica', label: 'Práticas Finalísticas' },
  { key: 'estruturante-pratica', label: 'Práticas Estruturantes' },
];

const SITE_KEY = undefined;
const VOTACAO_ENCERRADA = false;

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
  const [allFinalistas, setAllFinalistas] = useState<(CategoriaRankingItem | { inscricao: any })[]>([]);
  const [votosCountById, setVotosCountById] = useState<VotesById>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [detalheItem, setDetalheItem] = useState<any | null>(null);

  const formatAreaAtuacao = (area: string) => {
    const areaMap: { [key: string]: string } = {
      'finalistica-pratica': 'Prática Finalística',
      'finalistica-projeto': 'Projeto Finalístico',
      'estruturante-pratica': 'Prática Estruturante',
      'estruturante-projeto': 'Projeto Estruturante'
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
        if (logged) {
          const adminCheck = await hasRole('admin');
          setIsAdmin(adminCheck);
        }
        const collected: any[] = [];
        
        let sessionSeed = sessionStorage.getItem('voto_seed');
        if (!sessionSeed) {
          sessionSeed = String(Math.random());
          sessionStorage.setItem('voto_seed', sessionSeed);
        }

        if (logged) {
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
            } catch { void 0; }
          }
          const sortedAll = collected.slice().sort((a, b) => (a.inscricao.titulo_iniciativa || '').localeCompare(b.inscricao.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' }));
          setAllFinalistas(sortedAll);

          const merged: VotesById = {};
          for (const cat of categorias) {
            try {
              const byCat = await getVotosCountByCategoria(cat.key);
              Object.entries(byCat).forEach(([id, count]) => { merged[id] = count; });
            } catch { void 0; }
          }
          setVotosCountById(merged);
        } else {
          for (const cat of categorias) {
            try {
              const res = await getVotoPopularCandidatos(cat.key, parseFloat(sessionSeed));
              if (res.success && res.data) {
                // Map to match the expected structure
                const mapped = res.data.map(c => ({
                  inscricao: {
                    id: c.inscricao_id,
                    titulo_iniciativa: c.titulo_iniciativa,
                    nome_completo: c.nome_completo,
                    lotacao: c.lotacao,
                    area_atuacao: c.area_atuacao,
                    descricao_iniciativa: c.descricao_iniciativa,
                    problema_necessidade: c.problema_necessidade,
                    metodologia: c.metodologia,
                    principais_resultados: c.principais_resultados,
                  }
                }));
                collected.push(...mapped);
              }
            } catch { void 0; }
          }
          setAllFinalistas(collected); // keep the obfuscated order!
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

  const onSelectOne = (categoria: string, inscricaoId: string) => {
    setSelectedIds(prev => ({ ...prev, [categoria]: inscricaoId }));
  };

  const openDetalhes = (item: any) => {
    setDetalheItem(item);
    setDetalheOpen(true);
  };

  const openConfirm = () => {
    if (VOTACAO_ENCERRADA) {
      toast({ title: 'Votação encerrada', description: 'A votação popular foi encerrada.' });
      return;
    }
    const categoriesToSubmit = Object.keys(selectedIds).filter(cat => !hasVoted(cat as CategoriaKey));
    if (categoriesToSubmit.length === 0) {
      toast({ title: 'Nenhuma seleção pendente', description: 'Você precisa selecionar pelo menos um trabalho de uma categoria que ainda não votou.' });
      return;
    }
    confirmarVotos();
  };

  const confirmarVotos = async () => {
    try {
      const fp = await getDeviceFingerprint();
      const categoriesToSubmit = Object.keys(selectedIds).filter(cat => !hasVoted(cat as CategoriaKey));
      
      let successCount = 0;
      let errorCount = 0;

      for (const cat of categoriesToSubmit) {
        const selId = selectedIds[cat];
        const res = await submitVotoPopular({ categoria: cat, inscricao_id: selId, fingerprint: fp });
        if (res.success) {
          storeVote(cat as CategoriaKey, selId);
          successCount++;
        } else {
          errorCount++;
        }
      }

      setSelectedIds({});

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
      
      if (errorCount === 0) {
        toast({ title: 'Voto(s) confirmado(s)', description: 'Obrigado por participar do Voto Popular!' });
      } else {
        toast({ title: 'Atenção', description: `Foram registrados ${successCount} voto(s), mas ${errorCount} falharam ou já estavam computados.` });
      }
    } catch (e: unknown) {
      toast({ title: 'Erro', description: 'Houve um problema ao processar seu(s) voto(s).' });
    }
  };

  const totalVotos = isLogged ? Object.values(votosCountById).reduce((sum, n) => sum + (n || 0), 0) : 0;

  const loadImageDataUrl = async (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const exportVotoPopularPdf = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // Header com favicon, título e subtítulo
    const iconDataUrl = await loadImageDataUrl('/favicon.ico');
    const headerY = 18;
    if (iconDataUrl) {
      doc.addImage(iconDataUrl, 'PNG', margin, headerY - 6, 8, 8);
    } else {
      doc.setFillColor(118, 10, 37);
      doc.circle(margin + 4, headerY - 2, 3, 'F');
    }
    doc.setFontSize(14);
    doc.text('Prêmio Melhores Práticas do MPPI - 10ª Edição', margin + 12, headerY);
    doc.setFontSize(11);
    doc.text('Resultado - Voto Popular', margin + 12, headerY + 7);
    doc.setDrawColor(180);
    doc.line(margin, headerY + 10, pageWidth - margin, headerY + 10);

    let y = headerY + 16;
    const rowH = 8;

    for (const cat of categorias) {
      const catFinalistas = allFinalistas.filter(f => f.inscricao.area_atuacao === cat.key);
      if (catFinalistas.length === 0) continue;

      const catTotalVotos = catFinalistas.reduce((sum, f) => sum + (votosCountById[f.inscricao.id] || 0), 0);

      const ranked = catFinalistas
        .map((f) => {
          const id = f.inscricao.id;
          const votes = votosCountById[id] || 0;
          const pct = catTotalVotos > 0 ? (votes / catTotalVotos) * 100 : 0;
          return { name: f.inscricao.titulo_iniciativa || '', votes, pct };
        })
        .sort((a, b) => b.votes - a.votes)
        .map((item, idx) => ({ ...item, pos: idx + 1 }));

      if (y > doc.internal.pageSize.getHeight() - margin - 20) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(cat.label, margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255);
      doc.setFillColor(118, 10, 37);
      doc.rect(margin, y, tableWidth, rowH, 'F');
      doc.text('Pos', xPos + 2, y + 5);
      doc.text('Trabalho', xWork + 2, y + 5);
      doc.text('Votos', xVotes + 2, y + 5);
      doc.text('%', xPct + 2, y + 5);
      y += rowH;

      doc.setTextColor(20);
      ranked.forEach((r) => {
        if (y > doc.internal.pageSize.getHeight() - margin - rowH) {
          doc.addPage();
          y = margin;
        }
        doc.setDrawColor(230);
        doc.line(margin, y, margin + tableWidth, y);

        doc.text(String(r.pos).padStart(2, '0'), xPos + 2, y + 6);

        const wrapped = doc.splitTextToSize(r.name, colWorkW - 4);
        doc.text(wrapped, xWork + 2, y + 6);
        const lines = Array.isArray(wrapped) ? wrapped.length : 1;

        doc.text(r.votes.toLocaleString('pt-BR'), xVotes + 2, y + 6);
        doc.text(`${r.pct.toFixed(1)}%`, xPct + 2, y + 6);

        y += Math.max(rowH, lines * 6);
      });

      if (y > doc.internal.pageSize.getHeight() - margin - rowH) {
        doc.addPage();
        y = margin;
      }
      doc.setDrawColor(0);
      doc.line(margin, y, margin + tableWidth, y);
      y += 4;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Total da categoria', xWork + 2, y);
      doc.text(catTotalVotos.toLocaleString('pt-BR'), xVotes + 2, y);
      doc.text(catTotalVotos > 0 ? '100,0%' : '0,0%', xPct + 2, y);
      doc.setFont('helvetica', 'normal');
      
      y += 12;
    }

    doc.save('voto-popular.pdf');
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
                <div className="text-[11px] text-gray-600">Prêmio Melhores Práticas do MPPI - 10ª edição</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-3">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {VOTACAO_ENCERRADA ? (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-[11px] text-red-900">
                A votação popular foi <strong>encerrada</strong>. Agradecemos a participação de todos. Os campos de seleção foram bloqueados e novos votos não podem ser registrados.
              </div>
            ) : null}

            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900">
              Selecione até <strong>1 (um)</strong> trabalho finalista de cada categoria e clique em <strong>Confirmar voto</strong>. Os trabalhos finalistas estão exibidos em <strong>ordem aleatória para garantir a igualdade de condições</strong>. O voto é <strong>único por dispositivo por categoria</strong>; após confirmar, novas votações para aquela categoria ficam bloqueadas. Para conhecer cada trabalho, use o ícone de visualizar ao lado do título.
            </div>

            <div className="p-2">
              <div className="rounded-md overflow-hidden border shadow-md">
                <div className="bg-primary text-primary-foreground px-3 py-2 flex items-center justify-between">
                  <h2 className="text-xs font-semibold">Finalistas</h2>
                  <div className="flex items-center gap-2">
                    {hasVotedAny() && (
                      <span className="text-[11px]">Voto registrado neste dispositivo</span>
                    )}
                    {isAdmin && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className="h-6 px-2" aria-label="Exportar PDF" onClick={exportVotoPopularPdf}>
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span className="text-xs">Exportar resultado em PDF</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                {isLogged && (
                  <div className="px-3 py-2 text-[11px] text-gray-700">Total de votos: {totalVotos.toLocaleString('pt-BR')}</div>
                )}
                {loading ? (
                  <div className="text-xs text-gray-500 px-3 py-2">Carregando finalistas...</div>
                ) : allFinalistas.length === 0 ? (
                  <div className="text-xs text-gray-500 px-3 py-2">Nenhum finalista disponível.</div>
                ) : (
                  <div className="px-3 py-2">
                    {isLogged ? (
                      <div className="rounded border overflow-hidden">
                        <div className="grid grid-cols-12 bg-gray-100 px-3 py-2 text-[11px] font-semibold">
                          <div className="col-span-8">Trabalho</div>
                          <div className="col-span-2 text-right">Votos</div>
                          <div className="col-span-2 text-right">%</div>
                        </div>
                        <div className="divide-y">
                          {allFinalistas
                            .slice()
                            .sort((a, b) => {
                              const va = votosCountById[a.inscricao.id] || 0;
                              const vb = votosCountById[b.inscricao.id] || 0;
                              return vb - va;
                            })
                            .map((item) => {
                              const id = item.inscricao.id;
                              const votes = votosCountById[id] || 0;
                              const pct = totalVotos > 0 ? (votes / totalVotos) * 100 : 0;
                              return (
                                <div key={id} className="grid grid-cols-12 items-center px-3 py-2 text-xs">
                                  <div className="col-span-8 text-gray-900">{item.inscricao.titulo_iniciativa}</div>
                                  <div className="col-span-2 text-right text-gray-700">{votes.toLocaleString('pt-BR')}</div>
                                  <div className="col-span-2 text-right text-gray-700">{pct.toFixed(1)}%</div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {categorias.map(cat => {
                          const catFinalistas = allFinalistas.filter(f => f.inscricao.area_atuacao === cat.key);
                          if (catFinalistas.length === 0) return null;
                          
                          const catVoted = hasVoted(cat.key);
                          return (
                            <div key={cat.key} className="space-y-2">
                              <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                <h3 className="font-semibold text-gray-800 text-xs">{cat.label}</h3>
                                {catVoted && <span className="text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Voto já registrado</span>}
                              </div>
                              <div className="space-y-1">
                                {catFinalistas.map((item) => {
                                  const id = item.inscricao.id;
                                  const selected = selectedIds[cat.key] === id;
                                  const isVotedItem = catVoted && getStoredVote(cat.key) === id;
                                  return (
                                    <label
                                      key={id}
                                      className={`flex items-center justify-between rounded border px-3 py-2 text-xs transition-colors ${
                                        isVotedItem ? 'border-green-400 bg-green-50' :
                                        selected ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`sel-${cat.key}`}
                                          checked={selected || isVotedItem}
                                          onChange={() => onSelectOne(cat.key, id)}
                                          className="h-3 w-3"
                                          disabled={VOTACAO_ENCERRADA || catVoted}
                                        />
                                        <div>
                                          <div className="font-medium text-gray-900">{item.inscricao.titulo_iniciativa}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isVotedItem ? (
                                          <span className="inline-flex items-center shrink-0 whitespace-nowrap text-[10px] px-2 py-[2px] rounded-full bg-green-600 text-white">Votado</span>
                                        ) : selected ? (
                                          <span className="inline-flex items-center shrink-0 whitespace-nowrap text-[10px] px-2 py-[2px] rounded-full bg-black text-white">Selecionado</span>
                                        ) : null}
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
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

            
            
            

            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                onClick={openConfirm}
                disabled={VOTACAO_ENCERRADA || Object.keys(selectedIds).filter(cat => !hasVoted(cat as CategoriaKey)).length === 0}
                aria-disabled={VOTACAO_ENCERRADA || Object.keys(selectedIds).filter(cat => !hasVoted(cat as CategoriaKey)).length === 0}
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

