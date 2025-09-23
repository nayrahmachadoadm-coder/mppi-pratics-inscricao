import jsPDF from 'jspdf';

interface InscricaoData {
  nome_completo: string;
  email_institucional: string;
  telefone: string;
  lotacao: string;
  cargo_funcao: string;
  matricula?: string; // Campo opcional - matrícula do proponente
  titulo_iniciativa: string;
  descricao_iniciativa: string;
  area_atuacao: string;
  situacao_atual?: string; // Campo para situação atual da prática
  data_conclusao?: string | null; // Campo para data de conclusão
  publico_alvo?: string; // Campo para relação da equipe
  problema_necessidade?: string; // Campo para problema ou necessidade
  objetivos: string;
  metodologia: string;
  principais_resultados: string;
  cooperacao: string;
  inovacao: string;
  resolutividade: string;
  impacto_social: string;
  alinhamento_ods: string;
  replicabilidade: string;
  participou_edicoes_anteriores: boolean;
  foi_vencedor_anterior: boolean;
  declaracao: boolean;
  observacoes?: string | null;
  created_at?: string;
}

export const generatePDF = (inscricaoData: InscricaoData): Promise<void> => {
  return new Promise(async (resolve) => {
    // Primeira passada: calcular o número total de páginas
    const tempPdf = new jsPDF();
    let tempYPosition = 20;
    const lineHeight = 5; // Reduzido de 7 para 5 para compactar
    const pageHeight = tempPdf.internal.pageSize.height;
    const pageWidth = tempPdf.internal.pageSize.width;
    const margin = 20;
    let totalPages = 1;

    // Função para simular quebra de página e contar páginas
    const simulatePageBreak = (additionalHeight: number = 0) => {
      if (tempYPosition + additionalHeight > pageHeight - 30) {
        totalPages++;
        tempYPosition = 20;
      }
    };

    // Função para simular adição de texto e contar altura
    const simulateAddText = (text: string, fontSize: number = 9) => {
      tempPdf.setFontSize(fontSize);
      const splitText = tempPdf.splitTextToSize(text, 170);
      const textHeight = splitText.length * lineHeight;
      simulatePageBreak(textHeight);
      tempYPosition += textHeight + 1; // Reduzido de +3 para +1
    };

    // Simular todo o conteúdo para calcular páginas
    tempYPosition = 70; // Após cabeçalho
    
    // Step 1
    simulateAddText('1. DADOS DO PROPONENTE', 11);
    simulateAddText(`Nome Completo: ${inscricaoData.nome_completo}`);
    simulateAddText(`Cargo/Função: ${inscricaoData.cargo_funcao}`);
    if (inscricaoData.matricula) simulateAddText(`Matrícula: ${inscricaoData.matricula}`);
    simulateAddText(`Órgão/Unidade: ${inscricaoData.lotacao}`);
    simulateAddText(`Telefone: ${inscricaoData.telefone}`);
    simulateAddText(`E-mail: ${inscricaoData.email_institucional}`);
    tempYPosition += 2;

    // Step 2
    simulateAddText('2. INFORMAÇÕES DA INSCRIÇÃO', 11);
    simulateAddText(`Título da Prática/Projeto: ${inscricaoData.titulo_iniciativa}`);
    simulateAddText(`Área: ${inscricaoData.area_atuacao}`);
    if (inscricaoData.situacao_atual) simulateAddText(`Situação Atual: ${inscricaoData.situacao_atual}`);
    if (inscricaoData.data_conclusao) simulateAddText(`Data de Conclusão: ${inscricaoData.data_conclusao}`);
    if (inscricaoData.publico_alvo) {
      simulateAddText('Relação da Equipe:', 9);
      simulateAddText(inscricaoData.publico_alvo);
    }
    tempYPosition += 2;

    // Step 3
    simulateAddText('3. DESCRIÇÃO DA PRÁTICA', 11);
    simulateAddText('Resumo Executivo:', 9);
    simulateAddText(inscricaoData.descricao_iniciativa);
    if (inscricaoData.problema_necessidade) {
      simulateAddText('Problema ou Necessidade:', 9);
      simulateAddText(inscricaoData.problema_necessidade);
    }
    simulateAddText('Objetivos:', 9);
    simulateAddText(inscricaoData.objetivos);
    simulateAddText('Metodologia:', 9);
    simulateAddText(inscricaoData.metodologia);
    simulateAddText('Principais Resultados:', 9);
    simulateAddText(inscricaoData.principais_resultados);
    tempYPosition += 2;

    // Step 4
    simulateAddText('4. CRITÉRIOS DE AVALIAÇÃO', 11);
    simulateAddText('Cooperação:', 9);
    simulateAddText(inscricaoData.cooperacao);
    simulateAddText('Inovação:', 9);
    simulateAddText(inscricaoData.inovacao);
    simulateAddText('Resolutividade:', 9);
    simulateAddText(inscricaoData.resolutividade);
    simulateAddText('Impacto Social:', 9);
    simulateAddText(inscricaoData.impacto_social);
    simulateAddText('Alinhamento aos ODS:', 9);
    simulateAddText(inscricaoData.alinhamento_ods);
    simulateAddText('Replicabilidade:', 9);
    simulateAddText(inscricaoData.replicabilidade);
    tempYPosition += 2;

    // Step 5
    simulateAddText('5. INFORMAÇÕES ADICIONAIS', 11);
    simulateAddText(`Participou de edições anteriores: ${inscricaoData.participou_edicoes_anteriores ? 'Sim' : 'Não'}`);
    simulateAddText(`Foi vencedor anterior: ${inscricaoData.foi_vencedor_anterior ? 'Sim' : 'Não'}`);
    if (inscricaoData.observacoes) simulateAddText(`Observações: ${inscricaoData.observacoes}`);
    simulateAddText(`Declaração de veracidade: ${inscricaoData.declaracao ? 'Sim' : 'Não'}`);

    // Agora gerar o PDF real com o número correto de páginas
    const pdf = new jsPDF();
    let yPosition = 20;
    let currentPage = 1;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (additionalHeight: number = 0) => {
      if (yPosition + additionalHeight > pageHeight - 30) { // Deixar espaço para o rodapé
        addFooter();
        pdf.addPage();
        currentPage++;
        totalPages = Math.max(totalPages, currentPage);
        // Para páginas 2 em diante, não adicionar cabeçalho e usar margem menor
        yPosition = 20; // Margem superior reduzida para páginas 2+
      }
    };

    // Função para adicionar cabeçalho
    const addHeader = async () => {
      try {
        // Carregar e adicionar logo
        const logoUrl = 'https://i.postimg.cc/pT3rRnwr/logo-mppi.png';
        const logoWidth = 82.5; // Reduzido de 90px para 82.5px (330/4 = 82.5)
        const logoHeight = 15;
        const logoX = (pageWidth - logoWidth) / 2; // Centralizar logo
        
        // Criar uma imagem temporária para carregar o logo
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolveImg) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Usar escala alta para melhor qualidade (4x)
            const scale = 4;
            const finalWidth = logoWidth;
            const finalHeight = logoHeight;
            
            canvas.width = finalWidth * scale;
            canvas.height = finalHeight * scale;
            
            if (ctx) {
              // Configurar contexto para alta qualidade
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              
              // Desenhar imagem em alta resolução
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Converter para PNG com alta qualidade
              const imgData = canvas.toDataURL('image/png', 1.0);
              pdf.addImage(imgData, 'PNG', logoX, 15, finalWidth, finalHeight);
            }
            resolveImg();
          };
          
          img.onerror = () => {
            // Se não conseguir carregar a imagem, continuar sem ela
            resolveImg();
          };
          
          img.src = logoUrl;
        });
      } catch (error) {
        // Se houver erro ao carregar a imagem, continuar sem ela
        console.warn('Não foi possível carregar o logo:', error);
      }

      // Título centralizado
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const title1 = 'PRÊMIO MELHORES PRÁTICAS MPPI';
      
      const title1Width = pdf.getTextWidth(title1);
      pdf.text(title1, (pageWidth - title1Width) / 2, 40);
      
      // Subtítulo com fonte menor
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const title2 = '9ª Edição - 2025 | Ficha de Inscrição';
      const title2Width = pdf.getTextWidth(title2);
      pdf.text(title2, (pageWidth - title2Width) / 2, 50);
      
      // Linha divisória do cabeçalho
      pdf.setLineWidth(0.5);
      pdf.line(margin, 60, pageWidth - margin, 60);
    };

    // Função para adicionar rodapé
    const addFooter = () => {
      const footerY = pageHeight - 10; // Posicionado mais próximo da margem inferior
      
      // Linha divisória do rodapé
      pdf.setLineWidth(0.5);
      pdf.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
      
      // Informações do rodapé
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      // Lado esquerdo
      pdf.text('9ª ed. Prêmio Melhores Práticas', margin, footerY);
      
      // Centro - Numeração correta das páginas
      const pageInfo = `Página ${currentPage}/${totalPages}`;
      const pageInfoWidth = pdf.getTextWidth(pageInfo);
      pdf.text(pageInfo, (pageWidth - pageInfoWidth) / 2, footerY);
      
      // Lado direito
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('pt-BR') + ' às ' + currentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dateWidth = pdf.getTextWidth(dateStr);
      pdf.text(dateStr, pageWidth - margin - dateWidth, footerY);
    };

    // Função para adicionar texto com quebra de linha e alinhamento justificado
    const addText = (text: string, fontSize: number = 9, isBold: boolean = false, isTitle: boolean = false, forceLeftAlign: boolean = false) => {
      // Padronizar tamanhos de fonte
      if (isTitle) {
        fontSize = 11; // Títulos das seções
      } else if (isBold && !isTitle) {
        fontSize = 9; // Subtítulos
      } else {
        fontSize = 9; // Texto normal
      }
      
      // Primeiro calcular o tamanho do texto com configurações temporárias
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const maxWidth = 170;
      const splitText = pdf.splitTextToSize(text, maxWidth);
      const textHeight = splitText.length * lineHeight;
      
      checkPageBreak(textHeight);
      
      // Reconfigurar fonte após possível quebra de página
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      // Implementar alinhamento justificado para textos longos (não títulos), exceto quando forçado alinhamento à esquerda
      if (!isBold && splitText.length > 1 && !forceLeftAlign) {
        // Para textos com múltiplas linhas, aplicar justificação
        for (let i = 0; i < splitText.length; i++) {
          const line = splitText[i];
          const isLastLine = i === splitText.length - 1;
          
          if (!isLastLine && line.trim().length > 0) {
            // Justificar linha (exceto a última)
            const words = line.trim().split(' ');
            if (words.length > 1) {
              const lineWidth = pdf.getTextWidth(line);
              const spaceWidth = (maxWidth - lineWidth) / (words.length - 1);
              
              let xPos = margin;
              for (let j = 0; j < words.length; j++) {
                pdf.text(words[j], xPos, yPosition + (i * lineHeight));
                if (j < words.length - 1) {
                  xPos += pdf.getTextWidth(words[j]) + pdf.getTextWidth(' ') + spaceWidth;
                }
              }
            } else {
              pdf.text(line, margin, yPosition + (i * lineHeight));
            }
          } else {
            // Última linha ou linha única - alinhamento normal
            pdf.text(line, margin, yPosition + (i * lineHeight));
          }
        }
      } else {
        // Para títulos e textos curtos - alinhamento normal
        pdf.text(splitText, margin, yPosition);
      }
      
      yPosition += textHeight + 1; // Reduzido de +3 para +1
    };

    // Adicionar cabeçalho inicial
    await addHeader();
    yPosition = 70;

    // Step 1 - Dados do Proponente
    addText('1. DADOS DO PROPONENTE', 11, true, true);
    addText(`Nome Completo: ${inscricaoData.nome_completo}`);
    addText(`Cargo/Função: ${inscricaoData.cargo_funcao}`);
    if (inscricaoData.matricula) {
      addText(`Matrícula: ${inscricaoData.matricula}`);
    }
    addText(`Órgão/Unidade: ${inscricaoData.lotacao}`);
    addText(`Telefone: ${inscricaoData.telefone}`);
    addText(`E-mail: ${inscricaoData.email_institucional}`);
    yPosition += 2; // Reduzido de 5 para 2

    // Step 2 - Informações da Inscrição
    addText('2. INFORMAÇÕES DA INSCRIÇÃO', 11, true, true);
    addText(`Título da Prática/Projeto: ${inscricaoData.titulo_iniciativa}`);
    addText(`Área: ${inscricaoData.area_atuacao}`);
    if (inscricaoData.situacao_atual) {
      addText(`Situação Atual: ${inscricaoData.situacao_atual}`);
    }
    if (inscricaoData.data_conclusao) {
      addText(`Data de Conclusão: ${inscricaoData.data_conclusao}`);
    }
    if (inscricaoData.publico_alvo) {
      addText('Relação da Equipe:', 9, true);
      addText(inscricaoData.publico_alvo, 9, false, false, true);
    }
    yPosition += 2; // Reduzido de 5 para 2

    // Step 3 - Descrição
    addText('3. DESCRIÇÃO DA PRÁTICA', 11, true, true);
    
    addText('Resumo Executivo:', 9, true);
    addText(inscricaoData.descricao_iniciativa);
    
    if (inscricaoData.problema_necessidade) {
      addText('Problema ou Necessidade:', 9, true);
      addText(inscricaoData.problema_necessidade);
    }
    
    addText('Objetivos:', 9, true);
    addText(inscricaoData.objetivos);
    
    addText('Metodologia:', 9, true);
    addText(inscricaoData.metodologia);
    
    addText('Principais Resultados:', 9, true);
    addText(inscricaoData.principais_resultados);
    yPosition += 2; // Reduzido de 5 para 2

    // Step 4 - Critérios
    addText('4. CRITÉRIOS DE AVALIAÇÃO', 11, true, true);
    
    addText('Cooperação:', 9, true);
    addText(inscricaoData.cooperacao);
    
    addText('Inovação:', 9, true);
    addText(inscricaoData.inovacao);
    
    addText('Resolutividade:', 9, true);
    addText(inscricaoData.resolutividade);
    
    addText('Impacto Social:', 9, true);
    addText(inscricaoData.impacto_social);
    
    addText('Alinhamento aos ODS:', 9, true);
    addText(inscricaoData.alinhamento_ods);
    
    addText('Replicabilidade:', 9, true);
    addText(inscricaoData.replicabilidade);
    yPosition += 2; // Reduzido de 5 para 2

    // Step 5 - Informações Adicionais
    addText('5. INFORMAÇÕES ADICIONAIS', 11, true, true);
    addText(`Participou de edições anteriores: ${inscricaoData.participou_edicoes_anteriores ? 'Sim' : 'Não'}`);
    addText(`Foi vencedor anterior: ${inscricaoData.foi_vencedor_anterior ? 'Sim' : 'Não'}`);
    
    if (inscricaoData.observacoes) {
      addText(`Observações: ${inscricaoData.observacoes}`);
    }
    
    addText(`Declaração de veracidade: ${inscricaoData.declaracao ? 'Sim' : 'Não'}`);
    yPosition += 2; // Reduzido de 5 para 2

    // Adicionar rodapé final
    addFooter();

    // Salvar o PDF
    const fileName = `Inscricao_${inscricaoData.nome_completo.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
    resolve();
  });
};