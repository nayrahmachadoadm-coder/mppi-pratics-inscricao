import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CategoriaRankingItem, getRelatorioCategoria } from '@/lib/evaluationService';
import { getAllInscricoes } from '@/lib/adminService';
import { getDeviceFingerprint, getStoredVote, storeVote } from '@/utils/fingerprint';
import { submitVotoPopular } from '@/lib/votoPopularService';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica' | 'categoria-especial-ia';

const categorias: { key: CategoriaKey; label: string }[] = [
  { key: 'finalistica-projeto', label: 'Projetos Finalísticos' },
  { key: 'estruturante-projeto', label: 'Projetos Estruturantes' },
  { key: 'finalistica-pratica', label: 'Práticas Finalísticas' },
  { key: 'estruturante-pratica', label: 'Práticas Estruturantes' },
  { key: 'categoria-especial-ia', label: 'Categoria Especial (Inteligência Artificial)' },
];

const AdminVotoPopular = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [finalistas, setFinalistas] = useState<Record<CategoriaKey, CategoriaRankingItem[]>>({
    'finalistica-projeto': [],
    'estruturante-projeto': [],
    'finalistica-pratica': [],
    'estruturante-pratica': [],
    'categoria-especial-ia': [],
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
        const results: Record<CategoriaKey, CategoriaRankingItem[]> = {
          'finalistica-projeto': [],
          'estruturante-projeto': [],
          'finalistica-pratica': [],
          'estruturante-pratica': [],
          'categoria-especial-ia': [],
        };
        for (const cat of categorias) {
          const res = await getRelatorioCategoria(cat.key);
          if (res.success && res.data && res.data.length > 0) {
            results[cat.key] = res.data.slice(0, 3);
          } else {
            // Fallback para ambiente de desenvolvimento sem acesso de leitura (RLS): usa dados diretos
            const mock = await getAllInscricoes(1, 1000, { area_atuacao: cat.key });
            const list = (mock.data || []).slice(0, 3);
            results[cat.key] = list.map((insc) => ({
              inscricao: insc,
              avaliacoes_count: 0,
              total_geral: 0,
              media_total: 0,
              media_resolutividade: 0,
              media_replicabilidade: 0,
            }));
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
      // Mesmo se falhar no backend, garantimos o voto local para evitar múltiplos do mesmo dispositivo
      storeVote(pendingVote.cat, pendingVote.inscricaoId);
      if (!res.success) {
        toast({ title: 'Voto registrado localmente', description: 'Houve um problema ao registrar no servidor. Seu voto foi limitado pelo dispositivo.' });
      } else {
        toast({ title: 'Voto confirmado', description: `Seu voto foi registrado para: ${pendingVote.titulo}` });
      }
    } catch (e: any) {
      storeVote(pendingVote.cat, pendingVote.inscricaoId);
      toast({ title: 'Voto registrado', description: 'Seu voto foi salvo no dispositivo.' });
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
                  <Button onClick={confirmVote}>Confirmar voto</Button>
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
                          <div className="text-xs text-gray-500 mt-1">Média geral: {item.media_total.toFixed(2)}</div>
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