import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminCronograma = () => {
  // Utilidades
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`; // m: 0-based
  const formatPtBR = (iso: string) => {
    const [yy, mm, dd] = iso.split('-').map(Number);
    return `${pad(dd)}/${pad(mm)}/${yy}`;
  };

  const today = new Date();
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());

  // Eventos
  const singleEvents: { date: string; label: string }[] = [
    { date: '2026-09-04', label: 'Lançamento do Edital' },
    { date: '2026-10-21', label: 'Divulgação da relação provisória das inscrições deferidas e indeferidas' },
    { date: '2026-10-29', label: 'Divulgação da relação definitiva das inscrições habilitadas' },
    { date: '2026-11-11', label: 'Divulgação dos finalistas' },
  ];

  const rangeEvents: { start: string; end: string; label: string }[] = [
    { start: '2026-09-08', end: '2026-10-18', label: 'Período de inscrições' },
    { start: '2026-10-22', end: '2026-10-26', label: 'Prazo para pedido de reconsideração' },
    { start: '2026-10-29', end: '2026-11-09', label: 'Julgamento técnico pela Comissão Julgadora' },
    { start: '2026-11-12', end: '2026-11-23', label: 'Votação popular' },
  ];

  const isInRange = (iso: string, start: string, end: string) => iso >= start && iso <= end;

  const months = [
    { year: 2026, monthIndex: 8, name: 'Setembro' },
    { year: 2026, monthIndex: 9, name: 'Outubro' },
    { year: 2026, monthIndex: 10, name: 'Novembro' },
    { year: 2026, monthIndex: 11, name: 'Dezembro' },
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const renderMonth = (year: number, monthIndex: number, name: string) => {
    const firstWeekday = new Date(year, monthIndex, 1).getDay(); // 0 = Domingo
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const leadingBlanks = Array(firstWeekday).fill(null);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const totalCells = leadingBlanks.length + monthDays.length;
    const trailingBlanksCount = (7 - (totalCells % 7)) % 7;
    const trailingBlanks = Array(trailingBlanksCount).fill(null);

    const cells = [
      ...leadingBlanks,
      ...monthDays.map((day) => ({ day, iso: toIso(year, monthIndex, day) })),
      ...trailingBlanks,
    ];

    return (
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold whitespace-nowrap">{name} {year}</div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-muted-foreground">
          {weekDays.map((w) => (
            <div key={`${name}-${w}`} className="text-center">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (cell === null) {
              return <div key={`${name}-blank-${idx}`} className="aspect-square rounded-md bg-muted/30" />;
            }
            const { day, iso } = cell;
            const single = singleEvents.find((e) => e.date === iso);
            const range = rangeEvents.find((e) => isInRange(iso, e.start, e.end));

            const isToday = iso === todayIso;

            let className = 'aspect-square rounded-md flex items-center justify-center text-sm';
            let title = '';
            if (single && range) {
              className += ' bg-primary text-primary-foreground font-semibold ring-2 ring-yellow-400';
              title = `${formatPtBR(iso)} – ${single.label} / ${range.label}`;
            } else if (single) {
              className += ' bg-primary text-primary-foreground font-semibold';
              title = `${formatPtBR(iso)} – ${single.label}`;
            } else if (range) {
              className += ' bg-primary/10 border border-primary/30';
              title = `${formatPtBR(iso)} – ${range.label}`;
            }

            if (isToday) {
              className += ' ring-2 ring-emerald-500 font-bold';
              title += title ? ' (Hoje)' : `${formatPtBR(iso)} – Hoje`;
            }

            return (
              <div key={`${name}-${iso}`} className={className} title={title}>
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">Cronograma</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-primary" />
                <span className="text-sm text-muted-foreground">Evento (dia único)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-primary/10 border border-primary/30" />
                <span className="text-sm text-muted-foreground">Período (intervalo)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm border-2 border-emerald-500 bg-emerald-50" />
                <span className="text-sm text-muted-foreground">Hoje ({formatPtBR(todayIso)})</span>
              </div>
            </div>

            {/* Calendários lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {months.map((m) => (
                <div key={`${m.name}-${m.year}`}>{renderMonth(m.year, m.monthIndex, m.name)}</div>
              ))}
            </div>

            {/* Mini legenda textual abaixo dos calendários */}
            <div className="mt-4 border-t border-border pt-3">
              <div className="text-sm font-medium text-muted-foreground mb-2">Legenda textual</div>
              <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                <li>04/09/2026 — Lançamento do Edital</li>
                <li>08/09/2026 a 18/10/2026 — Período de inscrições</li>
                <li>21/10/2026 — Divulgação da relação provisória das inscrições deferidas e indeferidas</li>
                <li>22/10/2026 a 26/10/2026 — Prazo para pedido de reconsideração</li>
                <li>29/10/2026 — Divulgação da relação definitiva das inscrições habilitadas</li>
                <li>29/10/2026 a 09/11/2026 — Julgamento técnico pela Comissão Julgadora</li>
                <li>11/11/2026 — Divulgação dos finalistas</li>
                <li>12/11/2026 a 23/11/2026 — Votação popular</li>
                <li>Dezembro de 2026 — Cerimônia de premiação</li>
                <li>Após a cerimônia — Publicação e homologação do resultado final</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminCronograma;
