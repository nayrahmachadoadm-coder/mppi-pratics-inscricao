import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getInscricoesStats, getAllInscricoes, AdminInscricaoData, InscricaoFilters } from '@/lib/adminService';
import { hasRole, currentUserMustChangePassword } from '@/lib/auth';
import { Key, Users, Award, Trash2, Clock, Calendar, AlertTriangle, CheckCircle2, ArrowUpDown, Layers, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DeleteInscricaoModal, { InscricaoDeleteTarget } from '@/components/DeleteInscricaoModal';
import { formatDateTime } from '@/utils/date';
import { analyzeDuplicates, sortInscricoes, InscricaoSortOption } from '@/utils/duplicateInscricoes';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica';

const categorias: { key: CategoriaKey; lines: [string, string] }[] = [
  { key: 'finalistica-projeto', lines: ['Projetos', 'Finalísticos'] },
  { key: 'estruturante-projeto', lines: ['Projetos', 'Estruturantes'] },
  { key: 'finalistica-pratica', lines: ['Práticas', 'Finalísticas'] },
  { key: 'estruturante-pratica', lines: ['Práticas', 'Estruturantes'] },
];

const AdminCategorias = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Estados para exclusão com confirmação em duas etapas
  const [itemToDelete, setItemToDelete] = useState<InscricaoDeleteTarget | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Estado para exibição inline da lista
  const [selectedArea, setSelectedArea] = useState<CategoriaKey | null>(null);
  const [inscricoes, setInscricoes] = useState<AdminInscricaoData[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;

  // Filtros e ordenação para análise de duplicidades
  const [sortBy, setSortBy] = useState<InscricaoSortOption>('duplicates');
  const [onlyDuplicates, setOnlyDuplicates] = useState<boolean>(false);

  const areaLabelMap: Record<string, string> = {
    'finalistica-projeto': 'Projetos Finalísticos',
    'estruturante-projeto': 'Projetos Estruturantes',
    'finalistica-pratica': 'Práticas Finalísticas',
    'estruturante-pratica': 'Práticas Estruturantes'
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getInscricoesStats();
      if (res.success && res.data) {
        const map: Record<string, number> = {};
        res.data.por_area.forEach((item) => {
          map[item.area] = item.count;
        });
        setCounts(map);
      } else {
        setError(res.error || 'Erro ao obter estatísticas');
      }
    } catch (e) {
      setError('Erro inesperado ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadList = async () => {
    if (!selectedArea) return;
    try {
      setListLoading(true);
      setListError('');
      const filters: InscricaoFilters = { area_atuacao: selectedArea };
      const res = await getAllInscricoes(currentPage, itemsPerPage, filters);
      if (res.success) {
        setInscricoes(res.data || []);
        // Scroll suave para a seção da lista
        setTimeout(() => {
          const el = document.getElementById('lista-inscritos');
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      } else {
        setListError(res.error || 'Erro ao carregar inscrições');
        setInscricoes([]);
      }
    } catch (e) {
      setListError('Erro inesperado ao carregar inscrições');
      setInscricoes([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    const checkRole = async () => {
      const admin = await hasRole('admin');
      setIsAdmin(admin);
    };
    checkRole();
    loadStats();
  }, []);

  // Ler parâmetro da URL para selecionar categoria automaticamente
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoriaParam = searchParams.get('categoria') as CategoriaKey;
    
    if (categoriaParam && categorias.some(cat => cat.key === categoriaParam)) {
      setSelectedArea(categoriaParam);
      setCurrentPage(1);
    }
  }, [location.search]);

  // Análise de duplicidades para cumprimento das regras do Edital (item 6.3)
  const duplicateAnalysis = useMemo(() => {
    return analyzeDuplicates(inscricoes);
  }, [inscricoes]);

  // Inscrições filtradas e ordenadas para exibição
  const displayedInscricoes = useMemo(() => {
    let list = inscricoes;
    if (onlyDuplicates) {
      list = list.filter((item) => duplicateAnalysis.metaById.get(item.id)?.isDuplicate);
    }
    return sortInscricoes(list, sortBy, duplicateAnalysis);
  }, [inscricoes, onlyDuplicates, sortBy, duplicateAnalysis]);

  // Carregar lista quando uma categoria é selecionada ou a página muda
  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea, currentPage]);

  const handleDeleteSuccess = async (deletedId: string) => {
    setInscricoes((prev) => prev.filter((item) => item.id !== deletedId));
    await loadStats();
    await loadList();
  };

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
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-5 h-5" />
              Inscritos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {categorias.map(({ key, lines }) => (
                <Button
                  key={key}
                  variant="default"
                  className={`group relative flex flex-col items-center justify-center h-24 px-3 py-2 text-center shadow-md transition-all duration-200 border rounded-xl ${selectedArea === key ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]' : 'bg-white text-gray-900 border-gray-200 hover:shadow-xl hover:bg-primary hover:text-white'}`}
                  disabled={loading}
                  onClick={() => { setSelectedArea(key); setCurrentPage(1); }}
                >
                  <span className={`font-semibold leading-tight whitespace-normal break-words text-sm ${selectedArea === key ? 'text-white' : 'text-gray-900 group-hover:text-white'}`}>
                    {lines[0]}<br />{lines[1]}
                  </span>
                  <span className={`mt-1 text-xs ${selectedArea === key ? 'text-primary-foreground' : 'text-gray-500 group-hover:text-primary-foreground'}`}>
                    Inscrições: {counts[key] ?? 0}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista inline de inscritos */}
        {selectedArea && (
          <section id="lista-inscritos" className="mt-4 scroll-mt-24">
            <Card className="shadow-lg border rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Award className="w-5 h-5" /> Trabalhos da Categoria
                    </CardTitle>
                    <p className="text-xs text-gray-600 mt-0.5">{areaLabelMap[selectedArea]}</p>
                  </div>

                  {/* Controles de Ordenação e Filtro */}
                  <div className="flex items-center flex-wrap gap-2 text-xs">
                    <span className="text-gray-500 font-medium">Ordenar:</span>
                    <div className="inline-flex rounded-md shadow-xs border border-gray-200 bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => setSortBy('duplicates')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          sortBy === 'duplicates'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Agrupa versões duplicadas lado a lado"
                      >
                        Agrupar Duplicidades
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy('recent')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          sortBy === 'recent'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Inscrições mais recentes primeiro"
                      >
                        Mais Recentes
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy('oldest')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          sortBy === 'oldest'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Inscrições mais antigas primeiro"
                      >
                        Mais Antigas
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy('title')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          sortBy === 'title'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Ordem alfabética de título"
                      >
                        Título (A-Z)
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {listError && (
                  <Alert variant="destructive" className="mb-3">
                    <AlertDescription>{listError}</AlertDescription>
                  </Alert>
                )}

                {/* Banner de Aviso de Duplicidades / Múltiplos Envios (Regra do Edital 6.3) */}
                {duplicateAnalysis.hasDuplicates && (
                  <div className="mb-4 bg-amber-50/90 border border-amber-300/80 rounded-lg p-3 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-amber-900">
                          Regra do Edital (Item 6.3) – Detecção de Múltiplas Inscrições
                        </div>
                        <p className="text-amber-800 mt-0.5 leading-relaxed">
                          Foram detectadas <strong>{duplicateAnalysis.totalDuplicateInscricoes} inscrições</strong> ({duplicateAnalysis.duplicateGroupsCount} grupos de trabalho/proponente com múltiplos envios).
                          O Edital estabelece que se houver mais de uma inscrição do mesmo participante/trabalho, <strong>apenas a última inscrição encaminhada será considerada válida</strong>.
                          {duplicateAnalysis.totalOlderInscricoes > 0 && (
                            <span className="font-semibold text-amber-950 block sm:inline mt-0.5 sm:mt-0">
                              {' '}Existe(m) {duplicateAnalysis.totalOlderInscricoes} inscrição(ões) anterior(es) que pode(m) ser excluída(s) pelo administrador.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant={onlyDuplicates ? 'default' : 'outline'}
                        className={`h-7 text-xs font-medium ${
                          onlyDuplicates
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'border-amber-300 text-amber-900 hover:bg-amber-100 bg-white'
                        }`}
                        onClick={() => setOnlyDuplicates((prev) => !prev)}
                      >
                        {onlyDuplicates ? 'Mostrar Todas as Inscrições' : `Ver Apenas Duplicidades (${duplicateAnalysis.totalDuplicateInscricoes})`}
                      </Button>
                    </div>
                  </div>
                )}

                {listLoading ? (
                  <div className="py-8 text-center text-gray-600">Carregando inscrições...</div>
                ) : displayedInscricoes.length === 0 ? (
                  <div className="py-8 text-center text-gray-600">
                    {onlyDuplicates
                      ? 'Nenhuma duplicidade encontrada com o filtro atual.'
                      : 'Nenhum trabalho encontrado nesta categoria.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayedInscricoes.map((item) => {
                      const meta = duplicateAnalysis.metaById.get(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`group border rounded-md p-3 sm:p-4 bg-white shadow-md hover:shadow-lg transition-all cursor-pointer relative ${
                            meta?.isOlder
                              ? 'border-amber-300 bg-amber-50/20 hover:bg-amber-50/40'
                              : meta?.isLatest
                              ? 'border-emerald-300/80 bg-white hover:bg-emerald-50/20'
                              : 'border-gray-100 hover:bg-gray-50'
                          }`}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/admin/inscricao/${item.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(`/admin/inscricao/${item.id}`);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* Logomarca dinâmica com gradiente e iniciais */}
                              {(() => {
                                const seed = item.id || item.titulo_iniciativa || item.nome_completo || 'seed';
                                const h = (s: string) => {
                                  let v = 0; for (let i = 0; i < s.length; i++) { v = (v << 5) - v + s.charCodeAt(i); v |= 0; }
                                  return Math.abs(v);
                                };
                                const base = h(seed);
                                const h1 = base % 360;
                                const h2 = (base * 7) % 360;
                                const c1 = `hsl(${h1}, 70%, 55%)`;
                                const c2 = `hsl(${h2}, 70%, 45%)`;
                                const words = (item.titulo_iniciativa || '').trim().split(/\s+/).filter(Boolean);
                                const initials = `${(words[0]?.[0] || 'M').toUpperCase()}${(words[1]?.[0] || '').toUpperCase()}`;
                                return (
                                  <div aria-label="Logomarca do trabalho" title={`Logomarca: ${item.titulo_iniciativa}`} className="w-16 h-16 border border-gray-200 rounded-md flex-shrink-0 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                    <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 30%, white, transparent 60%)' }} />
                                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm tracking-wide drop-shadow-sm select-none">{initials}</span>
                                  </div>
                                );
                              })()}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate" title={item.titulo_iniciativa}>
                                  {item.titulo_iniciativa}
                                </div>
                                <div className="mt-0.5 text-xs text-gray-700 truncate">
                                  <span className="font-medium">Proponente:</span> {item.nome_completo}
                                  {item.matricula ? ` (Mat: ${item.matricula})` : ''}
                                </div>
                                <div className="mt-0.5 text-xs text-gray-600 truncate">
                                  <span className="font-medium">Lotação:</span> {item.lotacao}
                                </div>

                                {/* Data e Hora Exata da Inscrição */}
                                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-blue-900 bg-blue-50/90 border border-blue-200/70 px-2 py-0.5 rounded w-fit">
                                  <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                  <span>Inscrito em: <strong>{formatDateTime(item.created_at)}</strong></span>
                                </div>

                                {/* Indicador de Duplicidade / Conformidade com Edital */}
                                {meta?.isDuplicate && (
                                  <div className="mt-1.5">
                                    {meta.isLatest ? (
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-1.5 py-0 flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Última Inscrição (Válida)
                                        </Badge>
                                        <span className="text-[10px] text-emerald-800 font-medium">
                                          Versão {meta.positionInGroup} de {meta.totalInGroup} (Mais recente)
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <Badge variant="destructive" className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] px-1.5 py-0 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            Inscrição Anterior (Substituída)
                                          </Badge>
                                          <span className="text-[10px] text-amber-900 font-semibold">
                                            Versão {meta.positionInGroup} de {meta.totalInGroup}
                                          </span>
                                        </div>
                                        {meta.latestInscricao && (
                                          <p className="text-[10px] text-amber-800 font-medium leading-tight">
                                            Substituída pela versão de {formatDateTime(meta.latestInscricao.created_at)}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Botão de Excluir Trabalho (Apenas Administrador) */}
                            {isAdmin && (
                              <div className="flex items-center self-center flex-shrink-0 ml-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 w-8 p-0 rounded-md transition-colors ${
                                    meta?.isOlder
                                      ? 'text-red-700 bg-red-100 hover:bg-red-200 border border-red-300'
                                      : 'text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200'
                                  }`}
                                  title={
                                    meta?.isOlder
                                      ? 'Excluir esta inscrição anterior (substituída pela mais recente)'
                                      : 'Excluir trabalho inscrito'
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToDelete({
                                      id: item.id,
                                      titulo_iniciativa: item.titulo_iniciativa,
                                      nome_completo: item.nome_completo,
                                      lotacao: item.lotacao,
                                      area_atuacao: item.area_atuacao,
                                      created_at: item.created_at,
                                      isOlderDuplicate: meta?.isOlder,
                                      latestCreatedAt: meta?.latestInscricao?.created_at,
                                    });
                                    setIsDeleteModalOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="sr-only">Excluir trabalho</span>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Paginação */}
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" disabled={currentPage <= 1 || listLoading} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Anterior</Button>
              <Button variant="outline" disabled={listLoading || inscricoes.length < itemsPerPage} onClick={() => setCurrentPage((p) => p + 1)}>Próxima</Button>
            </div>
          </section>
        )}
          </main>
        </div>
      </div>

      {/* Modal de confirmação em duas etapas para exclusão */}
      <DeleteInscricaoModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        inscricao={itemToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default AdminCategorias;