import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { exportJurorAveragesCsv, getJurorAveragesByCategoria, JurorAverageItem } from '@/lib/evaluationService';

const areaLabels: Record<string, string> = {
  'finalistica-projeto': 'Projetos Finalísticos',
  'estruturante-projeto': 'Projetos Estruturantes',
  'finalistica-pratica': 'Práticas Finalísticas',
  'estruturante-pratica': 'Práticas Estruturantes',
  'categoria-especial-ia': 'Categoria Especial (IA)'
};

const AdminRelatorioJurados: React.FC = () => {
  const { area } = useParams<{ area: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [items, setItems] = useState<JurorAverageItem[]>([]);

  const areaLabel = useMemo(() => areaLabels[area || ''] || (area || ''), [area]);

  useEffect(() => {
    const load = async () => {
      if (!area) return;
      try {
        setLoading(true);
        setError('');
        const res = await getJurorAveragesByCategoria(area);
        if (!res.success) {
          setError(res.error || 'Erro ao gerar relatório de jurados');
          setItems([]);
          return;
        }
        setItems(res.data || []);
      } catch {
        setError('Erro inesperado ao gerar relatório');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [area]);

  const handleExport = () => {
    const packed = exportJurorAveragesCsv(items, areaLabel);
    const [filename, csv] = packed.split('::');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="min-h-[72vh]">
          <main className="w-full pt-4">
            <Card className="shadow-lg border rounded-xl">
              <CardHeader className="pb-2 bg-[hsl(var(--primary))] text-white rounded-t-xl">
                <CardTitle className="text-base">Relatório de Jurados – {areaLabel}</CardTitle>
                <p className="text-xs text-white/90">Média das avaliações por jurado na categoria selecionada.</p>
              </CardHeader>
              <CardContent className="pt-3">
                {error && (
                  <Alert variant="destructive" className="mb-3">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-700">Total de jurados: {items.length}</div>
                  <Button variant="default" onClick={handleExport} disabled={loading || items.length === 0}>Exportar CSV</Button>
                </div>
                <Separator className="my-2" />

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[hsl(var(--primary))] text-white">
                      <TableRow>
                        <TableHead className="text-white">Posição</TableHead>
                        <TableHead className="text-white">Usuário (jurado)</TableHead>
                        <TableHead className="text-white">Nome</TableHead>
                        <TableHead className="text-white">Vaga</TableHead>
                        <TableHead className="text-white text-center">Avaliações</TableHead>
                        <TableHead className="text-white text-center">Média Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it, idx) => (
                        <TableRow key={`${it.jurado_username}-${idx}`}>
                          <TableCell className="font-medium">{idx + 1}</TableCell>
                          <TableCell>{it.jurado_username}</TableCell>
                          <TableCell>{it.full_name || '—'}</TableCell>
                          <TableCell>{it.seat_label || '—'}</TableCell>
                          <TableCell className="text-center">{it.count}</TableCell>
                          <TableCell className="text-center">{it.media_total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {items.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-600 py-6">Nenhuma avaliação registrada nesta categoria.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorioJurados;