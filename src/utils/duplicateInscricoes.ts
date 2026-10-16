import { AdminInscricaoData } from '@/lib/adminService';

export interface DuplicateItemMeta {
  isDuplicate: boolean;
  isLatest: boolean;
  isOlder: boolean;
  groupKey: string;
  totalInGroup: number;
  positionInGroup: number; // 1-indexado (ex.: 1 de 2, 2 de 2)
  latestInscricao?: AdminInscricaoData;
  olderInscricoes?: AdminInscricaoData[];
}

export interface DuplicateGroup {
  key: string;
  proponente: string;
  matricula: string;
  items: AdminInscricaoData[];
  latest: AdminInscricaoData;
  older: AdminInscricaoData[];
}

export interface DuplicateAnalysisResult {
  hasDuplicates: boolean;
  duplicateGroupsCount: number;
  totalDuplicateInscricoes: number;
  totalOlderInscricoes: number;
  metaById: Map<string, DuplicateItemMeta>;
  groups: DuplicateGroup[];
}

export type InscricaoSortOption = 'recent' | 'oldest' | 'title' | 'duplicates';

/**
 * Normaliza texto para comparações insensíveis a acentos, pontuações e maiúsculas
 */
export function normalizeText(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Remove caracteres não numéricos de matrículas
 */
export function cleanMatricula(str?: string | null): string {
  if (!str) return '';
  return str.replace(/\D/g, '').trim();
}

/**
 * Analisa uma lista de inscrições para identificar duplicidades / reenvios do mesmo trabalho
 * ou proponente na mesma categoria, determinando qual é a mais recente (válida) e quais são anteriores.
 */
export function analyzeDuplicates(inscricoes: AdminInscricaoData[]): DuplicateAnalysisResult {
  const metaById = new Map<string, DuplicateItemMeta>();
  const groups: DuplicateGroup[] = [];
  const visited = new Set<string>();

  for (let i = 0; i < inscricoes.length; i++) {
    const current = inscricoes[i];
    if (visited.has(current.id)) continue;

    const currentGroup: AdminInscricaoData[] = [current];
    visited.add(current.id);

    const matA = cleanMatricula(current.matricula);
    const nameA = normalizeText(current.nome_completo);
    const titleA = normalizeText(current.titulo_iniciativa);

    for (let j = i + 1; j < inscricoes.length; j++) {
      const other = inscricoes[j];
      if (visited.has(other.id)) continue;

      const matB = cleanMatricula(other.matricula);
      const nameB = normalizeText(other.nome_completo);
      const titleB = normalizeText(other.titulo_iniciativa);

      let isMatch = false;

      // 1. Mesma matrícula válida
      if (matA && matB && matA === matB && matA.length >= 2) {
        isMatch = true;
      }
      // 2. Mesmo nome de proponente (quando nome completo tem pelo menos 5 caracteres)
      else if (nameA && nameB && nameA === nameB && nameA.length >= 5) {
        isMatch = true;
      }
      // 3. Título idêntico ou muito semelhante (início igual com mais de 25 caracteres)
      else if (
        titleA &&
        titleB &&
        (titleA === titleB ||
          (titleA.length >= 25 && titleB.startsWith(titleA.slice(0, 25))) ||
          (titleB.length >= 25 && titleA.startsWith(titleB.slice(0, 25))))
      ) {
        isMatch = true;
      }

      if (isMatch) {
        visited.add(other.id);
        currentGroup.push(other);
      }
    }

    if (currentGroup.length > 1) {
      // Ordenar cronologicamente em ordem crescente (mais antiga primeiro, mais recente por último)
      currentGroup.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeA - timeB;
      });

      const latest = currentGroup[currentGroup.length - 1];
      const older = currentGroup.slice(0, currentGroup.length - 1);
      const groupKey = `group-${current.id}`;

      groups.push({
        key: groupKey,
        proponente: latest.nome_completo || current.nome_completo,
        matricula: latest.matricula || current.matricula || '',
        items: currentGroup,
        latest,
        older,
      });

      currentGroup.forEach((item, index) => {
        const isLatest = index === currentGroup.length - 1;
        const isOlder = !isLatest;
        metaById.set(item.id, {
          isDuplicate: true,
          isLatest,
          isOlder,
          groupKey,
          totalInGroup: currentGroup.length,
          positionInGroup: index + 1,
          latestInscricao: latest,
          olderInscricoes: older,
        });
      });
    } else {
      metaById.set(current.id, {
        isDuplicate: false,
        isLatest: false,
        isOlder: false,
        groupKey: '',
        totalInGroup: 1,
        positionInGroup: 1,
      });
    }
  }

  const totalDuplicateInscricoes = groups.reduce((acc, g) => acc + g.items.length, 0);
  const totalOlderInscricoes = groups.reduce((acc, g) => acc + g.older.length, 0);

  return {
    hasDuplicates: groups.length > 0,
    duplicateGroupsCount: groups.length,
    totalDuplicateInscricoes,
    totalOlderInscricoes,
    metaById,
    groups,
  };
}

/**
 * Ordena a lista de inscrições de acordo com a opção selecionada
 */
export function sortInscricoes(
  list: AdminInscricaoData[],
  sortBy: InscricaoSortOption,
  analysis: DuplicateAnalysisResult
): AdminInscricaoData[] {
  const copy = [...list];

  switch (sortBy) {
    case 'recent':
      return copy.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });

    case 'oldest':
      return copy.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeA - timeB;
      });

    case 'duplicates':
      // Coloca inscrições com duplicidade primeiro, agrupadas lado a lado
      return copy.sort((a, b) => {
        const metaA = analysis.metaById.get(a.id);
        const metaB = analysis.metaById.get(b.id);
        const aDup = metaA?.isDuplicate ? 1 : 0;
        const bDup = metaB?.isDuplicate ? 1 : 0;

        if (aDup !== bDup) {
          return bDup - aDup; // duplicidades primeiro
        }

        if (metaA?.isDuplicate && metaB?.isDuplicate) {
          if (metaA.groupKey !== metaB.groupKey) {
            return metaA.groupKey.localeCompare(metaB.groupKey);
          }
          // Dentro do mesmo grupo, mais recente primeiro
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeB - timeA;
        }

        return (a.titulo_iniciativa || '').localeCompare(b.titulo_iniciativa || '', 'pt-BR');
      });

    case 'title':
    default:
      return copy.sort((a, b) =>
        (a.titulo_iniciativa || '').localeCompare(b.titulo_iniciativa || '', 'pt-BR', {
          sensitivity: 'base',
        })
      );
  }
}
