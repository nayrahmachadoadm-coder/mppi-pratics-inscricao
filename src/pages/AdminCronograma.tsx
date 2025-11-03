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

  // Eventos
  const singleEvents: { date: string; label: string }[] = [
    { date: '2025-09-19', label: 'Lançamento do edital' },
    { date: '2025-11-07', label: 'Divulgação das práticas inscritas deferidas' },
    { date: '2025-11-17', label: 'Divulgação da lista definitiva dos inscritos' },
    { date: '2025-11-28', label: 'Divulgação dos finalistas' },
    { date: '2025-12-12', label: 'Cerimônia de Premiação (a confirmar)' }, // conforme solicitado: 12 de dezembro
  ];

  const rangeEvents: { start: string; end: string; label: string }[] = [
    { start: '2025-09-20', end: '2025-10-30', label: 'Período de inscrição' },
    { start: '2025-11-10', end: '2025-11-14', label: 'Pedido de reconsideração' }, // 5 dias úteis após 07/11/2025
    { start: '2025-11-28', end: '2025-12-08', label: 'Voto Popular' },
  ];

  const isInRange = (iso: string, start: string, end: string) => iso >= start && iso <= end;

  const months = [
    { year: 2025, monthIndex: 8, name: 'Setembro' },
    { year: 2025, monthIndex: 9, name: 'Outubro' },
    { year: 2025, monthIndex: 10, name: 'Novembro' },
    { year: 2025, monthIndex: 11, name: 'Dezembro' },
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

            let className = 'aspect-square rounded-md flex items-center justify-center text-sm';
            let title = '';
            if (range && !single) {
              className += ' bg-primary/10 border border-primary/30';
              title = `${formatPtBR(iso)} – ${range.label}`;
            }
            if (single) {
              className += ' bg-primary text-primary-foreground font-semibold';
              title = `${formatPtBR(iso)} – ${single.label}`;
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
                <li>19/09/2025 — Lançamento do edital</li>
                <li>20/09/2025 – 30/10/2025 — Período de inscrição</li>
                <li>07/11/2025 — Divulgação das práticas inscritas deferidas</li>
                <li>10/11/2025 – 14/11/2025 — Pedido de reconsideração</li>
                <li>17/11/2025 — Divulgação da lista definitiva dos inscritos</li>
                <li>28/11/2025 — Divulgação dos finalistas</li>
                <li>28/11/2025 – 08/12/2025 — Voto Popular</li>
                <li>12/12/2025 — Cerimônia de Premiação (a confirmar)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminCronograma;