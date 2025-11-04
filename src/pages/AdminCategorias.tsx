import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getInscricoesStats, getAllInscricoes, AdminInscricaoData, InscricaoFilters } from '@/lib/adminService';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { currentUserMustChangePassword, isUserRole } from '@/lib/userAuth';
import { Key } from 'lucide-react';
import { Users } from 'lucide-react';
import { Award } from 'lucide-react';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica' | 'categoria-especial-ia';

const categorias: { key: CategoriaKey; lines: [string, string] }[] = [
  { key: 'finalistica-projeto', lines: ['Projetos', 'Finalísticos'] },
  { key: 'estruturante-projeto', lines: ['Projetos', 'Estruturantes'] },
  { key: 'finalistica-pratica', lines: ['Práticas', 'Finalísticas'] },
  { key: 'estruturante-pratica', lines: ['Práticas', 'Estruturantes'] },
  { key: 'categoria-especial-ia', lines: ['Categoria Especial', '(Inteligência Artificial)'] },
];

const AdminCategorias = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Estado para exibição inline da lista
  const [selectedArea, setSelectedArea] = useState<CategoriaKey | null>(null);
  const [inscricoes, setInscricoes] = useState<AdminInscricaoData[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const areaLabelMap: Record<string, string> = {
    'finalistica-projeto': 'Projetos Finalísticos',
    'estruturante-projeto': 'Projetos Estruturantes',
    'finalistica-pratica': 'Práticas Finalísticas',
    'estruturante-pratica': 'Práticas Estruturantes',
    'categoria-especial-ia': 'Categoria Especial (Inteligência Artificial)'
  };

  useEffect(() => {
    const load = async () => {
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
    load();
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

  // Ordenação alfabética por título da iniciativa
  const sortedInscricoes = useMemo(() => {
    return [...inscricoes].sort((a, b) => (a.titulo_iniciativa || '').localeCompare(b.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' }));
  }, [inscricoes]);

  // Carregar lista quando uma categoria é selecionada ou a página muda
  useEffect(() => {
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
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea, currentPage]);

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
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-5 h-5" /> Trabalhos da Categoria
                </CardTitle>
                <p className="text-xs text-gray-600">{areaLabelMap[selectedArea]}</p>
              </CardHeader>
              <CardContent className="pt-3">
                {listError && (
                  <Alert variant="destructive" className="mb-3">
                    <AlertDescription>{listError}</AlertDescription>
                  </Alert>
                )}
                {listLoading ? (
                  <div className="py-8 text-center text-gray-600">Carregando inscrições...</div>
                ) : inscricoes.length === 0 ? (
                  <div className="py-8 text-center text-gray-600">Nenhum trabalho encontrado nesta categoria.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sortedInscricoes.map((item) => (
                      <div
                        key={item.id}
                        className="group border border-gray-100 rounded-md p-3 sm:p-4 bg-white shadow-lg hover:shadow-xl transition-shadow hover:bg-gray-50 cursor-pointer"
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
                              <div className="text-sm font-semibold text-gray-900 truncate">{item.titulo_iniciativa}</div>
                              <div className="mt-0.5 text-xs text-gray-700 truncate"><span className="font-medium">Proponente:</span> {item.nome_completo}</div>
                              <div className="mt-0.5 text-xs text-gray-600 truncate"><span className="font-medium">Lotação:</span> {item.lotacao}</div>
                            </div>
                          </div>
                          {/* Botões removidos: o container inteiro é clicável para ver detalhes */}
                        </div>
                      </div>
                    ))}
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
    </div>
  );
};

export default AdminCategorias;