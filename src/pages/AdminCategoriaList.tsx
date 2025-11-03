import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllInscricoes, AdminInscricaoData, InscricaoFilters } from '@/lib/adminService';
import { ArrowLeft, Eye, Award, BarChart3 } from 'lucide-react';

const areaLabelMap: Record<string, string> = {
  'finalistica-projeto': 'Projetos Finalísticos',
  'estruturante-projeto': 'Projetos Estruturantes',
  'finalistica-pratica': 'Práticas Finalísticas',
  'estruturante-pratica': 'Práticas Estruturantes',
  'categoria-especial-ia': 'Categoria Especial (Inteligência Artificial)'
};

const AdminCategoriaList = () => {
  const navigate = useNavigate();
  const { area } = useParams();
  const [inscricoes, setInscricoes] = useState<AdminInscricaoData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const areaLabel = useMemo(() => areaLabelMap[area || ''] || (area || ''), [area]);

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
                {area && (
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
                  title="Voltar às categorias"
                  className="text-[hsl(var(--primary-foreground))] hover:text-white hover:bg-white/10"
                  onClick={() => navigate('/admin/categorias')}
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
                <div className="space-y-3">
                  {sortedInscricoes.map((item) => (
                    <div
                      key={item.id}
                      className="group border border-gray-100 rounded-md p-3 sm:p-4 bg-white shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
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
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver detalhes"
                            className="text-gray-700 hover:text-primary"
                            onClick={() => navigate(`/admin/inscricao/${item.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Avaliar"
                            className="text-gray-700 hover:text-primary"
                            onClick={() => navigate(`/admin/avaliacao/${item.id}`)}
                          >
                            <Award className="w-4 h-4" />
                          </Button>
                        </div>
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