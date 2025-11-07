import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllInscricoes, AdminInscricaoData, InscricaoFilters } from '@/lib/adminService';
import { ArrowLeft, Eye, Award, BarChart3 } from 'lucide-react';
import { hasRole } from '@/lib/auth';

const areaLabelMap: Record<string, string> = {
  'finalistica-projeto': 'Projetos Finalísticos',
  'estruturante-projeto': 'Projetos Estruturantes',
  'finalistica-pratica': 'Práticas Finalísticas',
  'estruturante-pratica': 'Práticas Estruturantes',
  'categoria-especial-ia': 'Categoria Especial (Inteligência Artificial)'
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
  const itemsPerPage = 10;

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

  // Ordenação alfabética por título da iniciativa
  const sortedInscricoes = useMemo(() => {
    return [...inscricoes].sort((a, b) => (a.titulo_iniciativa || '').localeCompare(b.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' }));
  }, [inscricoes]);

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
            <p className="text-xs opacity-80">{areaLabel}</p>
          </CardHeader>
          <CardContent className="pt-4">
              {loading ? (
                <div className="py-10 text-center text-gray-600">Carregando inscrições...</div>
              ) : inscricoes.length === 0 ? (
                <div className="py-10 text-center text-gray-600">Nenhum trabalho encontrado nesta categoria.</div>
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
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {item.titulo_iniciativa}
                            </div>
                            <div className="mt-0.5 text-xs text-gray-700 truncate">
                              <span className="font-medium">Proponente:</span> {item.nome_completo}
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 truncate">
                              <span className="font-medium">Lotação:</span> {item.lotacao}
                            </div>
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
        {/* Paginação simples */}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Anterior</Button>
          <Button variant="outline" disabled={loading || inscricoes.length < itemsPerPage} onClick={() => setCurrentPage((p) => p + 1)}>Próxima</Button>
        </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriaList;