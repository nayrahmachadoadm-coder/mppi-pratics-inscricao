import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { consolidarFinalistas } from '@/lib/supabaseService';
import { ShieldAlert, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FinalistaPreview {
  inscricao_id: string;
  categoria: string;
  nota_tecnica_calculada: number;
  posicao_tecnica: number;
  julgadores_count: number;
  status_diff: string;
}

const AdminFinalistas = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<FinalistaPreview[] | null>(null);
  
  // Opções para re-execução ou forçar
  const [justificativa, setJustificativa] = useState('');
  const [ignorarPendencias, setIgnorarPendencias] = useState(false);

  const handleSimular = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await consolidarFinalistas(ignorarPendencias, justificativa || null, true);
      if (!res.success) {
        throw new Error(res.error);
      }
      setPreview(res.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao simular consolidação');
    } finally {
      setLoading(false);
    }
  };

  const handleEfetivar = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const res = await consolidarFinalistas(ignorarPendencias, justificativa || null, false);
      if (!res.success) {
        throw new Error(res.error);
      }
      setPreview(res.data); // Mantido/Atualizado
      toast({
        title: "Sucesso",
        description: "Os finalistas foram consolidados com sucesso no banco de dados.",
        variant: "default",
      });
      setJustificativa('');
    } catch (err: any) {
      setError(err.message || 'Erro ao efetivar consolidação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[72vh]">
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">Painel de Consolidação de Finalistas</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Travar Notas Técnicas e Liberar Votação</CardTitle>
            <CardDescription>
              Esta ação encerra a fase de julgamento técnico. As notas são congeladas e os finalistas ficam disponíveis para voto popular.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-yellow-800">
                <ShieldAlert className="w-4 h-4" /> 
                Atenção: Regras de Execução
              </h3>
              <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                <li>A ação verifica se <strong>todos os jurados</strong> concluíram suas avaliações. Se faltarem avaliações, a execução será bloqueada, salvo se ignorar pendências explicitamente.</li>
                <li>Se os <strong>votos populares</strong> já tiverem iniciado e houver votos registrados, você precisará anular a votação fornecendo uma justificativa registrada na auditoria.</li>
              </ul>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ignorarPendencias" 
                  checked={ignorarPendencias}
                  onCheckedChange={(val) => setIgnorarPendencias(val as boolean)}
                />
                <Label htmlFor="ignorarPendencias" className="text-sm font-medium">
                  Ignorar avaliações pendentes (forçar encerramento)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justificativa" className="text-sm font-medium">Justificativa para reexecução / anulação de votos (Opcional se for a primeira vez e não houver votos)</Label>
                <Textarea 
                  id="justificativa"
                  placeholder="Se já existem votos ou você está forçando o ignorar de pendências, registre o motivo institucional."
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
                  Simular (Dry Run)
                </Button>
                {preview && (
                  <Button 
                    variant="destructive" 
                    onClick={handleEfetivar} 
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Efetivar Consolidação
                  </Button>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        {preview && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Resultado Simulado (Preview)</CardTitle>
              <CardDescription>
                Este é o retrato que será salvo no banco de dados. Itens destacados mostram a diferença com o snapshot atual (se houver).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Posição</th>
                      <th className="px-4 py-3">ID Inscrição (Hash)</th>
                      <th className="px-4 py-3 text-right">Nota Técnica</th>
                      <th className="px-4 py-3 text-right">Julgadores</th>
                      <th className="px-4 py-3 text-center">Ação (Diff)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-500">
                          Nenhum finalista calculado (verifique se há avaliações).
                        </td>
                      </tr>
                    ) : (
                      preview.map((p, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{p.categoria}</td>
                          <td className="px-4 py-2">{p.posicao_tecnica}</td>
                          <td className="px-4 py-2 text-xs font-mono">{p.inscricao_id.substring(0,8)}...</td>
                          <td className="px-4 py-2 text-right">{Number(p.nota_tecnica_calculada).toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">{p.julgadores_count}</td>
                          <td className="px-4 py-2 text-center">
                            {p.status_diff === 'NOVO' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">NOVO</span>}
                            {p.status_diff === 'REMOVIDO' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">REMOVIDO</span>}
                            {p.status_diff === 'MANTIDO' && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">MANTIDO</span>}
                            {p.status_diff === 'POSICAO_ALTERADA' && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">POS. ALTERADA</span>}
                          </td>
                        </tr>
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

export default AdminFinalistas;
