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
    const pdf = new jsPDF();
    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (additionalHeight: number = 0) => {
      if (yPosition + additionalHeight > pageHeight - 40) { // Deixar espaço para o rodapé
        addFooter();
        pdf.addPage();
        addHeader();
        yPosition = 60; // Posição após o cabeçalho
      }
    };

    // Função para adicionar cabeçalho
    const addHeader = async () => {
      try {
        // Carregar e adicionar logo
        const logoUrl = 'https://i.postimg.cc/pT3rRnwr/logo-mppi.png';
        const logoX = (pageWidth - 90) / 2; // Centralizar logo de 90px
        
        // Criar uma imagem temporária para carregar o logo
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolveImg) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 90;
            canvas.height = 15;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0, 90, 15);
              const imgData = canvas.toDataURL('image/png');
              pdf.addImage(imgData, 'PNG', logoX, 15, 90, 15);
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
      const footerY = pageHeight - 20;
      
      // Linha divisória do rodapé
      pdf.setLineWidth(0.5);
      pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
      
      // Informações do rodapé
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      // Lado esquerdo
      pdf.text('9ª ed. Prêmio Melhores Práticas', margin, footerY);
      
      // Centro
      const pageInfo = 'Página 1/1';
      const pageInfoWidth = pdf.getTextWidth(pageInfo);
      pdf.text(pageInfo, (pageWidth - pageInfoWidth) / 2, footerY);
      
      // Lado direito
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('pt-BR') + ' às ' + currentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dateWidth = pdf.getTextWidth(dateStr);
      pdf.text(dateStr, pageWidth - margin - dateWidth, footerY);
    };

    // Função para adicionar texto com quebra de linha
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const splitText = pdf.splitTextToSize(text, 170);
      const textHeight = splitText.length * lineHeight;
      
      checkPageBreak(textHeight);
      
      pdf.text(splitText, margin, yPosition);
      yPosition += textHeight + 3;
    };

    // Adicionar cabeçalho inicial
    await addHeader();
    yPosition = 70;

    // Step 1 - Dados do Proponente
    addText('1. DADOS DO PROPONENTE', 12, true);
    addText(`Nome Completo: ${inscricaoData.nome_completo}`);
    addText(`Cargo/Função: ${inscricaoData.cargo_funcao}`);
    if (inscricaoData.matricula) {
      addText(`Matrícula: ${inscricaoData.matricula}`);
    }
    addText(`Órgão/Unidade: ${inscricaoData.lotacao}`);
    addText(`Telefone: ${inscricaoData.telefone}`);
    addText(`E-mail: ${inscricaoData.email_institucional}`);
    yPosition += 5;

    // Step 2 - Informações da Inscrição
    addText('2. INFORMAÇÕES DA INSCRIÇÃO', 12, true);
    addText(`Título da Prática/Projeto: ${inscricaoData.titulo_iniciativa}`);
    addText(`Área: ${inscricaoData.area_atuacao}`);
    if (inscricaoData.situacao_atual) {
      addText(`Situação Atual: ${inscricaoData.situacao_atual}`);
    }
    if (inscricaoData.data_conclusao) {
      addText(`Data de Conclusão: ${inscricaoData.data_conclusao}`);
    }
    if (inscricaoData.publico_alvo) {
      addText(`Relação da Equipe: ${inscricaoData.publico_alvo}`);
    }
    yPosition += 5;

    // Step 3 - Descrição
    addText('3. DESCRIÇÃO DA PRÁTICA', 12, true);
    addText(`Resumo Executivo: ${inscricaoData.descricao_iniciativa}`);
    if (inscricaoData.problema_necessidade) {
      addText(`Problema ou Necessidade: ${inscricaoData.problema_necessidade}`);
    }
    addText(`Objetivos: ${inscricaoData.objetivos}`);
    addText(`Metodologia: ${inscricaoData.metodologia}`);
    addText(`Principais Resultados: ${inscricaoData.principais_resultados}`);
    yPosition += 5;

    // Step 4 - Critérios
    addText('4. CRITÉRIOS DE AVALIAÇÃO', 12, true);
    
    addText('Cooperação:', 10, true);
    addText(inscricaoData.cooperacao);
    
    addText('Inovação:', 10, true);
    addText(inscricaoData.inovacao);
    
    addText('Resolutividade:', 10, true);
    addText(inscricaoData.resolutividade);
    
    addText('Impacto Social:', 10, true);
    addText(inscricaoData.impacto_social);
    
    addText('Alinhamento aos ODS:', 10, true);
    addText(inscricaoData.alinhamento_ods);
    
    addText('Replicabilidade:', 10, true);
    addText(inscricaoData.replicabilidade);
    yPosition += 5;

    // Step 5 - Informações Adicionais
    addText('5. INFORMAÇÕES ADICIONAIS', 12, true);
    addText(`Participou de edições anteriores: ${inscricaoData.participou_edicoes_anteriores ? 'Sim' : 'Não'}`);
    addText(`Foi vencedor anterior: ${inscricaoData.foi_vencedor_anterior ? 'Sim' : 'Não'}`);
    
    if (inscricaoData.observacoes) {
      addText(`Observações: ${inscricaoData.observacoes}`);
    }
    
    addText(`Declaração de veracidade: ${inscricaoData.declaracao ? 'Sim' : 'Não'}`);
    yPosition += 5;

    // Adicionar rodapé final
    addFooter();

    // Salvar o PDF
    const fileName = `Inscricao_${inscricaoData.nome_completo.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
    resolve();
  });
};