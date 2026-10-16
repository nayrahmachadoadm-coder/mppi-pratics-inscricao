import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllInscricoes, AdminInscricaoData, InscricaoFilters } from '@/lib/adminService';
import { ArrowLeft, Eye, Award, BarChart3, Trash2, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { hasRole } from '@/lib/auth';
import DeleteInscricaoModal, { InscricaoDeleteTarget } from '@/components/DeleteInscricaoModal';
import { formatDateTime } from '@/utils/date';
import { analyzeDuplicates, sortInscricoes, InscricaoSortOption } from '@/utils/duplicateInscricoes';

const areaLabelMap: Record<string, string> = {
  'finalistica-projeto': 'Projetos Finalísticos',
  'estruturante-projeto': 'Projetos Estruturantes',
  'finalistica-pratica': 'Práticas Finalísticas',
  'estruturante-pratica': 'Práticas Estruturantes'
};

// Geração de logomarca dinâmica com base em um seed (id/título)
function stringHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function getLogoColors(seed: string) {
  const base = stringHash(seed);
  const h1 = base % 360;
  const h2 = (base * 7) % 360;
  return {
    c1: hsl(h1, 70, 55),
    c2: hsl(h2, 70, 45),
  };
}

function getInitials(title?: string) {
  const words = (title || '').trim().split(/\s+/).filter(Boolean);
  const a = (words[0]?.[0] || 'M').toUpperCase();
  const b = (words[1]?.[0] || '').toUpperCase();
  return `${a}${b}`;
}

const AdminCategoriaList = () => {
  const navigate = useNavigate();
  const { area } = useParams();
  const [inscricoes, setInscricoes] = useState<AdminInscricaoData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InscricaoDeleteTarget | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const itemsPerPage = 50;

  // Filtros e ordenação para análise de duplicidades
  const [sortBy, setSortBy] = useState<InscricaoSortOption>('duplicates');
  const [onlyDuplicates, setOnlyDuplicates] = useState<boolean>(false);

  const areaLabel = useMemo(() => areaLabelMap[area || ''] || (area || ''), [area]);

  useEffect(() => {
    checkRole();
    load();
  }, [area, currentPage]);

  const checkRole = async () => {
    const admin = await hasRole('admin');
    setIsAdmin(admin);
  };

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const filters: InscricaoFilters = {};
      if (area) {
        filters.area_atuacao = area;
      }
      const res = await getAllInscricoes(currentPage, itemsPerPage, filters);
      if (res.success) {
        setInscricoes(res.data || []);
      } else {
        setError(res.error || 'Erro ao carregar inscrições');
      }
    } catch (e) {
      setError('Erro inesperado ao carregar inscrições');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, currentPage]);

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

  const handleDeleteSuccess = (deletedId: string) => {
    setInscricoes((prev) => prev.filter((item) => item.id !== deletedId));
    load();
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="min-h-[72vh] flex items-center justify-center">
          <main className="w-full">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border rounded-xl">
          <CardHeader className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] text-[hsl(var(--primary-foreground))] rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-5 h-5" /> Trabalhos da Categoria
              </CardTitle>
              <div className="flex items-center gap-2">
                {area && isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Relatório da categoria"
                    className="text-[hsl(var(--primary-foreground))] hover:text-white hover:bg-white/10"
                    onClick={() => navigate(`/admin/relatorio/${encodeURIComponent(area)}`)}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Voltar aos inscritos"
                  className="text-[hsl(var(--primary-foreground))] hover:text-white hover:bg-white/10"
                  onClick={() => navigate('/admin/inscritos')}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 pt-2 border-t border-white/20">
              <p className="text-xs opacity-90">{areaLabel}</p>

              {/* Controles de Ordenação e Filtro */}
              <div className="flex items-center flex-wrap gap-1.5 text-xs">
                <span className="text-[hsl(var(--primary-foreground))] opacity-90 text-[11px] font-medium">Ordenar:</span>
                <div className="inline-flex rounded-md shadow-xs bg-white/10 p-0.5 text-white">
                  <button
                    type="button"
                    onClick={() => setSortBy('duplicates')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      sortBy === 'duplicates'
                        ? 'bg-white text-primary font-bold shadow-xs'
                        : 'text-white/90 hover:bg-white/20'
                    }`}
                    title="Agrupa versões duplicadas lado a lado"
                  >
                    Duplicidades
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('recent')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      sortBy === 'recent'
                        ? 'bg-white text-primary font-bold shadow-xs'
                        : 'text-white/90 hover:bg-white/20'
                    }`}
                    title="Inscrições mais recentes primeiro"
                  >
                    Mais Recentes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('oldest')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      sortBy === 'oldest'
                        ? 'bg-white text-primary font-bold shadow-xs'
                        : 'text-white/90 hover:bg-white/20'
                    }`}
                    title="Inscrições mais antigas primeiro"
                  >
                    Mais Antigas
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('title')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      sortBy === 'title'
                        ? 'bg-white text-primary font-bold shadow-xs'
                        : 'text-white/90 hover:bg-white/20'
                    }`}
                    title="Ordem alfabética de título"
                  >
                    Título (A-Z)
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
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

              {loading ? (
                <div className="py-10 text-center text-gray-600">Carregando inscrições...</div>
              ) : displayedInscricoes.length === 0 ? (
                <div className="py-10 text-center text-gray-600">
                  {onlyDuplicates
                    ? 'Nenhuma duplicidade encontrada nesta categoria.'
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
                              const { c1, c2 } = getLogoColors(seed);
                              const initials = getInitials(item.titulo_iniciativa);
                              return (
                                <div
                                  aria-label="Logomarca do trabalho"
                                  title={`Logomarca: ${item.titulo_iniciativa}`}
                                  className="w-16 h-16 border border-gray-200 rounded-md flex-shrink-0 relative overflow-hidden"
                                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                                >
                                  <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 30%, white, transparent 60%)' }} />
                                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm tracking-wide drop-shadow-sm select-none">
                                    {initials}
                                  </span>
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
        {/* Paginação simples */}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Anterior</Button>
          <Button variant="outline" disabled={loading || inscricoes.length < itemsPerPage} onClick={() => setCurrentPage((p) => p + 1)}>Próxima</Button>
        </div>
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

export default AdminCategoriaList;