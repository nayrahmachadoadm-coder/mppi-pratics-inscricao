/**
 * Utilitários para formatação e manipulação de datas e horas
 */

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return 'Data não informada';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);

  // Formato brasileiro completo: DD/MM/AAAA às HH:mm:ss
  const datePart = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `${datePart} às ${timePart}`;
}

export function formatDateTimeShort(dateString?: string | null): string {
  if (!dateString) return 'Data não informada';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);

  // Formato brasileiro: DD/MM/AAAA às HH:mm
  const datePart = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart} às ${timePart}`;
}

export function formatDateOnly(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);

  return date.toLocaleDateString('pt-BR');
}
