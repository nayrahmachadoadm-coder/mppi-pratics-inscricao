import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, BarChart3, Download } from 'lucide-react';
import { CategoriaRankingItem, exportRelatorioCsv, getRelatorioCategoria } from '@/lib/evaluationService';

const areaLabelMap: Record<string, string> = {
  'finalistica-projeto': 'Projetos Finalísticos',
  'estruturante-projeto': 'Projetos Estruturantes',
  'finalistica-pratica': 'Práticas Finalísticas',
  'estruturante-pratica': 'Práticas Estruturantes',
  'categoria-especial-ia': 'Categoria Especial (Inteligência Artificial)'
};

const AdminRelatorioCategoria = () => {
  const navigate = useNavigate();
  const { area } = useParams();
  const [items, setItems] = useState<CategoriaRankingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const areaLabel = useMemo(() => areaLabelMap[area || ''] || (area || ''), [area]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      if (!area) {
        setError('Categoria inválida');
        return;
      }
      const res = await getRelatorioCategoria(area);
      if (res.success) {
        setItems(res.data || []);
      } else {
        setError(res.error || 'Erro ao carregar relatório');
      }
    } catch (e) {
      setError('Erro inesperado ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area]);

  const handleExportCSV = async () => {
    if (!area) return;
    const { areaLabel: label } = { areaLabel };
    const packed = exportRelatorioCsv(items, label);
    const [filename, csv] = packed.split('::');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `Relatorio_${label}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Atualização automática: refetch periódico para manter ranking em tempo real
  useEffect(() => {
    if (!area) return;
    const interval = setInterval(async () => {
      try {
        const res = await getRelatorioCategoria(area);
        setItems(res.data || []);
      } catch (e) {
        // silencioso
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [area]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Ícone" className="h-6 w-6 opacity-80" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Relatório da Categoria</h1>
              <p className="text-sm text-gray-600">{areaLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-md">
          <CardHeader className="bg-[hsl(var(--primary))] text-white rounded-t-md">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ranking e Estatísticas</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 text-white hover:bg-white/20 focus-visible:ring-white/40"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/admin/categoria/${area}`)}
                  className="flex items-center gap-2 text-white hover:bg-white/20 focus-visible:ring-white/40"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar à lista
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-gray-600">Carregando relatório...</div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-gray-600">Nenhuma avaliação registrada nesta categoria.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posição</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Proponente</TableHead>
                      <TableHead>Lotação</TableHead>
                      <TableHead className="text-center">Número de Avaliações</TableHead>
                      <TableHead className="text-center">Total Geral</TableHead>
                      <TableHead className="text-center">Total Resolutividade</TableHead>
                      <TableHead className="text-center">Total Replicabilidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={item.inscricao.id}>
                        <TableCell className="font-semibold">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{item.inscricao.titulo_iniciativa}</TableCell>
                        <TableCell>{item.inscricao.nome_completo}</TableCell>
                        <TableCell>{item.inscricao.lotacao}</TableCell>
                        <TableCell className="text-center">{item.avaliacoes_count}</TableCell>
                        <TableCell className="text-center">{Math.round(item.total_geral)}</TableCell>
                        <TableCell className="text-center">{Math.round((item.media_resolutividade || 0) * (item.avaliacoes_count || 0))}</TableCell>
                        <TableCell className="text-center">{Math.round((item.media_replicabilidade || 0) * (item.avaliacoes_count || 0))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminRelatorioCategoria;