import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, Download, Trophy, Award, CheckCircle, Info, Calculator, Users } from 'lucide-react';
import { CategoriaRankingItem, exportRelatorioCsv, getRelatorioCategoria } from '@/lib/evaluationService';

const areaLabelMap: Record<string, string> = {
  'finalistica-projeto': 'Projetos Finalísticos',
  'estruturante-projeto': 'Projetos Estruturantes',
  'finalistica-pratica': 'Práticas Finalísticas',
  'estruturante-pratica': 'Práticas Estruturantes'
};

const AdminRelatorioCategoria: React.FC = () => {
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
    const packed = exportRelatorioCsv(items, areaLabel);
    const [filename, csv] = packed.split('::');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `Relatorio_${areaLabel}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Atualização periódica discreta em tempo real
  useEffect(() => {
    if (!area) return;
    const interval = setInterval(async () => {
      try {
        const res = await getRelatorioCategoria(area);
        if (res.success && res.data) {
          setItems(res.data);
        }
      } catch {
        // silencioso
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [area]);

  const maxVotos = useMemo(() => {
    return items.reduce((max, it) => Math.max(max, it.votos_populares || 0), 0);
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">Relatório Oficial de Apuração e Classificação</h1>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">Edital nº 88/2026</Badge>
              </div>
              <p className="text-sm font-medium text-gray-600">{areaLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={items.length === 0}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
            >
              <Download className="w-4 h-4 text-gray-700" /> Exportar CSV Completo
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/admin/categoria/${area}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar à Categoria
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Card Explicativo das Regras do Edital */}
        <Card className="border border-blue-100 bg-gradient-to-r from-blue-50/70 via-white to-blue-50/40 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
              <Calculator className="w-4 h-4 text-blue-700" />
              Composição da Pontuação e Regras de Cálculo (Itens 8.1 a 8.9 do Edital nº 88/2026)
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs">
                <div className="font-semibold text-blue-950 flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  1. Nota Técnica (Peso: 80%)
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Média aritmética das notas válidas atribuídas pela Comissão Julgadora convertida para escala 0 a 100:
                </p>
                <code className="mt-1 block p-1.5 bg-blue-50/80 rounded text-[11px] font-mono text-blue-900 font-bold">
                  (Média das notas válidas ÷ 25) × 100
                </code>
                <span className="text-[10px] text-gray-500 block mt-1">
                  *Ausência ou impedimento de jurado não conta como zero nem integra o divisor (item 8.2.3).
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs">
                <div className="font-semibold text-blue-950 flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  2. Nota Popular (Peso: 20%)
                </div>
                <p className="text-gray-600 leading-relaxed">
                  A iniciativa mais votada na categoria recebe 100 pontos, sendo as demais proporcionais:
                </p>
                <code className="mt-1 block p-1.5 bg-blue-50/80 rounded text-[11px] font-mono text-blue-900 font-bold">
                  (Votos válidos ÷ Maior votação da cat.) × 100
                </code>
                <span className="text-[10px] text-gray-500 block mt-1">
                  *Calculada separadamente em cada categoria (item 8.4 e 8.5).
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs">
                <div className="font-semibold text-blue-950 flex items-center gap-1.5 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  3. Pontuação Final (0 a 100)
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Composição ponderada com até 2 casas decimais (itens 8.6, 8.7 e 8.8):
                </p>
                <code className="mt-1 block p-1.5 bg-blue-50/80 rounded text-[11px] font-mono text-blue-900 font-bold">
                  (Nota Técnica × 0,80) + (Nota Popular × 0,20)
                </code>
                <span className="text-[10px] text-gray-500 block mt-1">
                  *Top 3 iniciativas com as maiores pontuações são declaradas vencedoras.
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/60 rounded-md border border-blue-200/60 text-[11px] text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong>Critérios Sucessivos de Desempate (Item 8.9):</strong> I — Maior Nota Técnica; II — Maior nota em Cooperação; III — Maior nota em Resolutividade; IV — Maior nota em Impacto Social ou Institucional; V — Maior nota em Replicabilidade; VI — Maior nota em Inovação; VII — Decisão fundamentada da Comissão Julgadora.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Resultados */}
        <Card className="shadow-md border overflow-hidden">
          <CardHeader className="bg-white border-b py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base text-gray-900">Quadro Classificatório de Resultados</CardTitle>
                <CardDescription className="text-xs">
                  {items.length} {items.length === 1 ? 'trabalho participante' : 'trabalhos participantes'} nesta categoria
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Maior votação popular na categoria:</span>
                <Badge variant="secondary" className="font-mono text-xs">{maxVotos} votos</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-gray-600 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Carregando dados da apuração...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-sm">
                Nenhuma avaliação técnica registrada nesta categoria até o momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader className="bg-gray-50 border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 font-bold text-gray-900 text-center">Posição</TableHead>
                      <TableHead className="min-w-[220px] font-bold text-gray-900">Iniciativa / Proponente</TableHead>
                      <TableHead className="w-24 text-center font-bold text-gray-900">Jurados Válidos</TableHead>
                      <TableHead className="w-28 text-center font-bold text-gray-900">Média Técnica (0-25)</TableHead>
                      <TableHead className="w-32 text-center font-bold text-blue-900 bg-blue-50/50">Nota Téc. 100 (80%)</TableHead>
                      <TableHead className="w-24 text-center font-bold text-gray-900">Votos Pop.</TableHead>
                      <TableHead className="w-32 text-center font-bold text-emerald-900 bg-emerald-50/50">Nota Pop. 100 (20%)</TableHead>
                      <TableHead className="w-32 text-center font-bold text-white bg-primary">Pontuação Final</TableHead>
                      <TableHead className="w-40 font-bold text-gray-700">Desempate (8.9)</TableHead>
                      <TableHead className="w-16 text-center text-gray-500 font-semibold" title="Média no critério Cooperação">Coop.</TableHead>
                      <TableHead className="w-16 text-center text-gray-500 font-semibold" title="Média no critério Resolutividade">Resol.</TableHead>
                      <TableHead className="w-16 text-center text-gray-500 font-semibold" title="Média no critério Impacto Social ou Institucional">Imp.</TableHead>
                      <TableHead className="w-16 text-center text-gray-500 font-semibold" title="Média no critério Replicabilidade">Repl.</TableHead>
                      <TableHead className="w-16 text-center text-gray-500 font-semibold" title="Média no critério Inovação">Inov.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => {
                      const pos = item.posicao || idx + 1;
                      const isWinner = pos <= 3;
                      return (
                        <TableRow
                          key={item.inscricao.id}
                          className={`transition-colors ${isWinner ? 'bg-amber-50/20 hover:bg-amber-50/40 font-medium' : 'hover:bg-gray-50/60'}`}
                        >
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {pos === 1 && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold h-6 w-6 p-0 flex items-center justify-center rounded-full text-xs shadow-xs">
                                  1º
                                </Badge>
                              )}
                              {pos === 2 && (
                                <Badge className="bg-slate-400 hover:bg-slate-500 text-white font-bold h-6 w-6 p-0 flex items-center justify-center rounded-full text-xs shadow-xs">
                                  2º
                                </Badge>
                              )}
                              {pos === 3 && (
                                <Badge className="bg-amber-700 hover:bg-amber-800 text-white font-bold h-6 w-6 p-0 flex items-center justify-center rounded-full text-xs shadow-xs">
                                  3º
                                </Badge>
                              )}
                              {pos > 3 && (
                                <span className="text-gray-500 font-semibold">{pos}º</span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="font-semibold text-gray-900 leading-snug">
                              {item.inscricao.titulo_iniciativa}
                            </div>
                            <div className="text-[11px] text-gray-600 mt-0.5">
                              {item.inscricao.nome_completo} • <span className="text-gray-500">{item.inscricao.lotacao}</span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center font-mono">
                            {item.avaliacoes_count}
                          </TableCell>

                          <TableCell className="text-center font-mono font-medium text-gray-800">
                            {item.media_total.toFixed(2)}
                          </TableCell>

                          <TableCell className="text-center font-mono font-bold text-blue-900 bg-blue-50/30">
                            {item.nota_tecnica_100.toFixed(2)}
                            <span className="block text-[10px] text-blue-600 font-normal">
                              {(item.nota_tecnica_100 * 0.8).toFixed(2)} pts
                            </span>
                          </TableCell>

                          <TableCell className="text-center font-mono text-gray-800">
                            {item.votos_populares}
                          </TableCell>

                          <TableCell className="text-center font-mono font-bold text-emerald-900 bg-emerald-50/30">
                            {item.nota_popular_100.toFixed(2)}
                            <span className="block text-[10px] text-emerald-600 font-normal">
                              {(item.nota_popular_100 * 0.2).toFixed(2)} pts
                            </span>
                          </TableCell>

                          <TableCell className="text-center font-mono font-extrabold text-sm text-primary bg-primary/5">
                            {item.pontuacao_final.toFixed(2)}
                          </TableCell>

                          <TableCell className="text-[11px]">
                            {item.criterio_desempate && item.criterio_desempate !== 'Sem empate' ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                {item.criterio_desempate}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>

                          {/* Médias individuais dos critérios */}
                          <TableCell className="text-center font-mono text-[11px] text-gray-600">
                            {item.media_cooperacao.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center font-mono text-[11px] text-gray-600">
                            {item.media_resolutividade.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center font-mono text-[11px] text-gray-600">
                            {item.media_impacto_social.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center font-mono text-[11px] text-gray-600">
                            {item.media_replicabilidade.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center font-mono text-[11px] text-gray-600">
                            {item.media_inovacao.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
