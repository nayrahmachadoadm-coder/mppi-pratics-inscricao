import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CsvRow = {
  ano: string;
  edicao: string;
  categoria: string;
  colocacao: string;
  nome: string;
};

type GroupedData = Record<string, {
  ano: string;
  edicao: string;
  categorias: Record<string, CsvRow[]>;
}>;

const AdminEdicoesAnteriores = () => {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCsv = async () => {
      try {
        setLoading(true);
        const res = await fetch('/edicoes_anteriores.csv');
        if (!res.ok) throw new Error(`Falha ao carregar CSV: ${res.status}`);
        const text = await res.text();

        // Detecta separador (tab ou vírgula) e normaliza linhas
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) throw new Error('CSV sem conteúdo suficiente.');
        const header = lines[0];
        const sep = header.includes('\t') ? '\t' : ',';

        const parsed: CsvRow[] = lines.slice(1).map((line) => {
          const parts = line.split(new RegExp(sep));
          const [ano, edicao, categoria, colocacao, nome] = parts.map((p) => p?.trim() ?? '');
          return { ano, edicao, categoria, colocacao, nome };
        }).filter((r) => r.ano && r.edicao && r.categoria && r.colocacao && r.nome);

        setRows(parsed);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao carregar edições anteriores:', err);
        setError(err?.message ?? 'Erro desconhecido ao carregar CSV.');
      } finally {
        setLoading(false);
      }
    };
    loadCsv();
  }, []);

  const grouped: GroupedData = useMemo(() => {
    const byEdition: GroupedData = {};
    rows.forEach((r) => {
      const key = `${r.ano} - ${sanitizeEdicao(r.edicao)}`;
      if (!byEdition[key]) {
        byEdition[key] = {
          ano: r.ano,
          edicao: sanitizeEdicao(r.edicao),
          categorias: {},
        };
      }
      const cat = r.categoria.trim();
      if (!byEdition[key].categorias[cat]) byEdition[key].categorias[cat] = [];
      byEdition[key].categorias[cat].push(r);
    });

    // Ordena por ano decrescente e por colocação crescente dentro de cada categoria
    Object.values(byEdition).forEach((edition) => {
      Object.keys(edition.categorias).forEach((cat) => {
        edition.categorias[cat] = edition.categorias[cat]
          .filter((r) => ['1', '2', '3'].includes(r.colocacao.replace(/\D/g, '')))
          .sort((a, b) => parseInt(a.colocacao.replace(/\D/g, ''), 10) - parseInt(b.colocacao.replace(/\D/g, ''), 10));
      });
    });

    return byEdition;
  }, [rows]);

  const editionKeys = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
      const ay = parseInt(a.split(' - ')[0], 10);
      const by = parseInt(b.split(' - ')[0], 10);
      return by - ay; // mais recentes primeiro
    });
  }, [grouped]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Edições Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-muted-foreground">Carregando histórico das edições...</p>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && editionKeys.length === 0 && (
              <p className="text-muted-foreground">Nenhum registro encontrado.</p>
            )}

            {!loading && !error && editionKeys.length > 0 && (
              <div className="space-y-8">
                {editionKeys.map((key) => {
                  const edition = grouped[key];
                  const categories = Object.keys(edition.categorias).sort();

                  return (
                    <section key={key} className="rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] text-[hsl(var(--primary-foreground))] border-b border-[hsl(var(--primary-dark))]/30">
                        <h2 className="text-base font-semibold">
                          {edition.edicao} ({edition.ano})
                        </h2>
                        <span className="text-xs opacity-90">Top 3 por categoria</span>
                      </div>

                      <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((cat) => (
                          <div key={cat} className="rounded-lg border border-muted bg-background shadow-md hover:shadow-lg transition-shadow">
                            <div className="px-3 py-2 border-b bg-muted/40">
                              <h3 className="text-sm font-medium text-foreground">{cat}</h3>
                            </div>
                            <ul className="p-3 space-y-3">
                              {edition.categorias[cat].map((item) => (
                                <li key={`${cat}-${item.colocacao}-${item.nome}`} className="flex items-start gap-3">
                                  <BadgeColocacao value={item.colocacao} />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{item.nome}</p>
                                    <p className="text-xs text-muted-foreground">{formatCategoria(cat)}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

function sanitizeEdicao(edicao: string) {
  return edicao.replace(/\s+/g, ' ').replace(/edi\u00e7\u00e3o/i, 'edição').trim();
}

function formatCategoria(cat: string) {
  return cat.replace(/\s+/g, ' ').trim();
}

const BadgeColocacao = ({ value }: { value: string }) => {
  const num = parseInt(value.replace(/\D/g, ''), 10);
  const base = 'inline-flex items-center justify-center rounded-full text-xs font-semibold';
  const styles = {
    1: 'bg-amber-100 text-amber-800 border border-amber-200 w-6 h-6',
    2: 'bg-gray-100 text-gray-800 border border-gray-200 w-6 h-6',
    3: 'bg-orange-100 text-orange-800 border border-orange-200 w-6 h-6',
  } as const;
  return <span className={`${base} ${styles[num] || styles[3]}`}>{num}</span>;
};

export default AdminEdicoesAnteriores;