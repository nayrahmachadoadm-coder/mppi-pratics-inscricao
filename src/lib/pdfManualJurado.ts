import jsPDF from 'jspdf';
import { MANUAL_JURADO_METADATA, MANUAL_SECTIONS } from '@/data/manualJuradoContent';

export async function exportManualJuradoPdf(): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.width; // 210mm
  const pageHeight = pdf.internal.pageSize.height; // 297mm
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm

  // Carrega logotipo do MPPI
  let logoDataUrl: string | null = null;
  let logoRatio = 3.5;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const targetW = 60;
        logoRatio = img.width && img.height ? img.width / img.height : 3.5;
        const targetH = Math.round(targetW / logoRatio);
        canvas.width = targetW * 3;
        canvas.height = targetH * 3;
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          logoDataUrl = canvas.toDataURL('image/png', 1.0);
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = '/logo-mppi.png';
    });
  } catch {
    logoDataUrl = null;
  }

  // Cores institucionais
  const primaryBordo = [112, 21, 30]; // #70151E
  const darkBordo = [74, 4, 4]; // #4A0404
  const gold = [212, 175, 55]; // #D4AF37
  const softGold = [245, 235, 205];
  const darkGray = [45, 55, 72];
  const textMuted = [100, 116, 139];
  const lightBg = [248, 250, 252];

  // Helper para adicionar texto justificado / quebrado
  const renderParagraph = (
    text: string,
    startY: number,
    fontSize = 10,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    color = darkGray
  ): number => {
    pdf.setFont('helvetica', fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);

    const lines = pdf.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.45;

    for (const line of lines) {
      if (startY + lineHeight > pageHeight - 22) {
        pdf.addPage();
        addPageHeader();
        startY = 28;
        pdf.setFont('helvetica', fontStyle);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
      }
      pdf.text(line, margin, startY);
      startY += lineHeight;
    }
    return startY + 2.5; // Espaço após o parágrafo
  };

  // Cabeçalho de páginas de conteúdo (a partir da página 2)
  const addPageHeader = () => {
    // Fundo discreto no topo
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, 22, 'F');

    // Logo no canto superior esquerdo
    if (logoDataUrl) {
      const w = 28;
      const h = w / logoRatio;
      pdf.addImage(logoDataUrl, 'PNG', margin, 7, w, h);
    }

    // Texto de identificação à direita
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(primaryBordo[0], primaryBordo[1], primaryBordo[2]);
    pdf.text('MINISTÉRIO PÚBLICO DO ESTADO DO PIAUÍ', pageWidth - margin, 10, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    pdf.text('Prêmio Melhores Práticas • Manual do Jurado • 10ª Edição', pageWidth - margin, 14, { align: 'right' });

    // Linha dourada
    pdf.setDrawColor(gold[0], gold[1], gold[2]);
    pdf.setLineWidth(0.6);
    pdf.line(margin, 18, pageWidth - margin, 18);
  };

  // Rodapé em todas as páginas (será aplicado em pós-processamento)
  const addPageFooters = () => {
    const totalPages = pdf.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      if (p === 1) {
        // Na capa, rodapé estilizado
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(200, 200, 200);
        pdf.text('Assessoria de Planejamento e Gestão — ASSESPPLAGES | MPPI', pageWidth / 2, pageHeight - 12, { align: 'center' });
        continue;
      }

      pdf.setDrawColor(220, 224, 230);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      pdf.text('Comissão Julgadora Oficial • Edital nº 88/2026', margin, pageHeight - 9);

      pdf.setFont('helvetica', 'bold');
      pdf.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
    }
  };

  /* ==============================================================
     1. PÁGINA 1: CAPA OFICIAL ELEGANTE E SÓBRIA
     ============================================================== */
  // Faixa superior bordô com degradê visual
  pdf.setFillColor(primaryBordo[0], primaryBordo[1], primaryBordo[2]);
  pdf.rect(0, 0, pageWidth, 115, 'F');

  // Detalhe dourado na borda inferior da faixa
  pdf.setFillColor(gold[0], gold[1], gold[2]);
  pdf.rect(0, 113, pageWidth, 2.5, 'F');

  // Logotipo no topo da capa
  if (logoDataUrl) {
    const w = 48;
    const h = w / logoRatio;
    pdf.addImage(logoDataUrl, 'PNG', (pageWidth - w) / 2, 18, w, h);
  }

  // Título na faixa superior
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(gold[0], gold[1], gold[2]);
  pdf.text('MINISTÉRIO PÚBLICO DO ESTADO DO PIAUÍ', pageWidth / 2, 46, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setTextColor(255, 255, 255);
  pdf.text('MANUAL DO JURADO', pageWidth / 2, 62, { align: 'center' });

  // Badge 10 Anos
  pdf.setFillColor(gold[0], gold[1], gold[2]);
  pdf.roundedRect((pageWidth - 95) / 2, 69, 95, 7, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(darkBordo[0], darkBordo[1], darkBordo[2]);
  pdf.text('10ª EDIÇÃO COMEMORATIVA • 10 ANOS', pageWidth / 2, 74, { align: 'center' });

  // Subtítulo
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11.5);
  pdf.setTextColor(250, 240, 220);
  pdf.text('Guia Oficial de Diretrizes, Avaliação Técnica e Julgamento', pageWidth / 2, 86, { align: 'center' });
  pdf.text('Prêmio Melhores Práticas 2026', pageWidth / 2, 93, { align: 'center' });

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(220, 220, 220);
  pdf.text('Em conformidade com o Edital nº 88/2026 — PGJ/PI', pageWidth / 2, 103, { align: 'center' });

  // Corpo inferior da capa (Área Nobre)
  let capaY = 135;

  pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  pdf.roundedRect(margin, capaY, contentWidth, 90, 3, 3, 'F');
  pdf.setDrawColor(210, 215, 225);
  pdf.roundedRect(margin, capaY, contentWidth, 90, 3, 3, 'D');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(primaryBordo[0], primaryBordo[1], primaryBordo[2]);
  pdf.text('FINALIDADE DO DOCUMENTO', margin + 8, capaY + 12);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const finalidadeTexto =
    'Este documento estabelece as diretrizes procedimentais, os critérios de pontuação e as instruções operacionais de uso da plataforma informatizada destinadas aos membros da Comissão Julgadora da 10ª Edição do Prêmio Melhores Práticas do Ministério Público do Estado do Piauí.\n\nSua observância assegura a padronização, a segurança jurídica, o sigilo e a transparência em todas as fases da avaliação técnica.';
  const finalidadeLines = pdf.splitTextToSize(finalidadeTexto, contentWidth - 16);
  pdf.text(finalidadeLines, margin + 8, capaY + 22);

  // Informações de Expediente
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.text('Órgão Responsável:', margin + 8, capaY + 68);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Comissão Julgadora Oficial & Assessoria de Planejamento e Gestão (ASSESPPLAGES)', margin + 42, capaY + 68);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Período de Julgamento:', margin + 8, capaY + 75);
  pdf.setFont('helvetica', 'normal');
  pdf.text('29 de outubro a 09 de novembro de 2026', margin + 46, capaY + 75);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Local & Ano:', margin + 8, capaY + 82);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Procuradoria-Geral de Justiça • Teresina - Piauí, 2026', margin + 30, capaY + 82);

  /* ==============================================================
     2. PÁGINA 2: SUMÁRIO GERAL (TABLE OF CONTENTS)
     ============================================================== */
  pdf.addPage();
  addPageHeader();

  let tocY = 32;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(primaryBordo[0], primaryBordo[1], primaryBordo[2]);
  pdf.text('SUMÁRIO GERAL', margin, tocY);
  tocY += 4;

  pdf.setDrawColor(gold[0], gold[1], gold[2]);
  pdf.setLineWidth(1);
  pdf.line(margin, tocY, margin + 40, tocY);
  tocY += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  pdf.text('Navegue pelos tópicos essenciais de orientação aos membros da Comissão Julgadora:', margin, tocY);
  tocY += 10;

  // Lista dos tópicos no sumário
  MANUAL_SECTIONS.forEach((sec) => {
    pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    pdf.roundedRect(margin, tocY - 4, contentWidth, 11, 1.5, 1.5, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, tocY - 4, contentWidth, 11, 1.5, 1.5, 'D');

    // Número
    pdf.setFillColor(primaryBordo[0], primaryBordo[1], primaryBordo[2]);
    pdf.roundedRect(margin + 2, tocY - 2.5, 7, 7, 1, 1, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text(sec.numero, margin + 5.5, tocY + 2.5, { align: 'center' });

    // Título
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text(sec.titulo, margin + 12, tocY + 3);

    tocY += 13.5;
  });

  /* ==============================================================
     3. PÁGINAS DE CONTEÚDO DETALHADO (SEÇÕES 1 A 12)
     ============================================================== */
  pdf.addPage();
  addPageHeader();
  let currentY = 32;

  for (const sec of MANUAL_SECTIONS) {
    // Verifica espaço para o cabeçalho da seção
    if (currentY > pageHeight - 45) {
      pdf.addPage();
      addPageHeader();
      currentY = 32;
    }

    // Título da Seção
    pdf.setFillColor(primaryBordo[0], primaryBordo[1], primaryBordo[2]);
    pdf.roundedRect(margin, currentY, 8, 8, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(sec.numero, margin + 4, currentY + 5.5, { align: 'center' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(primaryBordo[0], primaryBordo[1], primaryBordo[2]);
    pdf.text(sec.titulo, margin + 12, currentY + 6);
    currentY += 12;

    // Resumo da seção (se houver)
    if (sec.resumo) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9.5);
      pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      currentY = renderParagraph(sec.resumo, currentY, 9.5, 'italic', textMuted);
    }

    // Subseções
    if (sec.subsecoes) {
      for (const sub of sec.subsecoes) {
        if (currentY > pageHeight - 35) {
          pdf.addPage();
          addPageHeader();
          currentY = 30;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10.5);
        pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        pdf.text(sub.titulo, margin, currentY);
        currentY += 5.5;

        for (const p of sub.conteudo) {
          currentY = renderParagraph(p, currentY, 9, 'normal', darkGray);
        }

        // Caixa de destaque (se houver)
        if (sub.destaque) {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            addPageHeader();
            currentY = 30;
          }

          const calloutLines = pdf.splitTextToSize(sub.destaque, contentWidth - 14);
          const boxHeight = calloutLines.length * 4.2 + 8;

          pdf.setFillColor(softGold[0], softGold[1], softGold[2]);
          pdf.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'F');
          pdf.setDrawColor(gold[0], gold[1], gold[2]);
          pdf.setLineWidth(0.8);
          pdf.line(margin, currentY, margin, currentY + boxHeight); // Tarja lateral

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.setTextColor(primaryBordo[0], primaryBordo[1], primaryBordo[2]);
          pdf.text(calloutLines, margin + 6, currentY + 5.5);

          currentY += boxHeight + 4;
        }
      }
    }

    // Renderização de Tabela (se houver na seção)
    if (sec.tabela) {
      if (currentY > pageHeight - 50) {
        pdf.addPage();
        addPageHeader();
        currentY = 30;
      }

      const colWidths = [45, 45, contentWidth - 90];
      const rowHeight = 7.5;

      // Cabeçalho da Tabela
      pdf.setFillColor(primaryBordo[0], primaryBordo[1], primaryBordo[2]);
      pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);

      let colX = margin + 3;
      pdf.text(sec.tabela.cabecalhos[0], colX, currentY + 5);
      colX += colWidths[0];
      pdf.text(sec.tabela.cabecalhos[1], colX, currentY + 5);
      colX += colWidths[1];
      pdf.text(sec.tabela.cabecalhos[2], colX, currentY + 5);

      currentY += rowHeight;

      // Linhas da Tabela
      sec.tabela.linhas.forEach((linha, rowIdx) => {
        if (currentY > pageHeight - 25) {
          pdf.addPage();
          addPageHeader();
          currentY = 30;
        }

        const isEven = rowIdx % 2 === 0;
        pdf.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(margin, currentY, contentWidth, rowHeight, 'D');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

        let lx = margin + 3;
        pdf.text(linha[0], lx, currentY + 5);
        lx += colWidths[0];

        pdf.setFont('helvetica', 'normal');
        pdf.text(linha[1], lx, currentY + 5);
        lx += colWidths[1];

        const val3 = pdf.splitTextToSize(linha[2], colWidths[2] - 4);
        pdf.text(val3[0] || '', lx, currentY + 5);

        currentY += rowHeight;
      });

      currentY += 6;
    }

    currentY += 4; // Espaço entre seções
  }

  // Aplica rodapés em todas as páginas com numeração total exata
  addPageFooters();

  // Salva o documento PDF
  const dataHoje = new Date().toISOString().slice(0, 10);
  pdf.save(`Manual_do_Jurado_MPPI_10Edicao_${dataHoje}.pdf`);
}
