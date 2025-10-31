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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Ícone" className="h-6 w-6 opacity-80" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Trabalhos da Categoria</h1>
              <p className="text-sm text-gray-600">{areaLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {area && (
              <Button variant="secondary" onClick={() => navigate(`/admin/relatorio/${encodeURIComponent(area)}`)} className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Relatório da categoria
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/admin/categorias')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar às categorias
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Inscrições</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-gray-600">Carregando inscrições...</div>
            ) : inscricoes.length === 0 ? (
              <div className="py-10 text-center text-gray-600">Nenhum trabalho encontrado nesta categoria.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Proponente</TableHead>
                      <TableHead>Lotação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inscricoes.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.titulo_iniciativa}</TableCell>
                        <TableCell>{item.nome_completo}</TableCell>
                        <TableCell>{item.lotacao}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="secondary" size="sm" className="inline-flex items-center gap-2" onClick={() => navigate(`/admin/inscricao/${item.id}`)}>
                              <Eye className="w-4 h-4" /> Ver detalhes
                            </Button>
                            <Button variant="default" size="sm" className="inline-flex items-center gap-2" onClick={() => navigate(`/admin/avaliacao/${item.id}`)}>
                              <Award className="w-4 h-4" /> Avaliar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
  );
};

export default AdminCategoriaList;