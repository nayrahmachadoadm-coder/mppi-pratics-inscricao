import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, Award } from 'lucide-react';
import { AdminInscricaoData, getInscricaoById } from '@/lib/adminService';
import { getAdminSession } from '@/lib/adminAuth';
import { getUserSession } from '@/lib/userAuth';
import { ScoreEntry, submitAvaliacao } from '@/lib/evaluationService';
import { useToast } from '@/hooks/use-toast';

const scoreOptions = [0,1,2,3,4,5];

const AdminAvaliacao = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [inscricao, setInscricao] = useState<AdminInscricaoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  // Usamos -1 como sentinela para "não selecionado" para validação visual
  const [scores, setScores] = useState<any>({
    cooperacao: -1,
    inovacao: -1,
    resolutividade: -1,
    impacto_social: -1,
    alinhamento_ods: -1,
    replicabilidade: -1,
  });
  const [showValidation, setShowValidation] = useState<boolean>(false);

  const total = useMemo(() => {
    const vals = Object.values(scores) as number[];
    return vals.reduce((sum, v) => sum + (v >= 0 ? v : 0), 0);
  }, [scores]);

  const isComplete = useMemo(() => {
    const vals = Object.values(scores) as number[];
    return vals.every((v) => v >= 0);
  }, [scores]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      if (!id) {
        setError('ID da inscrição inválido');
        return;
      }
      const res = await getInscricaoById(id);
      if (res.success && res.data && res.data[0]) {
        setInscricao(res.data[0]);
      } else {
        setError(res.error || 'Erro ao carregar inscrição');
      }
    } catch (e) {
      setError('Erro inesperado ao carregar inscrição');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminSession = getAdminSession();
    const juradoSession = getUserSession();
    if (!adminSession && !juradoSession) {
      navigate('/admin/login');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (field: keyof ScoreEntry, value: number) => {
    setScores((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!id) return;
      // Validação: todos os critérios precisam estar selecionados
      if (!isComplete) {
        setShowValidation(true);
        toast({ title: 'Preencha todos os critérios', description: 'Selecione uma nota de 0 a 5 para cada critério.', variant: 'destructive' });
        return;
      }
      const payload: ScoreEntry = {
        cooperacao: scores.cooperacao,
        inovacao: scores.inovacao,
        resolutividade: scores.resolutividade,
        impacto_social: scores.impacto_social,
        alinhamento_ods: scores.alinhamento_ods,
        replicabilidade: scores.replicabilidade,
      };
      const res = await submitAvaliacao(id, payload);
      if (res.success) {
        toast({ title: 'Avaliação registrada', description: 'Suas notas foram salvas com sucesso.' });
        navigate(`/admin/inscricao/${id}`);
      } else {
        toast({ title: 'Erro ao salvar', description: res.error || 'Tente novamente.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Erro inesperado', description: 'Não foi possível salvar a avaliação.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Ícone" className="h-6 w-6 opacity-80" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Avaliação do Jurado</h1>
              <p className="text-sm text-gray-600">Notas de 0 a 5 por critério</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar para a relação de inscritos
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="py-10 text-center text-gray-600">Carregando...</div>
        ) : inscricao ? (
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{inscricao.titulo_iniciativa}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Proponente:</span> {inscricao.nome_completo}
                  </div>
                  <div>
                    <span className="font-medium">Lotação:</span> {inscricao.lotacao}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" /> Atribuir Notas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ScoreSelect label="Cooperação" value={scores.cooperacao} invalid={showValidation && scores.cooperacao < 0} onChange={(v) => handleChange('cooperacao', v)} />
                  <ScoreSelect label="Inovação" value={scores.inovacao} invalid={showValidation && scores.inovacao < 0} onChange={(v) => handleChange('inovacao', v)} />
                  <ScoreSelect label="Resolutividade" value={scores.resolutividade} invalid={showValidation && scores.resolutividade < 0} onChange={(v) => handleChange('resolutividade', v)} />
                  <ScoreSelect label="Impacto Social" value={scores.impacto_social} invalid={showValidation && scores.impacto_social < 0} onChange={(v) => handleChange('impacto_social', v)} />
                  <ScoreSelect label="Alinhamento aos ODS" value={scores.alinhamento_ods} invalid={showValidation && scores.alinhamento_ods < 0} onChange={(v) => handleChange('alinhamento_ods', v)} />
                  <ScoreSelect label="Replicabilidade" value={scores.replicabilidade} invalid={showValidation && scores.replicabilidade < 0} onChange={(v) => handleChange('replicabilidade', v)} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Soma automática da pontuação</div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <CheckCircle className="w-5 h-5 text-green-600" /> Total: {total}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar avaliação'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
};

const ScoreSelect: React.FC<{ label: string; value: number; invalid?: boolean; onChange: (v: number) => void; }> = ({ label, value, invalid, onChange }) => {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <Select value={value >= 0 ? String(value) : undefined} onValueChange={(val) => onChange(Number(val))}>
        <SelectTrigger className={invalid ? 'ring-1 ring-red-500' : undefined}>
          <SelectValue placeholder="Selecione a nota" />
        </SelectTrigger>
        <SelectContent>
          {scoreOptions.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {invalid && (
        <div className="text-xs text-red-600">Selecione uma nota</div>
      )}
    </div>
  );
};

export default AdminAvaliacao;