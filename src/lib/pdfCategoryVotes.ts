import jsPDF from 'jspdf';
import { getJuryMembers } from '@/lib/juryManagement';
import { getMinhasAvaliacoes, MinhasAvaliacaoItem, getAvaliacoesByInscricao } from '@/lib/evaluationService';
import { getAllInscricoes } from '@/lib/adminService';

const areaLabel = (area: string) => {
  const map: Record<string, string> = {
    'finalistica-projeto': 'Projeto Finalístico',
    'estruturante-projeto': 'Projeto Estruturante',
    'finalistica-pratica': 'Prática Finalística',
    'estruturante-pratica': 'Prática Estruturante',
    'categoria-especial-ia': 'Categoria Especial – Inteligência Artificial',
  };
  return map[area] || area;
};

export async function exportCategoryVotesPdf(areaKey: string): Promise<void> {
  const juradosRaw = await getJuryMembers();
  // Ordenar jurados conforme a página Comissão Julgadora (começando pelos indicados pelo PGJ)
  const ord = (label: string) => {
    const s = (label || '').toLowerCase();
    if (s.includes('pgj') || s.includes('procurador-geral')) return 1;
    if (s.includes('associação piauiense') || s.includes('apm')) return 2;
    if (s.includes('sindicato')) return 3;
    if (s.includes('universidade federal') || s.includes('ufpi')) return 4;
    if (s.includes('universidade estadual') || s.includes('uespi')) return 5;
    if (s.includes('poder judiciário')) return 6;
    if (s.includes('oab') || s.includes('advogados')) return 7;
    if (s.includes('defensoria')) return 8;
    return 9;
  };
  const jurados = juradosRaw.slice().sort((a, b) => {
    const oa = ord(a.seatLabel || '');
    const ob = ord(b.seatLabel || '');
    if (oa !== ob) return oa - ob;
    return (a.created_at || 0) - (b.created_at || 0);
  });
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 15;
  let y = 20;
  let currentPage = 1;

  const addHeader = async () => {
    // Primeira página: logo no canto superior esquerdo + identificação
    if (currentPage === 1) {
      try {
        const logoUrl = '/logo-mppi.png';
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // Preservar proporção da imagem e aumentar a visibilidade
            const targetW = 55; // largura desejada
            const ratio = img.width && img.height ? (img.width / img.height) : 3.5; // fallback se não disponível
            const targetH = Math.round(targetW / ratio);
            canvas.width = targetW * 3; // alta resolução
            canvas.height = targetH * 3;
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const data = canvas.toDataURL('image/png', 1.0);
              pdf.addImage(data, 'PNG', margin, 10, targetW, targetH);
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = logoUrl;
        });
      } catch {}

      // Identificação do prêmio (centralizada)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      const hdr1 = 'Prêmio Melhores Práticas – 9ª Edição';
      const hdr1w = pdf.getTextWidth(hdr1);
      pdf.text(hdr1, (pageWidth - hdr1w) / 2, 18);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const hdr2 = 'Relatório por jurado';
      const hdr2w = pdf.getTextWidth(hdr2);
      pdf.text(hdr2, (pageWidth - hdr2w) / 2, 24);
      y = 32;
    }

    // Título da categoria (centralizado)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    const title = `Votação por Categoria – ${areaLabel(areaKey)}`;
    const tw = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - tw) / 2, y);
    y += 8;
    pdf.setLineWidth(0.4);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  const ensureSpace = async (needed: number, onNewPage?: () => Promise<void> | void) => {
    const pageHeight = pdf.internal.pageSize.height;
    if (y + needed > pageHeight - 20) {
      pdf.addPage();
      y = 20;
      currentPage++;
      await addHeader();
      if (onNewPage) await onNewPage();
    }
  };

  await addHeader();

  // Dimensões da tabela
  const totalWidth = pageWidth - margin * 2;
  const numColWidth = 15; // largura para colunas numéricas
  const cols = [
    { key: 'titulo', label: 'Título', width: totalWidth - numColWidth * 7 },
    { key: 'coop', label: 'Coop', width: numColWidth },
    { key: 'inov', label: 'Inov', width: numColWidth },
    { key: 'resol', label: 'Resol', width: numColWidth },
    { key: 'impacto', label: 'Imp', width: numColWidth },
    { key: 'ods', label: 'ODS', width: numColWidth },
    { key: 'replic', label: 'Rep', width: numColWidth },
    { key: 'total', label: 'Total', width: numColWidth },
  ];

  const drawJurorHeader = (j: { name: string; username: string }) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(`${j.name} (${j.username})`, margin, y);
    y += 6;
  };

  const drawTableHeader = () => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    let x = margin;
    const headerHeight = 7;
    pdf.setDrawColor(50);
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, y, totalWidth, headerHeight, 'F');
    for (const c of cols) {
      const label = c.label;
      pdf.text(label, x + 2, y + 5);
      x += c.width;
    }
    pdf.setDrawColor(150);
    pdf.rect(margin, y, totalWidth, headerHeight);
    y += headerHeight;
  };

  for (const j of jurados) {
    const res = await getMinhasAvaliacoes(j.username, areaKey);
    const items: MinhasAvaliacaoItem[] = res.success ? (res.data || []) : [];

    // Cabeçalho do jurado
    await ensureSpace(18);
    drawJurorHeader(j);

    // Cabeçalho da tabela
    await ensureSpace(11);
    drawTableHeader();

    // Linhas
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const lineHeight = 4;
    for (const it of items) {
      const title = it.inscricao.titulo_iniciativa || '';
      const titleWrap = pdf.splitTextToSize(title, cols[0].width - 4);
      const rowHeight = Math.max(titleWrap.length * lineHeight, 8);
      await ensureSpace(rowHeight, async () => {
        // Em nova página, repetir cabeçalho do jurado e da tabela para consistência
        drawJurorHeader(j);
        drawTableHeader();
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
      });
      // bordas da linha
      pdf.rect(margin, y, totalWidth, rowHeight);
      // células
      let cx = margin;
      // título
      pdf.text(titleWrap, cx + 2, y + 3);
      cx += cols[0].width;
      // valores numéricos
      const vals = [
        it.avaliacao.cooperacao,
        it.avaliacao.inovacao,
        it.avaliacao.resolutividade,
        it.avaliacao.impacto_social,
        it.avaliacao.alinhamento_ods,
        it.avaliacao.replicabilidade,
        it.avaliacao.total,
      ];
      for (let i = 1; i < cols.length; i++) {
        const v = String(vals[i - 1] ?? '');
        const cellW = cols[i].width;
        const txW = pdf.getTextWidth(v);
        const txX = cx + cellW - txW - 2; // alinhar à direita
        pdf.text(v, txX, y + 5);
        // desenhar divisória vertical
        pdf.line(cx, y, cx, y + rowHeight);
        cx += cellW;
      }
      y += rowHeight;
    }

    if (items.length === 0) {
      await ensureSpace(10);
      pdf.text('Sem votos nesta categoria.', margin + 2, y + 6);
      y += 12;
    } else {
      y += 6;
    }
  }

  pdf.save(`votacao_${areaKey}.pdf`);
}

export async function exportCategoryVotesByWorkPdf(areaKey: string): Promise<void> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 15;
  let y = 20;
  let currentPage = 1;

  const addHeader = async () => {
    if (currentPage === 1) {
      try {
        const logoUrl = '/logo-mppi.png';
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const targetW = 55;
            const ratio = img.width && img.height ? (img.width / img.height) : 3.5;
            const targetH = Math.round(targetW / ratio);
            canvas.width = targetW * 3;
            canvas.height = targetH * 3;
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const data = canvas.toDataURL('image/png', 1.0);
              pdf.addImage(data, 'PNG', margin, 10, targetW, targetH);
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = logoUrl;
        });
      } catch {}
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      const hdr1 = 'Prêmio Melhores Práticas – 9ª Edição';
      const hdr1w = pdf.getTextWidth(hdr1);
      pdf.text(hdr1, (pageWidth - hdr1w) / 2, 18);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const hdr2 = 'Relatório por inscrição';
      const hdr2w = pdf.getTextWidth(hdr2);
      pdf.text(hdr2, (pageWidth - hdr2w) / 2, 24);
      y = 32;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    const title = `Votação por Categoria – ${areaLabel(areaKey)}`;
    const tw = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - tw) / 2, y);
    y += 8;
    pdf.setLineWidth(0.4);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  const ensureSpace = async (needed: number, onNewPage?: () => Promise<void> | void) => {
    const pageHeight = pdf.internal.pageSize.height;
    if (y + needed > pageHeight - 20) {
      pdf.addPage();
      y = 20;
      currentPage++;
      await addHeader();
      if (onNewPage) await onNewPage();
    }
  };

  await addHeader();

  // colunas: Jurado + critérios
  const totalWidth = pageWidth - margin * 2;
  const numW = 15;
  const cols = [
    { key: 'jurado', label: 'Jurado', width: totalWidth - numW * 7 },
    { key: 'coop', label: 'Coop', width: numW },
    { key: 'inov', label: 'Inov', width: numW },
    { key: 'resol', label: 'Resol', width: numW },
    { key: 'imp', label: 'Imp', width: numW },
    { key: 'ods', label: 'ODS', width: numW },
    { key: 'rep', label: 'Rep', width: numW },
    { key: 'total', label: 'Total', width: numW },
  ];

  const { data: inscricoes } = await getAllInscricoes(1, 1000, { area_atuacao: areaKey } as any);
  const list = inscricoes || [];
  const works: Array<{ insc: any; avs: any[]; sumCoop: number; sumInov: number; sumResol: number; sumImp: number; sumOds: number; sumRep: number; totalWork: number }> = [];
  for (const insc of list) {
    const avRes = await getAvaliacoesByInscricao(insc.id);
    const avs = avRes.success ? (avRes.data || []) : [];
    const sumCoop = avs.reduce((sum, r) => sum + (r.cooperacao || 0), 0);
    const sumInov = avs.reduce((sum, r) => sum + (r.inovacao || 0), 0);
    const sumResol = avs.reduce((sum, r) => sum + (r.resolutividade || 0), 0);
    const sumImp = avs.reduce((sum, r) => sum + (r.impacto_social || 0), 0);
    const sumOds = avs.reduce((sum, r) => sum + (r.alinhamento_ods || 0), 0);
    const sumRep = avs.reduce((sum, r) => sum + (r.replicabilidade || 0), 0);
    const totalWork = avs.reduce((sum, r) => sum + (r.total || 0), 0);
    works.push({ insc, avs, sumCoop, sumInov, sumResol, sumImp, sumOds, sumRep, totalWork });
  }

  works.sort((a, b) => {
    if (b.totalWork !== a.totalWork) return b.totalWork - a.totalWork;
    if (b.sumResol !== a.sumResol) return b.sumResol - a.sumResol;
    if (b.sumRep !== a.sumRep) return b.sumRep - a.sumRep;
    return (a.insc.titulo_iniciativa || '').localeCompare(b.insc.titulo_iniciativa || '', 'pt-BR', { sensitivity: 'base' });
  });

  for (const { insc, avs, sumCoop, sumInov, sumResol, sumImp, sumOds, sumRep, totalWork } of works) {
    await ensureSpace(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    const title = insc.titulo_iniciativa || '';
    const wrap = pdf.splitTextToSize(title, totalWidth);
    pdf.text(wrap, margin, y);
    y += Math.max(wrap.length * 4, 6);

    // cabeçalho da tabela
    await ensureSpace(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    let x = margin;
    const headerHeight = 7;
    pdf.setFillColor(230,230,230);
    pdf.rect(margin, y, totalWidth, headerHeight, 'F');
    for (const c of cols) {
      pdf.text(c.label, x + 2, y + 5);
      x += c.width;
    }
    pdf.setDrawColor(150);
    pdf.rect(margin, y, totalWidth, headerHeight);
    y += headerHeight;

    // linhas: avaliações por jurado
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const lh = 4;
    for (const r of avs) {
      const jur = r.jurado_username || '';
      const jurWrap = pdf.splitTextToSize(jur, cols[0].width - 4);
      const rowH = Math.max(jurWrap.length * lh, 8);
      await ensureSpace(rowH, async () => {
        // repetir cabeçalho da inscrição e da tabela na nova página
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        const title2 = insc.titulo_iniciativa || '';
        const wrap2 = pdf.splitTextToSize(title2, totalWidth);
        pdf.text(wrap2, margin, y);
        y += Math.max(wrap2.length * 4, 6);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        let xx = margin;
        pdf.setFillColor(230,230,230);
        pdf.rect(margin, y, totalWidth, headerHeight, 'F');
        for (const c of cols) { pdf.text(c.label, xx + 2, y + 5); xx += c.width; }
        pdf.setDrawColor(150);
        pdf.rect(margin, y, totalWidth, headerHeight);
        y += headerHeight;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
      });
      pdf.rect(margin, y, totalWidth, rowH);
      let cx = margin;
      pdf.text(jurWrap, cx + 2, y + 3);
      cx += cols[0].width;
      const vals = [r.cooperacao, r.inovacao, r.resolutividade, r.impacto_social, r.alinhamento_ods, r.replicabilidade, r.total];
      for (let i = 1; i < cols.length; i++) {
        const v = String(vals[i - 1] ?? '');
        const cw = cols[i].width;
        const txW = pdf.getTextWidth(v);
        const txX = cx + cw - txW - 2;
        pdf.text(v, txX, y + 5);
        pdf.line(cx, y, cx, y + rowH);
        cx += cw;
      }
      y += rowH;
    }
    // Linha de resumo: pontuação total do trabalho
    const summaryH = 8;
    await ensureSpace(summaryH, async () => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
    });
    pdf.setFillColor(245,245,245);
    pdf.rect(margin, y, totalWidth, summaryH, 'F');
    pdf.rect(margin, y, totalWidth, summaryH);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Pontuação total do trabalho', margin + 2, y + 5);
    // divisórias de células
    let sx = margin;
    for (const c of cols) {
      pdf.line(sx, y, sx, y + summaryH);
      sx += c.width;
    }
    // valores por critério (alinhar à direita)
    const sums = [sumCoop, sumInov, sumResol, sumImp, sumOds, sumRep, totalWork];
    let cxSum = margin + cols[0].width;
    for (let i = 1; i < cols.length; i++) {
      const v = String(sums[i - 1]);
      const cw = cols[i].width;
      const txW = pdf.getTextWidth(v);
      const txX = cxSum + cw - txW - 2;
      pdf.text(v, txX, y + 5);
      cxSum += cw;
    }
    y += summaryH + 6;
  }

  pdf.save(`votacao_por_trabalho_${areaKey}.pdf`);
}
