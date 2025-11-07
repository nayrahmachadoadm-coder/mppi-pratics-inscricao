import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getCurrentProfile } from '@/lib/auth';
import { getMinhasAvaliacoes, MinhasAvaliacaoItem, exportMinhasAvaliacoesCsv } from '@/lib/evaluationService';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica' | 'categoria-especial-ia';

const categorias: { key: CategoriaKey; label: string }[] = [
  { key: 'finalistica-projeto', label: 'Projetos Finalísticos' },
  { key: 'estruturante-projeto', label: 'Projetos Estruturantes' },
  { key: 'finalistica-pratica', label: 'Práticas Finalísticas' },
  { key: 'estruturante-pratica', label: 'Práticas Estruturantes' },
  { key: 'categoria-especial-ia', label: 'Categoria Especial (IA)' },
];

const JuradoMinhasAvaliacoes: React.FC = () => {
  const [juradoUsername, setJuradoUsername] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<CategoriaKey | ''>('');
  const [items, setItems] = useState<MinhasAvaliacaoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const areaLabel = useMemo(() => {
    const found = categorias.find(c => c.key === selectedArea);
    return found?.label || '';
  }, [selectedArea]);

  useEffect(() => {
    const init = async () => {
      const profile = await getCurrentProfile();
      const username = profile?.username || '';
      setJuradoUsername(username);
    };
    init();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!juradoUsername) return;
      try {
        setLoading(true);
        setError('');
        const res = await getMinhasAvaliacoes(juradoUsername, selectedArea || undefined);
        if (!res.success) {
          setError(res.error || 'Erro ao carregar suas avaliações');
          setItems([]);
          return;
        }
        setItems(res.data || []);
      } catch {
        setError('Erro inesperado ao carregar suas avaliações');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [juradoUsername, selectedArea]);

  const handleExport = () => {
    const packed = exportMinhasAvaliacoesCsv(items, areaLabel);
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Minhas avaliações</CardTitle>
                    <p className="text-xs text-white/90">Filtre por categoria e exporte suas notas.</p>
                    {juradoUsername && (
                      <p className="text-xs text-white/90 mt-1">Jurado: <span className="font-medium">{juradoUsername}</span></p>
                    )}
                  </div>
                  <div>
                    <Button variant="outline" className="text-white border-white/40 hover:bg-white/10" onClick={handleExport} disabled={items.length === 0}>Exportar CSV</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <Button
                    key={'todas'}
                    variant="default"
                    className={`h-12 px-2 py-2 text-center border rounded-xl shadow-sm ${selectedArea === '' ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]' : 'bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white'}`}
                    onClick={() => setSelectedArea('')}
                  >
                    <span className="text-sm font-semibold">Todas</span>
                  </Button>
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

                {error && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Separator className="my-4" />

                {loading ? (
                  <div className="py-8 text-center text-gray-600">Carregando suas avaliações...</div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-[hsl(var(--primary))] text-white">
                        <TableRow>
                          <TableHead className="text-white">Título</TableHead>
                          <TableHead className="text-white">Área</TableHead>
                          <TableHead className="text-white text-center">Total</TableHead>
                          <TableHead className="text-white text-center">Resolutividade</TableHead>
                          <TableHead className="text-white text-center">Replicabilidade</TableHead>
                          <TableHead className="text-white">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((it) => (
                          <TableRow key={it.avaliacao.id}>
                            <TableCell className="font-medium">{it.inscricao?.titulo_iniciativa || '—'}</TableCell>
                            <TableCell>{it.inscricao?.area_atuacao || '—'}</TableCell>
                            <TableCell className="text-center">{(it.avaliacao?.total ?? 0).toFixed(2)}</TableCell>
                            <TableCell className="text-center">{it.avaliacao?.resolutividade ?? 0}</TableCell>
                            <TableCell className="text-center">{it.avaliacao?.replicabilidade ?? 0}</TableCell>
                            <TableCell>{(it.avaliacao?.created_at || '').slice(0, 19).replace('T',' ')}</TableCell>
                          </TableRow>
                        ))}
                        {items.length === 0 && !loading && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-600 py-6">Você ainda não possui avaliações neste filtro.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default JuradoMinhasAvaliacoes;