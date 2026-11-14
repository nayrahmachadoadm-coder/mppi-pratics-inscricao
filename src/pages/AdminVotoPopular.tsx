import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CategoriaRankingItem, getRelatorioCategoria, isOfficial2026FinalistTitle } from '@/lib/evaluationService';
import { getAllInscricoes } from '@/lib/adminService';
import { getDeviceFingerprint, getStoredVote, storeVote } from '@/utils/fingerprint';
import { submitVotoPopular } from '@/lib/votoPopularService';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica';
type FinalistaExibido = {
  inscricao: {
    id: string;
    titulo_iniciativa: string;
    nome_completo: string;
    lotacao?: string;
    descricao_iniciativa?: string;
  };
};

const sortAlfabetico = (items: FinalistaExibido[]) =>
  [...items].sort((a, b) =>
    (a.inscricao.titulo_iniciativa || '').localeCompare(b.inscricao.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' })
  );

const categorias: { key: CategoriaKey; label: string }[] = [
  { key: 'finalistica-projeto', label: 'Projetos Finalísticos' },
  { key: 'estruturante-projeto', label: 'Projetos Estruturantes' },
  { key: 'finalistica-pratica', label: 'Práticas Finalísticas' },
  { key: 'estruturante-pratica', label: 'Práticas Estruturantes' },
];

const AdminVotoPopular = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [finalistas, setFinalistas] = useState<Record<CategoriaKey, FinalistaExibido[]>>({
    'finalistica-projeto': [],
    'estruturante-projeto': [],
    'finalistica-pratica': [],
    'estruturante-pratica': [],
  });
  // Estado para modal de verificação (substitui window.prompt)
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [challenge, setChallenge] = useState<{ a: number; b: number }>({ a: 0, b: 0 });
  const [answer, setAnswer] = useState('');
  const [pendingVote, setPendingVote] = useState<{ cat: CategoriaKey; inscricaoId: string; titulo: string } | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const results: Record<CategoriaKey, FinalistaExibido[]> = {
          'finalistica-projeto': [],
          'estruturante-projeto': [],
          'finalistica-pratica': [],
          'estruturante-pratica': [],
        };
        for (const cat of categorias) {
          const res = await getRelatorioCategoria(cat.key);
          if (res.success && res.data && res.data.length > 0) {
            const hasRealScores = res.data.some((it) => it.avaliacoes_count > 0);
            const top3 = res.data
              .filter((it) =>
                hasRealScores
                  ? Boolean(it.is_finalista)
                  : isOfficial2026FinalistTitle(cat.key, it.inscricao.titulo_iniciativa)
              )
              .slice(0, 3);
            const finalTop3 = top3.length === 3 ? top3 : res.data.slice(0, 3);
            results[cat.key] = sortAlfabetico(
              finalTop3.map((item) => ({ inscricao: item.inscricao }))
            );
          } else {
            // Fallback para ambiente sem acesso de leitura (RLS): filtra pelos finalistas oficiais 2026
            const mock = await getAllInscricoes(1, 1000, { area_atuacao: cat.key });
            const allInCat = mock.data || [];
            const officialMatched = allInCat.filter((insc) =>
              isOfficial2026FinalistTitle(cat.key, insc.titulo_iniciativa)
            );
            const list = (officialMatched.length === 3 ? officialMatched : allInCat).slice(0, 3);
            results[cat.key] = sortAlfabetico(
              list.map((insc) => ({
                inscricao: insc,
              }))
            );
          }
        }
        setFinalistas(results);
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar os finalistas.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const hasVoted = (cat: CategoriaKey) => {
    return Boolean(getStoredVote(cat));
  };

  const handleVote = async (cat: CategoriaKey, inscricaoId: string, titulo: string) => {
    if (hasVoted(cat)) {
      toast({ title: 'Voto já registrado', description: 'Você já votou nesta categoria.' });
      return;
    }
    // Abre modal de verificação em vez de usar prompt()
    const a = Math.floor(3 + Math.random() * 5);
    const b = Math.floor(3 + Math.random() * 5);
    setChallenge({ a, b });
    setAnswer('');
    setPendingVote({ cat, inscricaoId, titulo });
    setVerifyOpen(true);
  };

  const confirmVote = async () => {
    if (!pendingVote) return;
    const expected = challenge.a + challenge.b;
    const ok = Number(answer) === expected;
    if (!ok) {
      toast({ title: 'Verificação incorreta', description: 'Tente novamente para confirmar seu voto.' });
      return;
    }
    try {
      const fp = await getDeviceFingerprint();
      const res = await submitVotoPopular({ categoria: pendingVote.cat, inscricao_id: pendingVote.inscricaoId, fingerprint: fp });
      storeVote(pendingVote.cat, pendingVote.inscricaoId);
      if (res.isDuplicate) {
        toast({
          variant: 'destructive',
          title: 'Voto não permitido',
          description: 'Não foi possível registrar este voto porque já existe um voto computado para esta categoria nesta edição a partir das características técnicas deste navegador/dispositivo. Se você acredita que isso é um erro, utilize o canal de contestação informado no edital.',
        });
      } else if (!res.success) {
        toast({
          variant: 'destructive',
          title: 'Erro ao registrar voto',
          description: res.error || 'Houve um problema ao registrar no servidor.',
        });
      } else {
        toast({ title: 'Voto confirmado', description: `Seu voto foi registrado para: ${pendingVote.titulo}` });
      }
    } catch (e: any) {
      storeVote(pendingVote.cat, pendingVote.inscricaoId);
      toast({
        variant: 'destructive',
        title: 'Erro ao processar voto',
        description: e?.message || 'Houve um problema de comunicação.',
      });
    } finally {
      setVerifyOpen(false);
      setPendingVote(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Voto Popular</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {/* Modal de verificação anti-robô */}
            <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirme seu voto</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 text-sm">
                  <div>
                    Para confirmar, informe o resultado: {challenge.a} + {challenge.b}
                  </div>
                  <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Digite o resultado"
                    inputMode="numeric"
                  />
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setVerifyOpen(false)}>Cancelar</Button>
                  <Button
                    onClick={confirmVote}
                    disabled={answer.trim() === '' || Number(answer.trim()) !== challenge.a + challenge.b}
                  >
                    Confirmar voto
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="space-y-6">
              {categorias.map((cat) => (
                <section key={cat.key} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-gray-800">{cat.label}</h2>
                    {hasVoted(cat.key) && (
                      <span className="text-xs text-green-700">Seu voto nesta categoria foi registrado</span>
                    )}
                  </div>
                  {loading ? (
                    <div className="text-sm text-gray-500">Carregando finalistas...</div>
                  ) : finalistas[cat.key].length === 0 ? (
                    <div className="text-sm text-gray-500">Nenhum finalista disponível.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {finalistas[cat.key].map((item) => (
                        <div key={item.inscricao.id} className="rounded border bg-white p-3 shadow-sm">
                          <div className="text-sm font-medium text-gray-900">
                            {item.inscricao.titulo_iniciativa}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {item.inscricao.nome_completo}
                          </div>
                          <div className="mt-3">
                            <Button
                              disabled={hasVoted(cat.key)}
                              onClick={() => handleVote(cat.key, item.inscricao.id, item.inscricao.titulo_iniciativa)}
                              className="w-full"
                              variant={hasVoted(cat.key) ? 'secondary' : 'default'}
                            >
                              {hasVoted(cat.key) ? 'Voto registrado' : 'Votar'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
            <div className="mt-6 text-xs text-gray-600">
              • Cada pessoa pode votar uma única vez por categoria neste dispositivo. Para reduzir fraudes, usamos verificação simples e identificação por dispositivo.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminVotoPopular;
