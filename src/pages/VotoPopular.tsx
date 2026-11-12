import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Info,
  BarChart3,
  Users,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  Sparkles,
  Trophy,
  Bot,
  PartyPopper,
  Star,
  X,
  RotateCcw,
  Scale,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { getRelatorioCategoria, getTop3ByCategoriaSql, isOfficial2026FinalistTitle } from '@/lib/evaluationService';
import { isAuthenticated, hasRole } from '@/lib/auth';
import { getDeviceFingerprint, getStoredVote, storeVote, removeStoredVote, purgeLegacy2025Votes } from '@/utils/fingerprint';
import { submitVotoPopular, getVotosCountByCategoria, getVotoPopularCandidatos, limparVotosTesteAdmin } from '@/lib/votoPopularService';
import { getPeriodoVotacao } from '@/lib/supabaseService';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica';
type VotesById = { [id: string]: number };

interface FinalistaPublicSummary {
  id: string;
  titulo_iniciativa: string;
  nome_completo: string;
  lotacao: string;
  area_atuacao: string;
  descricao_iniciativa?: string;
}

interface FinalistaItem {
  inscricao: FinalistaPublicSummary;
}

const sortFinalistasAlfabetico = (items: FinalistaItem[]): FinalistaItem[] =>
  [...items].sort((a, b) =>
    (a.inscricao.titulo_iniciativa || '').localeCompare(
      b.inscricao.titulo_iniciativa || '',
      'pt-BR',
      { sensitivity: 'base' }
    )
  );

const categorias: { key: CategoriaKey; label: string; subtitle: string }[] = [
  {
    key: 'finalistica-projeto',
    label: 'Projetos Finalísticos',
    subtitle: 'Iniciativas voltadas diretamente à atividade-fim e ao atendimento à sociedade',
  },
  {
    key: 'estruturante-projeto',
    label: 'Projetos Estruturantes',
    subtitle: 'Iniciativas voltadas ao aprimoramento da gestão, governança e suporte institucional',
  },
  {
    key: 'finalistica-pratica',
    label: 'Práticas Finalísticas',
    subtitle: 'Boas práticas consolidadas na atuação finalística do Ministério Público',
  },
  {
    key: 'estruturante-pratica',
    label: 'Práticas Estruturantes',
    subtitle: 'Boas práticas de gestão administrativa, tecnológica e organizacional',
  },
];

type PeriodoStatus = 'CARREGANDO' | 'AGUARDANDO_INICIO' | 'ABERTO' | 'ENCERRADO';

const VotoPopular: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allFinalistas, setAllFinalistas] = useState<FinalistaItem[]>([]);
  const [votosCountById, setVotosCountById] = useState<VotesById>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'publico' | 'apuracao'>('publico');
  
  // Status do cronograma
  const [periodoStatus, setPeriodoStatus] = useState<PeriodoStatus>('CARREGANDO');
  const [datasPeriodo, setDatasPeriodo] = useState<{ inicio: Date | null; fim: Date | null }>({ inicio: null, fim: null });

  // Desafio anti-automação (Item 9.7 do Edital)
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [challenge, setChallenge] = useState<{ a: number; b: number }>({ a: 0, b: 0 });
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmação elegante de envio do voto popular
  const [voteSuccessOpen, setVoteSuccessOpen] = useState(false);
  const [lastSubmittedVotes, setLastSubmittedVotes] = useState<
    { catKey: CategoriaKey; catLabel: string; titulo: string }[]
  >([]);

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

      // 1. Verificar período oficial do cronograma (Edital nº 88/2026: 12/11/2026 a 23/11/2026)
      const periodo = await getPeriodoVotacao();
      setDatasPeriodo(periodo);

      const agora = new Date();
      const inicioOficialEdital = new Date('2026-11-12T00:00:00-03:00');
      const fimOficialEdital = new Date('2026-11-23T23:59:59-03:00');
      const dentroJanelaOficial = agora >= inicioOficialEdital && agora <= fimOficialEdital;

      const inicio = periodo.inicio || inicioOficialEdital;
      const fim = periodo.fim || fimOficialEdital;

      let statusCalc: PeriodoStatus = 'ABERTO';
      if (dentroJanelaOficial) {
        statusCalc = 'ABERTO';
      } else if (agora < inicio) {
        statusCalc = 'AGUARDANDO_INICIO';
      } else if (agora > fim) {
        statusCalc = 'ENCERRADO';
      }
      setPeriodoStatus(statusCalc);

      // 2. Carregar candidatos e ordenar em ordem alfabética por categoria (Item 9.2: sem indicação de nota ou classificação técnica)
      const sessionSeed = 0.5;
      const collected: FinalistaItem[] = [];

      for (const cat of categorias) {
        try {
          let catLoaded = false;

          // 1. Priorizar o cálculo técnico oficial (Top 3 com maiores Notas Técnicas dos jurados - Item 8.3 e 9.1)
          try {
            const rel = await getRelatorioCategoria(cat.key);
            if (rel.success && rel.data && rel.data.length > 0) {
              const hasRealScores = rel.data.some((it) => it.avaliacoes_count > 0);
              const top3 = rel.data
                .filter((it) =>
                  hasRealScores
                    ? Boolean(it.is_finalista)
                    : isOfficial2026FinalistTitle(cat.key, it.inscricao.titulo_iniciativa)
                )
                .slice(0, 3);

              if (top3.length === 3) {
                const list: FinalistaItem[] = top3.map((it) => ({
                  inscricao: {
                    id: it.inscricao.id,
                    titulo_iniciativa: it.inscricao.titulo_iniciativa,
                    nome_completo: it.inscricao.nome_completo,
                    lotacao: it.inscricao.lotacao,
                    area_atuacao: it.inscricao.area_atuacao || cat.key,
                    descricao_iniciativa: it.inscricao.descricao_iniciativa,
                  },
                }));
                collected.push(...sortFinalistasAlfabetico(list));
                catLoaded = true;
              }
            }
          } catch { void 0; }

          // 2. Caso não tenha carregado via relatório, consultar RPC get_voto_popular_candidatos / voto_popular_top3_por_categoria
          if (!catLoaded) {
            const res = await getVotoPopularCandidatos(cat.key, sessionSeed);
            const validRpcCandidates = (res.data || []).filter((c) =>
              isOfficial2026FinalistTitle(cat.key, c.titulo_iniciativa)
            );
            const sourceList =
              validRpcCandidates.length === 3
                ? validRpcCandidates
                : (res.data || []).slice(0, 3);

            if (res.success && sourceList.length > 0) {
              const mapped: FinalistaItem[] = sourceList.map((c) => ({
                inscricao: {
                  id: c.inscricao_id,
                  titulo_iniciativa: c.titulo_iniciativa,
                  nome_completo: c.nome_completo,
                  lotacao: c.lotacao,
                  area_atuacao: c.area_atuacao || cat.key,
                  descricao_iniciativa: c.descricao_iniciativa,
                },
              }));
              collected.push(...sortFinalistasAlfabetico(mapped));
              catLoaded = true;
            }
          }

          if (!catLoaded) {
            try {
              const viaSql = await getTop3ByCategoriaSql(cat.key);
              if (viaSql.success && (viaSql.data || []).length > 0) {
                const top = (viaSql.data || []).slice(0, 3).map((it) => ({
                  inscricao: {
                    id: it.inscricao.id,
                    titulo_iniciativa: it.inscricao.titulo_iniciativa,
                    nome_completo: it.inscricao.nome_completo,
                    lotacao: it.inscricao.lotacao,
                    area_atuacao: it.inscricao.area_atuacao || cat.key,
                    descricao_iniciativa: it.inscricao.descricao_iniciativa,
                  },
                }));
                collected.push(...sortFinalistasAlfabetico(top));
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

        // Se o banco de dados não possui votos computados para uma inscrição salva localmente, limpa o bloqueio local indevido
        for (const cat of categorias) {
          const storedId = getStoredVote(cat.key);
          if (storedId && (merged[storedId] || 0) === 0) {
            removeStoredVote(cat.key);
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar os finalistas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    purgeLegacy2025Votes();
    carregarDados();
  }, []);

  // Garante que apenas votos válidos da edição 2026 (cujo candidato exista entre os finalistas atuais) sejam considerados
  const getValidStoredVote = (cat: CategoriaKey): string | null => {
    const storedId = getStoredVote(cat);
    if (!storedId) return null;
    const catFinalistas = allFinalistas.filter(f => f.inscricao.area_atuacao === cat);
    if (catFinalistas.length > 0 && !catFinalistas.some(f => f.inscricao.id === storedId)) {
      removeStoredVote(cat);
      return null;
    }
    return storedId;
  };

  const hasVoted = (cat: CategoriaKey) => Boolean(getValidStoredVote(cat));
  const hasVotedAny = () => categorias.some((c) => hasVoted(c.key));

  const onSelectOne = (categoria: string, inscricaoId: string) => {
    setSelectedIds(prev => ({ ...prev, [categoria]: inscricaoId }));
  };

  const toggleResumo = (inscricaoId: string) => {
    setExpandedIds(prev => ({ ...prev, [inscricaoId]: !prev[inscricaoId] }));
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
      let duplicateCount = 0;
      let periodoBlockedCount = 0;
      let otherErrorMsg = '';
      const submittedSummary: { catKey: CategoriaKey; catLabel: string; titulo: string }[] = [];

      for (const cat of categoriesToSubmit) {
        const catKey = cat as CategoriaKey;
        const selId = selectedIds[cat];
        const cand = allFinalistas.find(f => f.inscricao.id === selId);
        const catLabel = categorias.find(c => c.key === catKey)?.label || cat;
        const res = await submitVotoPopular({ categoria: cat, inscricao_id: selId, fingerprint: fp });
        if (res.success) {
          storeVote(catKey, selId);
          successCount++;
          submittedSummary.push({
            catKey,
            catLabel,
            titulo: cand?.inscricao.titulo_iniciativa || 'Iniciativa finalista',
          });
        } else if (res.isDuplicate) {
          // Apenas se o banco retornar especificamente erro 23505 (unicidade na edição 2026)
          storeVote(catKey, selId);
          duplicateCount++;
          submittedSummary.push({
            catKey,
            catLabel,
            titulo: cand?.inscricao.titulo_iniciativa || 'Iniciativa finalista',
          });
        } else if (res.isPeriodoBlocked) {
          periodoBlockedCount++;
          otherErrorMsg = res.error || 'O período oficial de votação no banco de dados inicia em 12/11/2026.';
        } else {
          otherErrorMsg = res.error || 'Erro ao gravar voto no servidor.';
        }
      }

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
      
      if (successCount > 0) {
        setSelectedIds({});
        setLastSubmittedVotes(submittedSummary);
        setVoteSuccessOpen(true);
        toast({
          title: 'Voto(s) registrado(s) com sucesso!',
          description: 'Obrigado por participar da 10ª Edição do Prêmio Melhores Práticas do MPPI.',
        });
      } else if (duplicateCount > 0 && periodoBlockedCount === 0) {
        setSelectedIds({});
        setLastSubmittedVotes(submittedSummary);
        setVoteSuccessOpen(true);
        toast({
          title: 'Voto já computado nesta edição',
          description: 'Este dispositivo já possui voto registrado para a(s) categoria(s) selecionada(s) na Edição 2026.',
        });
      } else if (periodoBlockedCount > 0) {
        toast({
          variant: 'destructive',
          title: 'Período de votação ainda não iniciado no banco de dados',
          description: `${otherErrorMsg} Para testes administrativos antes de 12/11/2026, autorize o voto de teste de administrador no Supabase.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Não foi possível registrar o voto',
          description: otherErrorMsg || 'Verifique sua conexão e tente novamente.',
        });
      }
    } catch {
      toast({ title: 'Erro', description: 'Houve um problema ao processar seu voto. Tente novamente mais tarde.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVotosAdmin = isAdmin ? Object.values(votosCountById).reduce((sum, n) => sum + (n || 0), 0) : 0;

  const handleResetVotoTesteAdmin = async () => {
    try {
      const fp = await getDeviceFingerprint();
      const res = await limparVotosTesteAdmin(fp);
      categorias.forEach((c) => removeStoredVote(c.key));
      setSelectedIds({});
      setLastSubmittedVotes([]);
      setVoteSuccessOpen(false);
      await carregarDados();
      if (res.success) {
        toast({
          title: 'Votos de teste limpos',
          description: `O registro de teste deste dispositivo foi removido (${res.deleted || 0} voto(s) excluído(s) no banco).`,
        });
      } else {
        toast({
          title: 'Bloqueio local limpo',
          description: 'O estado local de votação deste dispositivo foi reiniciado para novo teste.',
        });
      }
    } catch {
      categorias.forEach((c) => removeStoredVote(c.key));
      setSelectedIds({});
      toast({
        title: 'Bloqueio local limpo',
        description: 'O estado local deste dispositivo foi reiniciado.',
      });
    }
  };

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
  const expectedSum = challenge.a + challenge.b;
  const isChallengeCorrect = answer.trim() !== '' && Number(answer.trim()) === expectedSum;
  const isChallengeWrong = answer.trim() !== '' && !isChallengeCorrect;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between">
      {/* Cabeçalho Institucional Público (exibido quando o usuário não está logado no painel interno) */}
      {!isLogged && (
        <header className="w-full border-b border-black/15 bg-white/95 sticky top-0 z-40 shadow-2xs">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-mppi.png"
                alt="Brasão MPPI"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/favicon.ico';
                }}
              />
              <div className="border-l border-black/20 pl-3">
                <span className="block text-xs font-semibold tracking-wider text-primary uppercase">
                  Ministério Público do Estado do Piauí
                </span>
                <span className="block text-[11px] text-muted-foreground font-medium">
                  Prêmio Melhores Práticas • 10ª Edição (Votação Popular: 12 a 23/11)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/proponente')}
                className="text-xs h-9 border-black/20 hover:border-black/40 text-gray-800 font-medium rounded-xs"
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Área do Proponente
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/admin/login')}
                className="text-xs h-9 bg-primary hover:bg-primary-dark text-white font-medium rounded-xs border border-black/20 shadow-xs"
              >
                <Scale className="w-3.5 h-3.5 mr-1.5" />
                Comissão Julgadora
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 flex-1">
        
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
                      className="h-7 px-2.5 text-xs text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100"
                      onClick={handleResetVotoTesteAdmin}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Reiniciar Voto de Teste
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">Remove os votos de teste deste dispositivo no banco e libera para testar novamente</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                  • <strong>Igualdade de condições (Item 9.2):</strong> as iniciativas finalistas são exibidas em <strong>ordem alfabética</strong> dentro de cada categoria, sem divulgação da nota obtida na fase de julgamento técnico para não influenciar a votação popular.
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
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-800">
                      Iniciativas Finalistas por Categoria
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Candidatos listados em <strong>ordem alfabética</strong> em igualdade de condições (Item 9.2 do Edital nº 88/2026)
                    </p>
                  </div>
                  {hasVotedAny() && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Voto registrado na Edição 2026
                    </span>
                  )}
                </div>

                {/* Banner Elegante de Confirmação de Participação na Edição 2026 */}
                {hasVotedAny() && (
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 p-4 sm:p-5 shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                            Seu voto popular foi registrado com sucesso na Edição 2026!
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/80 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            Voto único por dispositivo
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
                          Agradecemos sua participação na <strong>10ª Edição do Prêmio Melhores Práticas do MPPI (Edital nº 88/2026)</strong>. Em conformidade com os <strong>Itens 9.4 e 9.7 do Edital</strong>, o voto popular é <strong>único por dispositivo em cada categoria</strong>, garantindo a segurança, a transparência e a igualdade de condições entre as iniciativas concorrentes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="text-sm text-slate-500 py-10 text-center flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 animate-spin text-primary" />
                    Carregando iniciativas finalistas...
                  </div>
                ) : allFinalistas.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                    <Calendar className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">Nenhum finalista publicado no momento.</p>
                    <p className="mt-1 text-slate-500">
                      A relação oficial dos 3 (três) finalistas por categoria será homologada após a conclusão da etapa de julgamento técnico pela Comissão Julgadora (Item 9.1).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {categorias.map(cat => {
                      const catFinalistas = sortFinalistasAlfabetico(
                        allFinalistas.filter(f => f.inscricao.area_atuacao === cat.key)
                      );
                      if (catFinalistas.length === 0) return null;
                      
                      const catVoted = hasVoted(cat.key);
                      const hasSelectionInCat = Boolean(selectedIds[cat.key]);

                      return (
                        <section
                          key={cat.key}
                          className="rounded-xl border border-slate-200/90 bg-white shadow-sm overflow-hidden"
                        >
                          {/* Cabeçalho Elegante da Categoria */}
                          <div className="bg-gradient-to-r from-[#4A071B] via-[#760A25] to-[#5C081D] border-b-2 border-amber-400/80 px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-white">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-white/10 border border-amber-300/30 flex items-center justify-center shrink-0 shadow-inner">
                                <Award className="h-5 w-5 text-amber-300" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm sm:text-base tracking-tight">
                                  {cat.label}
                                </h4>
                                <p className="text-[11px] sm:text-xs text-rose-100/85">
                                  {cat.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {catVoted ? (
                                <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-100 px-3 py-1 rounded-full font-semibold border border-emerald-400/40">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                                  Voto computado
                                </span>
                              ) : hasSelectionInCat ? (
                                <span className="inline-flex items-center gap-1.5 text-xs bg-amber-400/20 text-amber-100 px-3 py-1 rounded-full font-semibold border border-amber-300/40">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />
                                  1 iniciativa selecionada
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-xs bg-white/10 text-white/90 px-3 py-1 rounded-full font-medium border border-white/20">
                                  Escolha 1 finalista
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Lista de Candidatos Finalistas (Ordem Alfabética) */}
                          <div className="p-3 sm:p-4 space-y-3 bg-slate-50/50">
                            {catFinalistas.map((item) => {
                              const id = item.inscricao.id;
                              const selected = selectedIds[cat.key] === id;
                              const isVotedItem = catVoted && getValidStoredVote(cat.key) === id;
                              const isDisabled = periodoStatus === 'ENCERRADO' || (periodoStatus === 'AGUARDANDO_INICIO' && !isAdmin) || catVoted;
                              const isExpanded = Boolean(expandedIds[id]);

                              return (
                                <div
                                  key={id}
                                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                                    isVotedItem
                                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                                      : selected
                                      ? 'border-primary bg-rose-50/30 ring-2 ring-primary/20 shadow-md'
                                      : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-sm hover:shadow'
                                  }`}
                                >
                                  <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    {/* Área de seleção do candidato */}
                                    <label
                                      className={`flex items-start gap-3.5 min-w-0 flex-1 ${
                                        isDisabled && !isVotedItem ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`sel-${cat.key}`}
                                        checked={selected || isVotedItem}
                                        onChange={() => onSelectOne(cat.key, id)}
                                        className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-slate-300 shrink-0 cursor-pointer"
                                        disabled={isDisabled}
                                      />
                                      <div className="min-w-0 flex-1 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                            {item.inscricao.titulo_iniciativa}
                                          </span>
                                          {isVotedItem ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-semibold shadow-sm">
                                              <CheckCircle2 className="h-3 w-3" />
                                              Seu Voto
                                            </span>
                                          ) : selected ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-primary text-white font-semibold shadow-sm">
                                              Selecionado para votar
                                            </span>
                                          ) : null}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-[13px] text-slate-600">
                                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                                            <User className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                            {item.inscricao.nome_completo}
                                          </span>
                                          {item.inscricao.lotacao && (
                                            <span className="inline-flex items-center gap-1.5 text-slate-500">
                                              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                              {item.inscricao.lotacao}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </label>

                                    {/* Botão visível tipo "sandwich" para abrir/fechar o Resumo da Iniciativa */}
                                    <div className="flex items-center justify-end sm:shrink-0 pl-7 sm:pl-0">
                                      <Button
                                        type="button"
                                        variant={isExpanded ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => toggleResumo(id)}
                                        aria-expanded={isExpanded}
                                        className={`h-9 px-3.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                                          isExpanded
                                            ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                                            : 'border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/50'
                                        }`}
                                      >
                                        <BookOpen className="h-4 w-4 shrink-0" />
                                        <span>
                                          {isExpanded ? 'Ocultar resumo' : 'Ler resumo da iniciativa'}
                                        </span>
                                        {isExpanded ? (
                                          <ChevronUp className="h-4 w-4 shrink-0" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4 shrink-0" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Painel Sandwich Expansível com APENAS o Resumo da Iniciativa em fonte de fácil leitura */}
                                  {isExpanded && (
                                    <div className="border-t border-slate-200/80 bg-slate-50/90 px-4 sm:px-6 py-4 sm:py-5 transition-all">
                                      <div className="max-w-4xl space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                                          <BookOpen className="h-4 w-4" />
                                          Resumo da Iniciativa Concorrente
                                        </div>
                                        <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line text-justify font-normal">
                                          {item.inscricao.descricao_iniciativa?.trim()
                                            ? item.inscricao.descricao_iniciativa
                                            : 'Resumo da iniciativa não informado.'}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}

                    {/* Botão de Confirmação de Voto */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-white p-4 rounded-xl border shadow-sm">
                      <div className="text-xs sm:text-sm text-slate-600 font-medium">
                        {categoriesPendingSubmit.length > 0 ? (
                          <span className="text-slate-800">
                            <strong>{categoriesPendingSubmit.length}</strong> categoria(s) selecionada(s) pronta(s) para confirmação de voto.
                          </span>
                        ) : (
                          <span>Selecione uma iniciativa finalista acima para habilitar o envio do seu voto.</span>
                        )}
                      </div>
                      <Button
                        size="default"
                        className="w-full sm:w-auto px-6 font-bold shadow-sm"
                        onClick={openConfirmDialog}
                        disabled={
                          (periodoStatus === 'ENCERRADO') ||
                          (periodoStatus === 'AGUARDANDO_INICIO' && !isAdmin) ||
                          categoriesPendingSubmit.length === 0
                        }
                      >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Confirmar Voto(s)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal de Verificação Anti-Automação e Confirmação de Voto (Item 9.7 do Edital) */}
            <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
              <DialogContent
                hideClose
                className="sm:max-w-xl w-[calc(100%-1.5rem)] max-h-[88vh] flex flex-col p-0 rounded-2xl overflow-hidden border-0 shadow-2xl gap-0"
              >
                {/* Cabeçalho Elegante com Gradiente Institucional e Elementos Lúdicos */}
                <div className="shrink-0 bg-gradient-to-r from-[#4A071B] via-[#760A25] to-[#5C081D] text-white px-5 sm:px-6 py-4 border-b-2 border-amber-400/80 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #FFD700 1.2px, transparent 1.2px)',
                      backgroundSize: '18px 18px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVerifyOpen(false)}
                    aria-label="Fechar"
                    className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <DialogHeader className="relative z-10 text-left pr-8 space-y-1">
                    <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-semibold uppercase tracking-wider mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>Quase lá! Seu voto faz a diferença</span>
                    </div>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 tracking-tight">
                      <div className="h-9 w-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-inner">
                        <Trophy className="h-5 w-5 text-amber-300" />
                      </div>
                      <span>Confirmação do Voto Popular</span>
                    </DialogTitle>
                    <p className="text-xs sm:text-sm text-rose-100/90 pl-11">
                      Confira suas escolhas favoritas para celebrar as melhores práticas do MPPI!
                    </p>
                  </DialogHeader>
                </div>

                {/* Corpo do Modal */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 space-y-4 text-xs sm:text-sm min-w-0 bg-white">
                  {/* Lista de Escolhas */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50 to-rose-50/30 border border-slate-200/90 space-y-3 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0" />
                        <span>Suas iniciativas escolhidas para brilhar:</span>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {categoriesPendingSubmit.length}{' '}
                        {categoriesPendingSubmit.length === 1 ? 'categoria' : 'categorias'}
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-slate-700 min-w-0">
                      {categoriesPendingSubmit.map(cat => {
                        const selId = selectedIds[cat];
                        const cand = allFinalistas.find(f => f.inscricao.id === selId);
                        const catLabel = categorias.find(c => c.key === cat)?.label;
                        return (
                          <li
                            key={cat}
                            className="p-3 rounded-lg bg-white border border-slate-200/90 border-l-4 border-l-primary shadow-xs min-w-0 break-words leading-snug transition-all"
                          >
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary mb-1">
                              <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              <span>{catLabel}</span>
                            </div>
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm break-words">
                              {cand?.inscricao.titulo_iniciativa || 'Iniciativa selecionada'}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/*Desafio Rápido Anti-Robô mais Lúdico e Descontraído */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border border-amber-200/90 rounded-xl space-y-3 min-w-0 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-amber-950 flex items-center gap-2 text-xs sm:text-sm">
                        <div className="h-7 w-7 rounded-lg bg-amber-400/25 border border-amber-400/50 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-amber-800" />
                        </div>
                        <span>Desafio rápido: mostre que você é humano!</span>
                      </div>
                      {isChallengeCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Resposta certa!
                        </span>
                      ) : isChallengeWrong ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Resposta incorreta
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                      <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-amber-950 shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-amber-900 mr-1">
                          Resolva a continha:
                        </span>
                        <span className="inline-flex items-center justify-center h-9 min-w-[2.25rem] px-2.5 rounded-lg bg-white border border-amber-300 shadow-xs text-primary font-extrabold">
                          {challenge.a}
                        </span>
                        <span className="text-amber-700 font-extrabold">+</span>
                        <span className="inline-flex items-center justify-center h-9 min-w-[2.25rem] px-2.5 rounded-lg bg-white border border-amber-300 shadow-xs text-primary font-extrabold">
                          {challenge.b}
                        </span>
                        <span className="text-amber-700 font-extrabold">=</span>
                      </div>

                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Digite a soma aqui..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && isChallengeCorrect && !isSubmitting) {
                            e.preventDefault();
                            confirmarVotos();
                          }
                        }}
                        className={`h-10 text-sm sm:text-base font-semibold bg-white w-full sm:flex-1 rounded-lg ${
                          isChallengeCorrect
                            ? 'border-emerald-400 focus-visible:ring-emerald-500 text-emerald-900'
                            : isChallengeWrong
                            ? 'border-rose-400 focus-visible:ring-rose-500 text-rose-900'
                            : 'border-amber-300 focus-visible:ring-amber-500'
                        }`}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Nota leve sobre as regras do Edital */}
                  <div className="flex items-start gap-2.5 text-[11px] sm:text-xs text-slate-500 leading-relaxed bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200/70 break-words">
                    <ShieldCheck className="h-4 w-4 text-primary/70 shrink-0 mt-0.5" />
                    <span>
                      <strong>Voto único e seguro (Itens 9.4 e 9.7 do Edital nº 88/2026):</strong> cada eleitor registra 1 (um) voto por categoria para garantir uma participação justa e transparente para todos.
                    </span>
                  </div>
                </div>

                {/* Rodapé do Modal */}
                <DialogFooter className="shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto px-4 h-10 text-sm font-medium text-slate-700 border-slate-300 bg-white hover:bg-slate-100 rounded-lg"
                    onClick={() => setVerifyOpen(false)}
                    disabled={isSubmitting}
                  >
                    Voltar e revisar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full sm:w-auto px-5 h-10 text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
                    onClick={confirmarVotos}
                    disabled={isSubmitting || !isChallengeCorrect}
                  >
                    <PartyPopper className="h-4 w-4 shrink-0" />
                    <span>{isSubmitting ? 'Registrando seu voto...' : 'Confirmar e Enviar Meu Voto'}</span>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal Elegante de Confirmação de Envio do Voto Popular */}
            <Dialog open={voteSuccessOpen} onOpenChange={setVoteSuccessOpen}>
              <DialogContent
                hideClose
                className="sm:max-w-xl w-[calc(100%-1.5rem)] max-h-[88vh] flex flex-col p-0 rounded-2xl overflow-hidden border-0 shadow-2xl gap-0"
              >
                {/* Cabeçalho Comemorativo de Confirmação */}
                <div className="shrink-0 bg-gradient-to-r from-[#4A071B] via-[#760A25] to-[#5C081D] text-white px-5 sm:px-6 py-5 border-b-2 border-amber-400/80 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #FFD700 1.2px, transparent 1.2px)',
                      backgroundSize: '18px 18px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVoteSuccessOpen(false)}
                    aria-label="Fechar"
                    className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <DialogHeader className="relative z-10 text-left pr-8 space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 w-fit px-3 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-300/50 text-emerald-100 text-[11px] font-bold uppercase tracking-wider mb-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Voto Popular Confirmado • Edição 2026</span>
                    </div>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-3 tracking-tight">
                      <div className="h-10 w-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-inner">
                        <PartyPopper className="h-5 w-5 text-amber-300" />
                      </div>
                      <span>Seu Voto Foi Enviado com Sucesso!</span>
                    </DialogTitle>
                    <p className="text-xs sm:text-sm text-rose-100/90 pl-[3.25rem]">
                      Obrigado por participar da 10ª Edição do Prêmio Melhores Práticas do MPPI!
                    </p>
                  </DialogHeader>
                </div>

                {/* Corpo do Comprovante de Votação */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 space-y-4 text-xs sm:text-sm min-w-0 bg-white">
                  {lastSubmittedVotes.length > 0 && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 to-slate-50 border border-emerald-200/80 space-y-2.5 min-w-0">
                      <div className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Resumo do seu voto registrado:</span>
                      </div>
                      <ul className="space-y-2 min-w-0">
                        {lastSubmittedVotes.map((item) => (
                          <li
                            key={item.catKey}
                            className="p-3 rounded-lg bg-white border border-emerald-200/90 border-l-4 border-l-emerald-600 shadow-xs min-w-0 break-words leading-snug"
                          >
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800 mb-0.5">
                              <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              <span>{item.catLabel}</span>
                            </div>
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm break-words">
                              {item.titulo}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Confirmação Institucional de Unicidade por Dispositivo */}
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-2 min-w-0 shadow-xs">
                    <div className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                      <span>Garantia de Voto Único por Dispositivo</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed break-words">
                      Confirmamos que seu voto foi devidamente computado para a <strong>Edição 2026</strong>. Em conformidade com os <strong>Itens 9.4 e 9.7 do Edital nº 88/2026</strong>, <strong>o voto popular é único por dispositivo em cada categoria</strong>, assegurando a igualdade de condições, a autenticidade e a transparência na apuração.
                    </p>
                  </div>
                </div>

                {/* Rodapé */}
                <DialogFooter className="shrink-0 flex justify-end px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full sm:w-auto px-6 h-10 text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
                    onClick={() => setVoteSuccessOpen(false)}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Concluir</span>
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
