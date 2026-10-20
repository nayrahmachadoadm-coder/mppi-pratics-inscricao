import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, FileDown, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Calendar, Info, BarChart3, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { CategoriaRankingItem, getRelatorioCategoria, getTop3ByCategoriaSql } from '@/lib/evaluationService';
import { isAuthenticated, hasRole } from '@/lib/auth';
import { getDeviceFingerprint, getStoredVote, storeVote } from '@/utils/fingerprint';
import { submitVotoPopular, getVotosCountByCategoria, getVotoPopularCandidatos } from '@/lib/votoPopularService';
import { getPeriodoVotacao } from '@/lib/supabaseService';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica';
type VotesById = { [id: string]: number };

interface FinalistaItem {
  inscricao: {
    id: string;
    titulo_iniciativa: string;
    nome_completo: string;
    lotacao: string;
    area_atuacao: string;
    descricao_iniciativa?: string;
    problema_necessidade?: string;
    metodologia?: string;
    principais_resultados?: string;
  };
}

const categorias: { key: CategoriaKey; label: string }[] = [
  { key: 'finalistica-projeto', label: 'Projetos Finalísticos' },
  { key: 'estruturante-projeto', label: 'Projetos Estruturantes' },
  { key: 'finalistica-pratica', label: 'Práticas Finalísticas' },
  { key: 'estruturante-pratica', label: 'Práticas Estruturantes' },
];

type PeriodoStatus = 'CARREGANDO' | 'AGUARDANDO_INICIO' | 'ABERTO' | 'ENCERRADO';

const VotoPopular: React.FC = () => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allFinalistas, setAllFinalistas] = useState<FinalistaItem[]>([]);
  const [votosCountById, setVotosCountById] = useState<VotesById>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'publico' | 'apuracao'>('publico');
  
  // Status do cronograma
  const [periodoStatus, setPeriodoStatus] = useState<PeriodoStatus>('CARREGANDO');
  const [datasPeriodo, setDatasPeriodo] = useState<{ inicio: Date | null; fim: Date | null }>({ inicio: null, fim: null });

  // Detalhes da inscrição
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [detalheItem, setDetalheItem] = useState<FinalistaItem | null>(null);

  // Desafio anti-automação (Item 9.7 do Edital)
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [challenge, setChallenge] = useState<{ a: number; b: number }>({ a: 0, b: 0 });
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatAreaAtuacao = (area: string) => {
    const areaMap: { [key: string]: string } = {
      'finalistica-pratica': 'Prática Finalística',
      'finalistica-projeto': 'Projeto Finalístico',
      'estruturante-pratica': 'Prática Estruturante',
      'estruturante-projeto': 'Projeto Estruturante'
    };
    return areaMap[area] || area;
  };

  const carregarDados = async () => {
    setLoading(true);
    setError('');
    try {
      const logged = await isAuthenticated();
      setIsLogged(logged);
      let adminCheck = false;
      if (logged) {
        adminCheck = await hasRole('admin');
        setIsAdmin(adminCheck);
      }

      // 1. Verificar período oficial do cronograma
      const periodo = await getPeriodoVotacao();
      setDatasPeriodo(periodo);

      const agora = new Date();
      // Fallback para datas oficiais do Edital se não configuradas no banco
      const inicio = periodo.inicio || new Date('2026-11-12T00:00:00-03:00');
      const fim = periodo.fim || new Date('2026-11-23T23:59:59-03:00');

      let statusCalc: PeriodoStatus = 'ABERTO';
      if (agora < inicio) {
        statusCalc = 'AGUARDANDO_INICIO';
      } else if (agora > fim) {
        statusCalc = 'ENCERRADO';
      }
      setPeriodoStatus(statusCalc);

      // 2. Carregar candidatos
      // Session seed para randomização por sessão do eleitor (Item 9.2: igualdade sem ordem técnica)
      let sessionSeed = sessionStorage.getItem('voto_seed');
      if (!sessionSeed) {
        sessionSeed = String(Math.random());
        sessionStorage.setItem('voto_seed', sessionSeed);
      }

      const collected: FinalistaItem[] = [];

      // Se a votação está aberta OU é administrador/jurado visualizando previamente
      for (const cat of categorias) {
        try {
          const res = await getVotoPopularCandidatos(cat.key, parseFloat(sessionSeed));
          if (res.success && res.data && res.data.length > 0) {
            const mapped: FinalistaItem[] = res.data.map(c => ({
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
          } else if (logged) {
            // Fallback para ambiente administrativo antes da publicação de snapshot
            try {
              const viaSql = await getTop3ByCategoriaSql(cat.key);
              if (viaSql.success && (viaSql.data || []).length > 0) {
                const top = (viaSql.data || []).slice(0, 3).map(it => ({
                  inscricao: {
                    id: it.inscricao.id,
                    titulo_iniciativa: it.inscricao.titulo_iniciativa,
                    nome_completo: it.inscricao.nome_completo,
                    lotacao: it.inscricao.lotacao,
                    area_atuacao: it.inscricao.area_atuacao,
                    descricao_iniciativa: it.inscricao.descricao_iniciativa,
                    problema_necessidade: it.inscricao.problema_necessidade,
                    metodologia: it.inscricao.metodologia,
                    principais_resultados: it.inscricao.principais_resultados,
                  }
                }));
                collected.push(...top);
              } else {
                const rel = await getRelatorioCategoria(cat.key);
                const list = (rel.data || []).slice(0, 3).map(it => ({
                  inscricao: {
                    id: it.inscricao.id,
                    titulo_iniciativa: it.inscricao.titulo_iniciativa,
                    nome_completo: it.inscricao.nome_completo,
                    lotacao: it.inscricao.lotacao,
                    area_atuacao: it.inscricao.area_atuacao,
                    descricao_iniciativa: it.inscricao.descricao_iniciativa,
                    problema_necessidade: it.inscricao.problema_necessidade,
                    metodologia: it.inscricao.metodologia,
                    principais_resultados: it.inscricao.principais_resultados,
                  }
                }));
                collected.push(...list);
              }
            } catch { void 0; }
          }
        } catch { void 0; }
      }

      setAllFinalistas(collected);

      // 3. Se for administrador, carregar contagem de votos para fins de auditoria interna
      if (adminCheck) {
        const merged: VotesById = {};
        for (const cat of categorias) {
          try {
            const byCat = await getVotosCountByCategoria(cat.key);
            Object.entries(byCat).forEach(([id, count]) => { merged[id] = count; });
          } catch { void 0; }
        }
        setVotosCountById(merged);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar os finalistas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const hasVoted = (cat: CategoriaKey) => Boolean(getStoredVote(cat));
  const hasVotedAny = () => categorias.some((c) => hasVoted(c.key));

  const onSelectOne = (categoria: string, inscricaoId: string) => {
    setSelectedIds(prev => ({ ...prev, [categoria]: inscricaoId }));
  };

  const openDetalhes = (item: FinalistaItem) => {
    setDetalheItem(item);
    setDetalheOpen(true);
  };

  // Disparo do desafio de segurança anti-robô (Item 9.7)
  const openConfirmDialog = () => {
    if (periodoStatus === 'ENCERRADO') {
      toast({ title: 'Votação encerrada', description: 'O período oficial de votação popular encerrou-se em 23/11/2026.' });
      return;
    }
    if (periodoStatus === 'AGUARDANDO_INICIO' && !isAdmin) {
      toast({ title: 'Aguardando início', description: 'A votação popular terá início em 12/11/2026.' });
      return;
    }
    const categoriesToSubmit = Object.keys(selectedIds).filter(cat => !hasVoted(cat as CategoriaKey));
    if (categoriesToSubmit.length === 0) {
      toast({ title: 'Nenhuma seleção pendente', description: 'Selecione pelo menos um trabalho de uma categoria que ainda não votou.' });
      return;
    }

    // Gera o desafio matemático simples para validação humana
    const a = Math.floor(3 + Math.random() * 6);
    const b = Math.floor(2 + Math.random() * 7);
    setChallenge({ a, b });
    setAnswer('');
    setVerifyOpen(true);
  };

  const confirmarVotos = async () => {
    const expected = challenge.a + challenge.b;
    if (Number(answer.trim()) !== expected) {
      toast({ title: 'Verificação incorreta', description: 'Por favor, informe a resposta correta para confirmar seu voto.' });
      return;
    }

    setIsSubmitting(true);
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
          // Se já havia sido computado no banco (unicidade)
          storeVote(cat as CategoriaKey, selId);
          errorCount++;
        }
      }

      setSelectedIds({});
      setVerifyOpen(false);

      if (isAdmin) {
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
        toast({ title: 'Voto(s) registrado(s) com sucesso!', description: 'Obrigado por participar da 10ª Edição do Prêmio Melhores Práticas do MPPI.' });
      } else {
        toast({ title: 'Atenção', description: `Foram registrados ${successCount} voto(s). Outros já constavam como computados para este dispositivo.` });
      }
    } catch {
      toast({ title: 'Erro', description: 'Houve um problema ao processar seu voto. Tente novamente mais tarde.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVotosAdmin = isAdmin ? Object.values(votosCountById).reduce((sum, n) => sum + (n || 0), 0) : 0;

  const exportVotoPopularPdf = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const tableWidth = pageWidth - 2 * margin;
    const xPos = margin;
    const xWork = xPos + 14;
    const xPct = pageWidth - margin - 20;
    const xVotes = xPct - 22;
    const colWorkW = xVotes - xWork;

    const headerY = 18;
    doc.setFillColor(118, 10, 37);
    doc.circle(margin + 4, headerY - 2, 3, 'F');
    doc.setFontSize(13);
    doc.text('Ministério Público do Estado do Piauí — MPPI', margin + 12, headerY);
    doc.setFontSize(11);
    doc.text('Prêmio Melhores Práticas - 10ª Edição (Edital nº 88/2026)', margin + 12, headerY + 6);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Relatório Administrativo de Apuração do Voto Popular — Extraído em: ${new Date().toLocaleString('pt-BR')}`, margin + 12, headerY + 11);
    doc.setDrawColor(180);
    doc.line(margin, headerY + 14, pageWidth - margin, headerY + 14);

    let y = headerY + 22;
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
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(cat.label, margin, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255);
      doc.setFillColor(118, 10, 37);
      doc.rect(margin, y, tableWidth, rowH, 'F');
      doc.text('Pos', xPos + 2, y + 5);
      doc.text('Trabalho Finalista', xWork + 2, y + 5);
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
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Total da categoria', xWork + 2, y);
      doc.text(catTotalVotos.toLocaleString('pt-BR'), xVotes + 2, y);
      doc.text(catTotalVotos > 0 ? '100,0%' : '0,0%', xPct + 2, y);
      doc.setFont('helvetica', 'normal');
      
      y += 12;
    }

    doc.save('apuracao-voto-popular-mppi-2026.pdf');
  };

  const categoriesPendingSubmit = Object.keys(selectedIds).filter(cat => !hasVoted(cat as CategoriaKey));

  return (
    <div className="bg-slate-50 min-h-screen py-4">
      <main className="max-w-5xl mx-auto px-3 sm:px-4">
        
        {/* Barra de Administração (Exibida exclusivamente para perfil Administrador) */}
        {isAdmin && (
          <div className="mb-4 bg-white border border-slate-300 rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                Administração / APG
              </Badge>
              <span className="text-xs text-slate-600">
                Auditoria e monitoramento de apuração (Item 9.6 a 9.10)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 rounded-md p-0.5 border">
                <Button
                  size="sm"
                  variant={adminTab === 'publico' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setAdminTab('publico')}
                >
                  <Users className="h-3.5 w-3.5 mr-1" />
                  Visão do Eleitor
                </Button>
                <Button
                  size="sm"
                  variant={adminTab === 'apuracao' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setAdminTab('apuracao')}
                >
                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                  Apuração de Votos
                </Button>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs text-slate-700"
                      onClick={exportVotoPopularPdf}
                    >
                      <FileDown className="h-3.5 w-3.5 mr-1" />
                      Exportar PDF
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">Baixar memória de apuração dos votos</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        <Card className="shadow-md border border-slate-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/95 to-primary text-primary-foreground py-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/favicon.ico" alt="MPPI" className="h-9 w-9 bg-white/10 p-1 rounded-md" />
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Voto Popular — 10ª Edição
                  </CardTitle>
                  <div className="text-xs text-primary-foreground/80">
                    Prêmio Melhores Práticas do Ministério Público do Estado do Piauí (Edital nº 88/2026)
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="border-white/30 text-white bg-white/10 text-xs hidden sm:inline-flex">
                Item 9 do Edital
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {/* Aviso Informativo sobre o Período Oficial da Votação */}
            {periodoStatus === 'AGUARDANDO_INICIO' && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-amber-950 text-sm">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  Período Oficial da Votação Popular: 12/11/2026 a 23/11/2026
                </div>
                <p>
                  Em conformidade com o <strong>Cronograma Oficial (Anexo Único)</strong> e o <strong>Item 9.1 do Edital nº 88/2026</strong>, a etapa de Votação Popular terá início no dia <strong>12 de novembro de 2026</strong>, após a conclusão do julgamento técnico pela Comissão Julgadora e a divulgação oficial das <strong>3 (três) iniciativas finalistas</strong> de cada categoria (prevista para 11/11/2026).
                </p>
                {isAdmin && (
                  <p className="text-[11px] text-amber-800 font-medium pt-1 border-t border-amber-200/60">
                    * Modo Administrador ativo: os finalistas e ferramentas de gestão estão visíveis para auditoria técnica prévia.
                  </p>
                )}
              </div>
            )}

            {periodoStatus === 'ENCERRADO' && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs leading-relaxed space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-red-950 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
                  Votação Popular Encerrada
                </div>
                <p>
                  O prazo para votação popular encerrou-se em <strong>23/11/2026 às 23:59</strong>. Conforme os <strong>Itens 9.6 e 9.8 do Edital</strong>, a organização do certame está procedendo à apuração dos votos válidos e ao cálculo da Nota Popular para consolidação da Pontuação Final. Agradecemos a participação de todos!
                </p>
              </div>
            )}

            {periodoStatus === 'ABERTO' && (
              <div className="p-4 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-xs leading-relaxed space-y-1 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-blue-950 text-sm">
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  Instruções para o Voto Popular
                </div>
                <p>
                  • Escolha <strong>1 (uma) iniciativa finalista em cada categoria</strong> e clique em <strong>Confirmar voto</strong> ao final da página.
                </p>
                <p>
                  • <strong>Igualdade de condições (Item 9.2):</strong> os finalistas são apresentados sem indicação de pontuação ou ordem técnica prévia.
                </p>
                <p>
                  • <strong>Segurança e unicidade (Itens 9.4 e 9.7):</strong> o voto é único por categoria para cada dispositivo/eleitor, integrando <strong>20% da Pontuação Final</strong> das iniciativas (Item 9.5).
                </p>
              </div>
            )}

            {/* Painel de Apuração Administrativa (Exibido apenas quando o Admin opta por essa aba) */}
            {isAdmin && adminTab === 'apuracao' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Contagem e Apuração de Votos Válidos (Auditoria Interna)
                  </h3>
                  <span className="text-xs font-medium text-slate-600">
                    Total geral de votos computados: <strong>{totalVotosAdmin.toLocaleString('pt-BR')}</strong>
                  </span>
                </div>

                {allFinalistas.length === 0 ? (
                  <div className="text-xs text-slate-500 py-6 text-center">Nenhum finalista disponível para apuração.</div>
                ) : (
                  <div className="space-y-4">
                    {categorias.map(cat => {
                      const catFinalistas = allFinalistas.filter(f => f.inscricao.area_atuacao === cat.key);
                      if (catFinalistas.length === 0) return null;
                      const catTotal = catFinalistas.reduce((sum, f) => sum + (votosCountById[f.inscricao.id] || 0), 0);

                      return (
                        <div key={cat.key} className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                          <div className="bg-slate-100 px-3 py-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800">{cat.label}</span>
                            <span className="text-xs text-slate-600">Total da Categoria: <strong>{catTotal.toLocaleString('pt-BR')}</strong> votos</span>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {catFinalistas
                              .slice()
                              .sort((a, b) => (votosCountById[b.inscricao.id] || 0) - (votosCountById[a.inscricao.id] || 0))
                              .map((item, idx) => {
                                const id = item.inscricao.id;
                                const votes = votosCountById[id] || 0;
                                const pct = catTotal > 0 ? (votes / catTotal) * 100 : 0;
                                return (
                                  <div key={id} className="grid grid-cols-12 items-center px-3 py-2.5 text-xs hover:bg-slate-50">
                                    <div className="col-span-1 text-slate-400 font-semibold">{idx + 1}º</div>
                                    <div className="col-span-7">
                                      <div className="font-medium text-slate-900">{item.inscricao.titulo_iniciativa}</div>
                                      <div className="text-[11px] text-slate-500">{item.inscricao.nome_completo} • {item.inscricao.lotacao}</div>
                                    </div>
                                    <div className="col-span-2 text-right font-mono font-medium text-slate-700">
                                      {votes.toLocaleString('pt-BR')} votos
                                    </div>
                                    <div className="col-span-2 text-right font-mono font-semibold text-primary">
                                      {pct.toFixed(1)}%
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Interface Pública de Votação (Igualdade de condições - Item 9.2) */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Iniciativas Finalistas por Categoria
                  </h3>
                  {hasVotedAny() && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Voto registrado neste dispositivo
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="text-xs text-slate-500 py-8 text-center flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 animate-spin text-primary" />
                    Carregando finalistas...
                  </div>
                ) : allFinalistas.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                    <Calendar className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-medium text-slate-700">Nenhum finalista publicado no momento.</p>
                    <p className="mt-1 text-slate-500">
                      A relação oficial dos 3 (três) finalistas por categoria será homologada após a conclusão da etapa de julgamento técnico pela Comissão Julgadora (Item 9.1).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categorias.map(cat => {
                      const catFinalistas = allFinalistas.filter(f => f.inscricao.area_atuacao === cat.key);
                      if (catFinalistas.length === 0) return null;
                      
                      const catVoted = hasVoted(cat.key);
                      return (
                        <div key={cat.key} className="space-y-2">
                          <div className="flex items-center justify-between bg-slate-100/90 px-3 py-2 rounded-md border border-slate-200">
                            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{cat.label}</h4>
                            {catVoted ? (
                              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium border border-emerald-200">
                                Voto computado
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">
                                Escolha 1 iniciativa
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            {catFinalistas.map((item) => {
                              const id = item.inscricao.id;
                              const selected = selectedIds[cat.key] === id;
                              const isVotedItem = catVoted && getStoredVote(cat.key) === id;
                              const isDisabled = periodoStatus === 'ENCERRADO' || (periodoStatus === 'AGUARDANDO_INICIO' && !isAdmin) || catVoted;

                              return (
                                <label
                                  key={id}
                                  className={`flex items-center justify-between rounded-lg border p-3 text-xs transition-all cursor-pointer ${
                                    isVotedItem ? 'border-emerald-400 bg-emerald-50/60 ring-1 ring-emerald-300' :
                                    selected ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/40' : 
                                    'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                  } ${isDisabled && !isVotedItem ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                  <div className="flex items-center gap-3 pr-2 min-w-0">
                                    <input
                                      type="radio"
                                      name={`sel-${cat.key}`}
                                      checked={selected || isVotedItem}
                                      onChange={() => onSelectOne(cat.key, id)}
                                      className="h-4 w-4 text-primary focus:ring-primary shrink-0"
                                      disabled={isDisabled}
                                    />
                                    <div className="min-w-0">
                                      <div className="font-semibold text-slate-900 leading-snug">
                                        {item.inscricao.titulo_iniciativa}
                                      </div>
                                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                        {item.inscricao.nome_completo} • {item.inscricao.lotacao}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {isVotedItem ? (
                                      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-medium">
                                        Seu Voto
                                      </span>
                                    ) : selected ? (
                                      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-medium">
                                        Selecionado
                                      </span>
                                    ) : null}

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              openDetalhes(item);
                                            }}
                                            aria-label="Ver detalhes da iniciativa"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <span className="text-xs">Conhecer iniciativa</span>
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

                    {/* Botão de Confirmação de Voto */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                      <div className="text-xs text-slate-500">
                        {categoriesPendingSubmit.length > 0 ? (
                          <span>{categoriesPendingSubmit.length} categoria(s) pronta(s) para confirmação de voto.</span>
                        ) : (
                          <span>Selecione uma iniciativa para habilitar o envio do voto.</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full sm:w-auto px-5 font-semibold"
                        onClick={openConfirmDialog}
                        disabled={
                          (periodoStatus === 'ENCERRADO') ||
                          (periodoStatus === 'AGUARDANDO_INICIO' && !isAdmin) ||
                          categoriesPendingSubmit.length === 0
                        }
                      >
                        <ShieldCheck className="h-4 w-4 mr-1.5" />
                        Confirmar Voto(s)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal de Detalhes da Inscrição (Resumo, Metodologia, Resultados) */}
            <Dialog open={detalheOpen} onOpenChange={setDetalheOpen}>
              <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
                <DialogHeader className="bg-primary text-primary-foreground -mx-6 -mt-6 p-4 rounded-t-lg">
                  <DialogTitle className="text-sm font-bold text-white">
                    Ficha Técnica da Iniciativa Finalista
                  </DialogTitle>
                </DialogHeader>
                {detalheItem && (
                  <div className="space-y-3 text-xs text-justify pt-2">
                    <div>
                      <span className="font-semibold text-slate-900">Título da Iniciativa: </span>
                      <span className="text-slate-800 font-medium">{detalheItem.inscricao.titulo_iniciativa}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-700">Proponente: </span>
                        <span className="text-slate-800">{detalheItem.inscricao.nome_completo}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Lotação: </span>
                        <span className="text-slate-800">{detalheItem.inscricao.lotacao}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-slate-700">Categoria: </span>
                        <span className="text-slate-800 font-medium">{formatAreaAtuacao(detalheItem.inscricao.area_atuacao)}</span>
                      </div>
                    </div>

                    {detalheItem.inscricao.descricao_iniciativa && (
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">Resumo da Iniciativa:</div>
                        <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                          {detalheItem.inscricao.descricao_iniciativa}
                        </p>
                      </div>
                    )}

                    {detalheItem.inscricao.problema_necessidade && (
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">Problema ou Necessidade Enfrentada:</div>
                        <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                          {detalheItem.inscricao.problema_necessidade}
                        </p>
                      </div>
                    )}

                    {detalheItem.inscricao.metodologia && (
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">Metodologia e Etapas de Implementação:</div>
                        <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                          {detalheItem.inscricao.metodologia}
                        </p>
                      </div>
                    )}

                    {detalheItem.inscricao.principais_resultados && (
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">Principais Resultados e Impactos Alcançados:</div>
                        <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                          {detalheItem.inscricao.principais_resultados}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter className="pt-2 border-t">
                  <Button variant="secondary" size="sm" onClick={() => setDetalheOpen(false)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal de Verificação Anti-Automação e Confirmação de Voto (Item 9.7 do Edital) */}
            <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Confirmação de Voto Popular
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-semibold text-slate-800">Iniciativas selecionadas para envio:</div>
                    <ul className="space-y-1 list-disc list-inside text-slate-700">
                      {categoriesPendingSubmit.map(cat => {
                        const selId = selectedIds[cat];
                        const cand = allFinalistas.find(f => f.inscricao.id === selId);
                        const catLabel = categorias.find(c => c.key === cat)?.label;
                        return (
                          <li key={cat} className="truncate">
                            <span className="font-medium text-slate-900">{catLabel}:</span>{' '}
                            {cand?.inscricao.titulo_iniciativa || 'Iniciativa selecionada'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="text-slate-600 leading-relaxed">
                    Em conformidade com o <strong>Item 9.4 e 9.7 do Edital nº 88/2026</strong>, cada eleitor possui direito a 1 (um) voto por categoria. Votos automatizados ou repetidos em desacordo com as regras serão desconsiderados.
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md space-y-2">
                    <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-amber-700" />
                      Verificação de segurança (Anti-robô)
                    </div>
                    <div className="text-amber-900">
                      Quanto é <strong>{challenge.a} + {challenge.b}</strong>?
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Digite o resultado da soma"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          confirmarVotos();
                        }
                      }}
                      className="h-8 text-xs bg-white border-amber-300 focus-visible:ring-amber-500"
                      autoFocus
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => setVerifyOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={confirmarVotos} disabled={isSubmitting || !answer.trim()}>
                    {isSubmitting ? 'Registrando...' : 'Confirmar e Enviar Voto'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VotoPopular;
