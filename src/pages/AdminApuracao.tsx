import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apurarResultadosFinais } from '@/lib/supabaseService';
import { Calculator, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ApuracaoPreview {
  inscricao_id: string;
  categoria: string;
  is_finalista: boolean;
  nota_tecnica: number;
  votos_validos: number;
  maior_voto_categoria: number;
  nota_popular: number;
  pontuacao_final: number;
  classificacao_final: number;
  criterio_desempate: string;
  status_diff: string;
}

const MemoriaCalculoExpanded = ({ data }: { data: ApuracaoPreview }) => {
  return (
    <div className="bg-gray-50 border-t p-4 text-xs">
      <h4 className="font-semibold mb-2">Memória de Cálculo Detalhada</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-gray-500 block">Status Finalista</span>
          <span className="font-medium">{data.is_finalista ? 'Sim' : 'Não'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Nota Técnica Normalizada</span>
          <span className="font-medium">{Number(data.nota_tecnica).toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Votos Válidos Recebidos</span>
          <span className="font-medium">{data.is_finalista ? data.votos_validos : 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Maior Votação da Categoria</span>
          <span className="font-medium">{data.is_finalista ? data.maior_voto_categoria : 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Nota Popular (Proporcional)</span>
          <span className="font-medium">{data.is_finalista ? Number(data.nota_popular).toFixed(2) : 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Peso Técnico (80%)</span>
          <span className="font-medium">{data.is_finalista ? (Number(data.nota_tecnica) * 0.8).toFixed(2) : 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Peso Popular (20%)</span>
          <span className="font-medium">{data.is_finalista ? (Number(data.nota_popular) * 0.2).toFixed(2) : 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Critério de Desempate Usado</span>
          <span className="font-medium">{data.is_finalista ? data.criterio_desempate : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

const AdminApuracao = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ApuracaoPreview[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [justificativa, setJustificativa] = useState('');

  const handleSimular = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apurarResultadosFinais(justificativa || null, true);
      if (!res.success) {
        throw new Error(res.error);
      }
      setPreview(res.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao simular apuração');
    } finally {
      setLoading(false);
    }
  };

  const handleEfetivar = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apurarResultadosFinais(justificativa || null, false);
      if (!res.success) {
        throw new Error(res.error);
      }
      setPreview(res.data); // Mantido/Atualizado
      toast({
        title: "Sucesso",
        description: "A apuração final foi concluída e salva no banco de dados.",
        variant: "default",
      });
      setJustificativa('');
    } catch (err: any) {
      setError(err.message || 'Erro ao efetivar apuração');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-gray-50 min-h-[72vh]">
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">Painel de Apuração Final</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Calcular Resultados Finais
            </CardTitle>
            <CardDescription>
              Esta ação cruza os dados dos Finalistas Consolidados com os Votos Populares válidos.
              O resultado gerado é a base para o relatório de premiação e publicação do edital.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-blue-800">
                Regras de Execução
              </h3>
              <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                <li>A ação só é permitida após a data de encerramento da votação no cronograma.</li>
                <li>Para gerar apuração antecipada (reexecutar), justifique no campo abaixo.</li>
              </ul>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="justificativa" className="text-sm font-medium">Justificativa para reexecução / apuração antecipada (Opcional)</Label>
                <Textarea 
                  id="justificativa"
                  placeholder="Se for re-apuração por auditoria ou teste, registre o motivo institucional."
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleSimular} 
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Simular Cálculo (Dry Run)
                </Button>
                {preview && (
                  <Button 
                    variant="destructive" 
                    onClick={handleEfetivar} 
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Efetivar Apuração
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {preview && (
          <Card className="shadow-sm mb-10">
            <CardHeader>
              <CardTitle className="text-lg">Resultado Calculado (Preview)</CardTitle>
              <CardDescription>
                Clique em uma inscrição finalista para ver a memória de cálculo completa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3"></th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Posição</th>
                      <th className="px-4 py-3">Inscrição ID</th>
                      <th className="px-4 py-3 text-right">Técnica (80%)</th>
                      <th className="px-4 py-3 text-right">Popular (20%)</th>
                      <th className="px-4 py-3 text-right">Pont. Final</th>
                      <th className="px-4 py-3 text-center">Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4 text-gray-500">
                          Nenhum resultado processado.
                        </td>
                      </tr>
                    ) : (
                      preview.sort((a,b) => a.categoria.localeCompare(b.categoria) || (a.classificacao_final || 999) - (b.classificacao_final || 999)).map((p, i) => (
                        <React.Fragment key={i}>
                          <tr 
                            className={`border-b hover:bg-gray-50 cursor-pointer ${!p.is_finalista && 'opacity-50'}`}
                            onClick={() => toggleExpand(p.inscricao_id)}
                          >
                            <td className="px-4 py-2">
                              {p.is_finalista && (
                                expandedId === p.inscricao_id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </td>
                            <td className="px-4 py-2 font-medium">{p.categoria}</td>
                            <td className="px-4 py-2">{p.classificacao_final || '-'}</td>
                            <td className="px-4 py-2 text-xs font-mono">{p.inscricao_id.substring(0,8)}...</td>
                            <td className="px-4 py-2 text-right">{Number(p.nota_tecnica).toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{p.is_finalista ? Number(p.nota_popular).toFixed(2) : '-'}</td>
                            <td className="px-4 py-2 text-right font-bold">{p.is_finalista ? Number(p.pontuacao_final).toFixed(2) : '-'}</td>
                            <td className="px-4 py-2 text-center">
                              {p.status_diff === 'NOVO' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-[10px] font-bold">NOVO</span>}
                              {p.status_diff === 'REMOVIDO' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-[10px] font-bold">REMOV</span>}
                              {p.status_diff === 'MANTIDO' && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px]">MANT</span>}
                              {p.status_diff === 'POSICAO_ALTERADA' && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-[10px] font-bold">POS</span>}
                            </td>
                          </tr>
                          {expandedId === p.inscricao_id && p.is_finalista && (
                            <tr>
                              <td colSpan={8} className="p-0">
                                <MemoriaCalculoExpanded data={p} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminApuracao;
