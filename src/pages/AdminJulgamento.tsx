import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Award, CheckCircle, ChevronLeft, ChevronRight, Info, BarChart3, Save, ListChecks, ClipboardList, Mail, Building, Calendar, Target, FileText, ArrowLeft, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { hasRole } from '@/lib/auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AdminInscricaoData, getAllInscricoes, getInscricaoById, InscricaoFilters } from '@/lib/adminService';
import { getCurrentProfile } from '@/lib/auth';
import { ScoreEntry, submitAvaliacao, getAvaliacoesByJurado, getMinhasAvaliacoes, MinhasAvaliacaoItem, getAvaliacoesByInscricao, isVotacaoFinalizada, finalizeVotacao } from '@/lib/evaluationService';
import { getRelatorioCategoria, CategoriaRankingItem } from '@/lib/evaluationService';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getJuryMembers, JuryMember } from '@/lib/juryManagement';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica' | 'categoria-especial-ia';

const categorias: { key: CategoriaKey; label: string }[] = [
  { key: 'finalistica-projeto', label: 'Projetos Finalísticos' },
  { key: 'estruturante-projeto', label: 'Projetos Estruturantes' },
  { key: 'finalistica-pratica', label: 'Práticas Finalísticas' },
  { key: 'estruturante-pratica', label: 'Práticas Estruturantes' },
  { key: 'categoria-especial-ia', label: 'Categoria Especial (IA)' },
];

const scoreOptions = [0,1,2,3,4,5];

// Util para gerar logomarca dinâmica baseada no título/id
function stringHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const AdminJulgamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [juradoUsername, setJuradoUsername] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<CategoriaKey | null>(null);
  const [inscricoes, setInscricoes] = useState<AdminInscricaoData[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [errorList, setErrorList] = useState<string>('');

  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [pendentesOnly, setPendentesOnly] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('julgamento.pendentesOnly');
      return val === 'true';
    } catch { return false; }
  });
  const [categoriaResumo, setCategoriaResumo] = useState<Record<CategoriaKey, { total: number; done: number }>>({
    'finalistica-projeto': { total: 0, done: 0 },
    'estruturante-projeto': { total: 0, done: 0 },
    'finalistica-pratica': { total: 0, done: 0 },
    'estruturante-pratica': { total: 0, done: 0 },
    'categoria-especial-ia': { total: 0, done: 0 },
  });

  const [scores, setScores] = useState<any>({
    cooperacao: -1,
    inovacao: -1,
    resolutividade: -1,
    impacto_social: -1,
    alinhamento_ods: -1,
    replicabilidade: -1,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [adminState, setAdminState] = useState(false);
  const [juradoState, setJuradoState] = useState(false);
  const [totalsOpen, setTotalsOpen] = useState(false);
  const [totalsLoading, setTotalsLoading] = useState(false);
  const [totalsError, setTotalsError] = useState('');
  const [totalsItems, setTotalsItems] = useState<CategoriaRankingItem[]>([]);
  const [myOpen, setMyOpen] = useState(false);
  const [myLoading, setMyLoading] = useState(false);
  const [myError, setMyError] = useState('');
  const [myItems, setMyItems] = useState<MinhasAvaliacaoItem[]>([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [adminVotesOpen, setAdminVotesOpen] = useState(false);
  const [adminVotesLoading, setAdminVotesLoading] = useState(false);
  const [adminVotesError, setAdminVotesError] = useState('');
  const [adminVotesItems, setAdminVotesItems] = useState<MinhasAvaliacaoItem[]>([]);
  const [juradosList, setJuradosList] = useState<JuryMember[]>([]);
  const [selectedAdminJurado, setSelectedAdminJurado] = useState<string>('');

  const total = useMemo(() => {
    const vals = Object.values(scores) as number[];
    return vals.reduce((sum, v) => sum + (v >= 0 ? v : 0), 0);
  }, [scores]);

  const isComplete = useMemo(() => {
    const vals = Object.values(scores) as number[];
    return vals.every((v) => v >= 0);
  }, [scores]);

  const currentInscricao = inscricoes[currentIndex] || null;
  const progressTotal = inscricoes.length;
  const progressDone = useMemo(() => {
    let c = 0;
    for (const item of inscricoes) {
      if (item.id && votedIds.has(item.id)) c++;
    }
    return c;
  }, [inscricoes, votedIds]);

  useEffect(() => {
    const run = async () => {
      const admin = await hasRole('admin');
      setAdminState(admin);
      const jurado = await hasRole('jurado');
      setJuradoState(jurado);
      
      const profile = await getCurrentProfile();
      const username = profile?.username || '';
      setJuradoUsername(username);
      if (!username) return;
      const res = await getAvaliacoesByJurado(username);
      if (res.success) {
        const set = new Set<string>();
        for (const r of res.data || []) {
          if (r.inscricao_id) set.add(r.inscricao_id);
        }
        setVotedIds(set);
      }
    };
    run();
  }, []);

  // Inicializa área selecionada (persistida ou primeira)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('julgamento.selectedArea') as CategoriaKey | null;
      if (saved && categorias.some(c => c.key === saved)) {
        setSelectedArea(saved);
      } else {
        setSelectedArea(categorias[0].key);
      }
    } catch {
      setSelectedArea(categorias[0].key);
    }
  }, []);

  // Removido: persistência de pendentesOnly (filtro descontinuado)

  useEffect(() => {
    if (selectedArea) {
      try { localStorage.setItem('julgamento.selectedArea', selectedArea); } catch {}
    }
  }, [selectedArea]);

  useEffect(() => {
    const load = async () => {
      if (!selectedArea) return;
      try {
        setLoadingList(true);
        setErrorList('');
        const filters: InscricaoFilters = { area_atuacao: selectedArea };
        const res = await getAllInscricoes(1, 1000, filters);
        if (res.success) {
          const list = (res.data || []).sort((a,b) => (a.titulo_iniciativa||'').localeCompare(b.titulo_iniciativa||'', 'pt-BR', { sensitivity: 'base' }));
          setInscricoes(list);
          // posicionar conforme preferência e persistência
          let idx = 0;
          try {
            const savedIdxStr = localStorage.getItem(`julgamento.currentIndex.${selectedArea}`);
            const savedIdx = savedIdxStr ? Number(savedIdxStr) : 0;
            idx = Number.isFinite(savedIdx) ? Math.min(Math.max(0, savedIdx), Math.max(0, list.length - 1)) : 0;
          } catch { idx = 0; }
          setCurrentIndex(idx);
          // resetar notas ao trocar a área
          setScores({ cooperacao: -1, inovacao: -1, resolutividade: -1, impacto_social: -1, alinhamento_ods: -1, replicabilidade: -1 });
          setShowValidation(false);
        } else {
          setErrorList(res.error || 'Erro ao carregar inscrições');
          setInscricoes([]);
          setCurrentIndex(0);
        }
      } catch {
        setErrorList('Erro inesperado ao carregar inscrições');
        setInscricoes([]);
        setCurrentIndex(0);
      } finally {
        setLoadingList(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea]);

  // Persiste índice atual por área
  useEffect(() => {
    if (selectedArea) {
      try { localStorage.setItem(`julgamento.currentIndex.${selectedArea}`, String(currentIndex)); } catch {}
    }
  }, [currentIndex, selectedArea]);

  // Carrega resumo por categoria (total e já votados por este jurado)
  useEffect(() => {
    const loadResumo = async () => {
      const nextResumo: Record<CategoriaKey, { total: number; done: number }> = { ...categoriaResumo };
      for (const cat of categorias) {
        try {
          const res = await getAllInscricoes(1, 1000, { area_atuacao: cat.key });
          if (res.success) {
            const list = res.data || [];
            const total = list.length;
            const done = list.reduce((acc, i) => acc + (i.id && votedIds.has(i.id) ? 1 : 0), 0);
            nextResumo[cat.key] = { total, done } as any;
          } else {
            nextResumo[cat.key] = { total: 0, done: 0 } as any;
          }
        } catch {
          nextResumo[cat.key] = { total: 0, done: 0 } as any;
        }
      }
      setCategoriaResumo(nextResumo);
    };
    // somente após termos os votos do jurado
    if (votedIds.size >= 0) {
      loadResumo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votedIds]);

  const handleChange = (field: keyof ScoreEntry, value: number) => {
    setScores((prev: any) => ({ ...prev, [field]: value }));
  };

  const goPrev = () => {
    setShowValidation(false);
    setScores({ cooperacao: -1, inovacao: -1, resolutividade: -1, impacto_social: -1, alinhamento_ods: -1, replicabilidade: -1 });
    setCurrentIndex((idx) => Math.max(0, idx - 1));
  };
  const goNext = () => {
    setShowValidation(false);
    setScores({ cooperacao: -1, inovacao: -1, resolutividade: -1, impacto_social: -1, alinhamento_ods: -1, replicabilidade: -1 });
    setCurrentIndex((idx) => Math.min(inscricoes.length - 1, idx + 1));
  };

  const goNextPending = () => {
    const idx = inscricoes.findIndex((i, pos) => pos > currentIndex && i.id && !votedIds.has(i.id));
    const nextIdx = idx >= 0 ? idx : currentIndex;
    setShowValidation(false);
    setScores({ cooperacao: -1, inovacao: -1, resolutividade: -1, impacto_social: -1, alinhamento_ods: -1, replicabilidade: -1 });
    setCurrentIndex(nextIdx);
    // foco no card de avaliação
    setTimeout(() => {
      const el = document.getElementById('avaliacao-card');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSave = async () => {
    if (!currentInscricao) return;
    if (!isComplete) {
      setShowValidation(true);
      toast({ title: 'Preencha todas as notas', description: 'Selecione uma nota para cada critério.' });
      return;
    }
    try {
      setSaving(true);
      const res = await submitAvaliacao(currentInscricao.id, scores as ScoreEntry);
      if (!res.success) {
        toast({ title: 'Erro ao salvar', description: res.error || 'Tente novamente', variant: 'destructive' });
        return;
      }
      // marcar como votado
      setVotedIds((prev) => new Set(prev).add(currentInscricao.id));
      toast({ title: 'Avaliação registrada', description: 'Você pode seguir para o próximo trabalho.' });
      // ir para o próximo não votado
      goNextPending();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="min-h-[72vh]">
          <main className="w-full pt-4">
            <Card className="shadow-lg border rounded-xl">
              <CardHeader className="pb-2 bg-[hsl(var(--primary))] text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Julgamento – Votação dos Jurados</CardTitle>
                    <p className="text-xs text-white/90">Selecione uma categoria e avalie um trabalho por vez.</p>
                    {juradoUsername && (
                      <p className="text-xs text-white/90 mt-1">Jurado: <span className="font-medium">{juradoUsername}</span></p>
                    )}
                  </div>
                  <div className="flex items-center gap-2"></div>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                {/* Resumo por categoria removido: simplificação solicitada */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {categorias.map((cat) => (
                    <Button
                      key={cat.key}
                      variant="default"
                      className={`h-12 px-2 py-2 text-center border rounded-xl shadow-sm ${selectedArea === cat.key ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]' : 'bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white'}`}
                      onClick={() => setSelectedArea(cat.key)}
                    >
                      <span className="text-sm font-semibold">{cat.label}</span>
                    </Button>
                  ))}
                </div>

                {errorList && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertDescription>{errorList}</AlertDescription>
                  </Alert>
                )}

                {selectedArea && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">Progresso: {progressDone} de {progressTotal} avaliados <span className="text-gray-500">({progressTotal > 0 ? ((progressDone / progressTotal) * 100).toFixed(2) : '0.00'}%)</span></div>
                      <div className="flex items-center gap-2">
                          {adminState && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (!selectedArea) return;
                                setTotalsOpen(true);
                                setTotalsLoading(true);
                                setTotalsError('');
                                try {
                                  const res = await getRelatorioCategoria(selectedArea);
                                  if (res.success) {
                                    setTotalsItems(res.data || []);
                                  } else {
                                    setTotalsItems([]);
                                    setTotalsError(res.error || 'Erro ao carregar totalização');
                                  }
                                } catch {
                                  setTotalsError('Erro inesperado ao carregar totalização');
                                  setTotalsItems([]);
                                } finally {
                                  setTotalsLoading(false);
                                }
                              }}
                              title="Ver totalização de votos"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          )}
                          {adminState && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="Votos por jurado"
                                    onClick={async () => {
                                      if (!selectedArea) return;
                                      setAdminVotesOpen(true);
                                      setAdminVotesLoading(true);
                                      setAdminVotesError('');
                                      try {
                                        const jurados = await getJuryMembers();
                                        setJuradosList(jurados);
                                        const first = jurados[0]?.username || '';
                                        setSelectedAdminJurado(first);
                                        if (first) {
                                          const res = await getMinhasAvaliacoes(first, selectedArea);
                                          setAdminVotesItems(res.success ? (res.data || []) : []);
                                          if (!res.success) setAdminVotesError(res.error || 'Erro ao carregar votos');
                                        }
                                      } catch (e:any) {
                                        setAdminVotesError(e?.message || 'Erro ao carregar jurados');
                                        setAdminVotesItems([]);
                                      } finally {
                                        setAdminVotesLoading(false);
                                      }
                                    }}
                                  >
                                    <ClipboardList className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Votos por jurado</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {juradoState && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    title="Ver meus votos"
                                    onClick={async () => {
                                      if (!juradoUsername || !selectedArea) return;
                                      setMyOpen(true);
                                      setMyLoading(true);
                                      setMyError('');
                                      try {
                                        const res = await getMinhasAvaliacoes(juradoUsername, selectedArea);
                                        if (res.success) {
                                          setMyItems(res.data || []);
                                        } else {
                                          setMyItems([]);
                                          setMyError(res.error || 'Erro ao carregar avaliações');
                                        }
                                        const fin = await isVotacaoFinalizada(juradoUsername, selectedArea);
                                        setIsFinalized(fin);
                                      } catch {
                                        setMyError('Erro inesperado ao carregar avaliações');
                                        setMyItems([]);
                                      } finally {
                                        setMyLoading(false);
                                      }
                                    }}
                                  >
                                    <ListChecks className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ver meus votos</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <span className="text-sm text-gray-600">
                            {currentIndex + 1} de {inscricoes.length}
                          </span>
                          <Button variant="outline" size="sm" onClick={goPrev} disabled={currentIndex <= 0} className="w-8 h-8 p-0 flex items-center justify-center" aria-label="Anterior">
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={goNext} disabled={currentIndex >= inscricoes.length - 1} className="w-8 h-8 p-0 flex items-center justify-center" aria-label="Próximo">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                    </div>

                    {/* indicadores de votado/não votado - clicáveis */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {inscricoes.map((i, idx) => (
                        <button
                          key={i.id}
                          type="button"
                          className={`text-[10px] px-2 py-[2px] rounded-full transition-colors ${
                            votedIds.has(i.id)
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          } ${idx === currentIndex ? 'ring-2 ring-[hsl(var(--primary))] ring-offset-1' : ''}`}
                          title={`Ir ao trabalho #${idx + 1}`}
                          onClick={() => {
                            setShowValidation(false);
                            setScores({
                              cooperacao: -1,
                              inovacao: -1,
                              resolutividade: -1,
                              impacto_social: -1,
                              alinhamento_ods: -1,
                              replicabilidade: -1,
                            });
                            setCurrentIndex(idx);
                            setTimeout(() => {
                              const el = document.getElementById('avaliacao-card');
                              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 50);
                          }}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {loadingList ? (
                      <div className="py-8 text-center text-gray-600">Carregando trabalhos...</div>
                    ) : currentInscricao ? (
                      <div className="space-y-6">
                        <Card className="shadow-md">
                          <CardContent className="text-sm text-gray-700 pt-2 sm:pt-3">
                            <div className="flex items-start gap-4">
                              {(() => {
                                const seed = `${currentInscricao.id || ''}-${currentInscricao.titulo_iniciativa || ''}`;
                                const base = stringHash(seed);
                                const h1 = base % 360;
                                const h2 = (base * 7) % 360;
                                const c1 = `hsl(${h1}, 70%, 55%)`;
                                const c2 = `hsl(${h2}, 70%, 45%)`;
                                const words = (currentInscricao.titulo_iniciativa || '').trim().split(/\s+/).filter(Boolean);
                                const initials = `${(words[0]?.[0] || 'M').toUpperCase()}${(words[1]?.[0] || '').toUpperCase()}`;
                                return (
                                   <div aria-label="Logomarca do trabalho" title={`Logomarca: ${currentInscricao.titulo_iniciativa}`} className="w-20 h-20 border border-gray-200 rounded-md flex-shrink-0 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                    <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 30%, white, transparent 60%)' }} />
                                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm tracking-wide drop-shadow-sm select-none">{initials}</span>
                                  </div>
                                );
                              })()}
                              <div className="flex-1 min-w-0">
                                <div className="text-base font-semibold text-gray-900 leading-tight truncate">
                                  {currentInscricao.titulo_iniciativa}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                  <div>
                                    <span className="font-medium">Proponente:</span> {currentInscricao.nome_completo}
                                  </div>
                                  <div>
                                    <span className="font-medium">Lotação:</span> {currentInscricao.lotacao}
                                  </div>
                                </div>
                                <Separator className="my-3" />
                                <div>
                                  <div className="text-sm font-medium text-gray-800">Resumo Executivo:</div>
                                  <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap text-justify">
                                    {currentInscricao.descricao_iniciativa || 'Resumo não informado.'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card id="avaliacao-card" className="shadow-md">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" /> Atribuir Notas</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <TooltipProvider>
                              <div className="space-y-3">
                                <ScoreRadio label="Cooperação" infoText={currentInscricao?.cooperacao || ''} value={scores.cooperacao} invalid={showValidation && scores.cooperacao < 0} onChange={(v) => handleChange('cooperacao', v)} />
                                <ScoreRadio label="Inovação" infoText={currentInscricao?.inovacao || ''} value={scores.inovacao} invalid={showValidation && scores.inovacao < 0} onChange={(v) => handleChange('inovacao', v)} />
                                <ScoreRadio label="Resolutividade" infoText={currentInscricao?.resolutividade || ''} value={scores.resolutividade} invalid={showValidation && scores.resolutividade < 0} onChange={(v) => handleChange('resolutividade', v)} />
                                <ScoreRadio label="Impacto Social" infoText={currentInscricao?.impacto_social || ''} value={scores.impacto_social} invalid={showValidation && scores.impacto_social < 0} onChange={(v) => handleChange('impacto_social', v)} />
                                <ScoreRadio label="Alinhamento aos ODS" infoText={currentInscricao?.alinhamento_ods || ''} value={scores.alinhamento_ods} invalid={showValidation && scores.alinhamento_ods < 0} onChange={(v) => handleChange('alinhamento_ods', v)} />
                                <ScoreRadio label="Replicabilidade" infoText={currentInscricao?.replicabilidade || ''} value={scores.replicabilidade} invalid={showValidation && scores.replicabilidade < 0} onChange={(v) => handleChange('replicabilidade', v)} />
                              </div>
                            </TooltipProvider>

                            <Separator />

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">Soma automática da pontuação</div>
                              <div className="flex items-center gap-2 text-lg font-semibold">
                                <CheckCircle className="w-5 h-5 text-green-600" /> Total: {total}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              {adminState && (
                                <div className="flex items-center text-yellow-600 text-sm">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Modo visualização - Administrador (sem permissão para salvar)
                                </div>
                              )}
                              <Button 
                                onClick={handleSave} 
                                disabled={saving || !isComplete || !juradoState || isFinalized}
                                title={!juradoState ? "Apenas jurados podem salvar avaliações" : (isFinalized ? "Votação finalizada para esta categoria" : (!isComplete ? "Complete todas as categorias para salvar" : ""))}
                                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {saving ? 'Salvando...' : (votedIds.has(currentInscricao.id) ? 'Atualizar avaliação' : 'Salvar avaliação')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-600">Nenhum trabalho disponível nesta categoria.</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>

    <Dialog open={totalsOpen} onOpenChange={setTotalsOpen}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Totalização de votos da categoria</DialogTitle>
        </DialogHeader>
        {totalsLoading ? (
          <div className="py-6 text-center text-sm text-gray-600">Carregando totalização...</div>
        ) : totalsError ? (
          <Alert className="mb-2"><AlertDescription>{totalsError}</AlertDescription></Alert>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Posição</th>
                  <th className="text-left p-2 w-[320px]">Título</th>
                  <th className="text-left p-2 w-[220px]">Proponente</th>
                  <th className="text-center p-2">Avaliações</th>
                  <th className="text-center p-2">Total jurados</th>
                  <th className="text-center p-2">Total resolutividade</th>
                  <th className="text-center p-2">Total replicabilidade</th>
                </tr>
              </thead>
              <tbody>
                {totalsItems.map((it, idx) => (
                  <tr key={it.inscricao.id} className="border-t">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2 font-medium w-[320px] break-words">{it.inscricao.titulo_iniciativa}</td>
                    <td className="p-2 w-[220px] break-words">{it.inscricao.nome_completo}</td>
                    <td className="p-2 text-center">{it.avaliacoes_count}</td>
                    <td className="p-2 text-center">{it.total_geral.toFixed(2)}</td>
                    <td className="p-2 text-center">{it.total_resolutividade.toFixed(2)}</td>
                    <td className="p-2 text-center">{it.total_replicabilidade.toFixed(2)}</td>
                  </tr>
                ))}
                {totalsItems.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-gray-600" colSpan={7}>Nenhum trabalho encontrado na categoria.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="mt-2 text-xs text-gray-600 px-2 pb-2">Ordenação: maior soma de notas dos jurados; desempate por total de resolutividade e total de replicabilidade.</div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <Dialog open={myOpen} onOpenChange={setMyOpen}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Minhas avaliações da categoria</DialogTitle>
        </DialogHeader>
        {myLoading ? (
          <div className="py-6 text-center text-sm text-gray-600">Carregando...</div>
        ) : myError ? (
          <Alert className="mb-2"><AlertDescription>{myError}</AlertDescription></Alert>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2 w-[320px]">Título</th>
                  <th className="text-center p-2">Cooperação</th>
                  <th className="text-center p-2">Inovação</th>
                  <th className="text-center p-2">Resolutividade</th>
                  <th className="text-center p-2">Impacto Social</th>
                  <th className="text-center p-2">Alinhamento ODS</th>
                  <th className="text-center p-2">Replicabilidade</th>
                  <th className="text-center p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {myItems.map((it) => (
                  <tr key={it.avaliacao.id} className="border-t">
                    <td className="p-2 w-[320px] break-words">{it.inscricao.titulo_iniciativa}</td>
                    <td className="p-2 text-center">{it.avaliacao.cooperacao}</td>
                    <td className="p-2 text-center">{it.avaliacao.inovacao}</td>
                    <td className="p-2 text-center">{it.avaliacao.resolutividade}</td>
                    <td className="p-2 text-center">{it.avaliacao.impacto_social}</td>
                    <td className="p-2 text-center">{it.avaliacao.alinhamento_ods}</td>
                    <td className="p-2 text-center">{it.avaliacao.replicabilidade}</td>
                    <td className="p-2 text-center font-medium">{it.avaliacao.total}</td>
                  </tr>
                ))}
                {myItems.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-gray-600" colSpan={8}>Nenhuma avaliação registrada nesta categoria.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-2 py-3 text-sm">
              <div>
                {(() => {
                  const totalCat = inscricoes.length;
                  const done = myItems.length;
                  const pct = totalCat > 0 ? ((done / totalCat) * 100).toFixed(2) : '0.00';
                  return <span>Progresso da categoria: {done} de {totalCat} ({pct}%)</span>;
                })()}
              </div>
              <div>
                <Button
                  disabled={isFinalized || inscricoes.length === 0 || myItems.length !== inscricoes.length}
                  title={isFinalized ? 'Votação já finalizada' : (myItems.length !== inscricoes.length ? 'Conclua 100% das avaliações para finalizar' : 'Finalizar votação da categoria')}
                  onClick={async () => {
                    if (!juradoUsername || !selectedArea) return;
                    const res = await finalizeVotacao(juradoUsername, selectedArea);
                    if (res.success) {
                      setIsFinalized(true);
                      toast({ title: 'Votação finalizada', description: 'Você não poderá mais editar os votos desta categoria.' });
                    } else {
                      toast({ title: 'Erro ao finalizar', description: res.error || 'Tente novamente', variant: 'destructive' });
                    }
                  }}
                >
                  Finalizar Votação
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Modal Admin: Votos por Jurado */}
    <Dialog open={adminVotesOpen} onOpenChange={setAdminVotesOpen}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Votos por Jurado – {selectedArea || ''}</DialogTitle>
        </DialogHeader>
        {adminVotesLoading ? (
          <div className="py-6 text-center text-sm text-gray-600">Carregando...</div>
        ) : adminVotesError ? (
          <Alert className="mb-2"><AlertDescription>{adminVotesError}</AlertDescription></Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">Selecionar jurado:</div>
              <Select
                value={selectedAdminJurado}
                onValueChange={async (val) => {
                  setSelectedAdminJurado(val);
                  if (selectedArea) {
                    setAdminVotesLoading(true);
                    const res = await getMinhasAvaliacoes(val, selectedArea);
                    setAdminVotesItems(res.success ? (res.data || []) : []);
                    if (!res.success) setAdminVotesError(res.error || 'Erro ao carregar votos');
                    setAdminVotesLoading(false);
                  }
                }}
              >
                <SelectTrigger className="min-w-[28rem] w-[28rem]"><SelectValue placeholder="Escolha o jurado" /></SelectTrigger>
                <SelectContent>
                  {juradosList.map(j => (
                    <SelectItem key={j.username} value={j.username}>{j.name} ({j.username})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2 w-[320px]">Título</th>
                    <th className="text-center p-2">Cooperação</th>
                    <th className="text-center p-2">Inovação</th>
                    <th className="text-center p-2">Resolutividade</th>
                    <th className="text-center p-2">Impacto Social</th>
                    <th className="text-center p-2">Alinhamento ODS</th>
                    <th className="text-center p-2">Replicabilidade</th>
                    <th className="text-center p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {adminVotesItems.map((it) => (
                    <tr key={it.avaliacao.id} className="border-t">
                      <td className="p-2 w-[320px] break-words">{it.inscricao.titulo_iniciativa}</td>
                      <td className="p-2 text-center">{it.avaliacao.cooperacao}</td>
                      <td className="p-2 text-center">{it.avaliacao.inovacao}</td>
                      <td className="p-2 text-center">{it.avaliacao.resolutividade}</td>
                      <td className="p-2 text-center">{it.avaliacao.impacto_social}</td>
                      <td className="p-2 text-center">{it.avaliacao.alinhamento_ods}</td>
                      <td className="p-2 text-center">{it.avaliacao.replicabilidade}</td>
                      <td className="p-2 text-center font-medium">{it.avaliacao.total}</td>
                    </tr>
                  ))}
                  {adminVotesItems.length === 0 && (
                    <tr>
                      <td className="p-4 text-center text-gray-600" colSpan={8}>Nenhum voto do jurado nesta categoria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};

const ScoreRadio: React.FC<{ label: string; infoText?: string; value: number; invalid?: boolean; onChange: (v: number) => void }> = ({ label, infoText, value, invalid, onChange }) => {
  const inputIdBase = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
          {label}
          {infoText && infoText.trim() !== '' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label={`Detalhes de ${label}`} className="inline-flex items-center justify-center rounded-sm border border-transparent hover:border-gray-300 p-0.5 text-gray-500 hover:text-gray-700 bg-transparent">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" sideOffset={6} className="max-w-[40rem] p-3 text-[13px] text-gray-700 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-md shadow-xl ring-1 ring-black/5">
                <div className="text-[13px] font-normal leading-relaxed whitespace-pre-wrap text-justify break-words">
                  {infoText}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-3">
          <RadioGroup className="flex items-center gap-2" value={String(value)} onValueChange={(v) => onChange(Number(v))}>
            {scoreOptions.map((opt) => {
              const id = `${inputIdBase}-${opt}`;
              return (
                <div key={opt} className="flex items-center gap-1">
                  <RadioGroupItem value={String(opt)} id={id} className="h-3.5 w-3.5" />
                  <Label htmlFor={id} className="text-xs text-gray-700">{opt}</Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>
      {invalid && (
        <div className="mt-1 text-xs text-red-600">Selecione uma nota</div>
      )}
    </div>
  );
};

export default AdminJulgamento;
