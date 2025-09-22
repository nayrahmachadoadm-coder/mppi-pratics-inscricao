import jsPDF from 'jspdf';

interface InscricaoData {
  nome: string;
  email: string;
  telefone: string;
  orgao: string;
  cargo: string;
  titulo_pratica: string;
  descricao_pratica: string;
  categoria: string;
  objetivos: string;
  metodologia: string;
  resultados: string;
  inovacao: string;
  sustentabilidade: string;
  replicabilidade: string;
  participacao_anterior: boolean;
  edicao_anterior?: string;
  declaracao_veracidade: boolean;
  created_at: string;
}

export const generatePDF = (inscricaoData: InscricaoData): Promise<void> => {
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (additionalHeight: number = 0) => {
      if (yPosition + additionalHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = 20;
      }
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

    // Cabeçalho
    addText('PRÊMIO MELHORES PRÁTICAS MPPI - 9ª EDIÇÃO - 2025', 16, true);
    addText('FICHA DE INSCRIÇÃO', 14, true);
    yPosition += 10;

    // Step 1 - Dados do Proponente
    addText('1. DADOS DO PROPONENTE', 12, true);
    addText(`Nome Completo: ${inscricaoData.nome}`);
    addText(`Cargo/Função: ${inscricaoData.cargo}`);
    addText(`Órgão/Unidade: ${inscricaoData.orgao}`);
    addText(`Telefone: ${inscricaoData.telefone}`);
    addText(`E-mail: ${inscricaoData.email}`);
    yPosition += 5;

    // Step 2 - Informações da Prática
    addText('2. INFORMAÇÕES DA PRÁTICA', 12, true);
    addText(`Título da Prática/Projeto: ${inscricaoData.titulo_pratica}`);
    addText(`Categoria: ${inscricaoData.categoria}`);
    yPosition += 5;

    // Step 3 - Descrição
    addText('3. DESCRIÇÃO DA PRÁTICA', 12, true);
    addText(`Descrição: ${inscricaoData.descricao_pratica}`);
    addText(`Objetivos: ${inscricaoData.objetivos}`);
    addText(`Metodologia: ${inscricaoData.metodologia}`);
    addText(`Resultados: ${inscricaoData.resultados}`);
    yPosition += 5;

    // Step 4 - Critérios
    addText('4. CRITÉRIOS DE AVALIAÇÃO', 12, true);
    addText(`Inovação: ${inscricaoData.inovacao}`);
    addText(`Sustentabilidade/Impacto Social: ${inscricaoData.sustentabilidade}`);
    addText(`Replicabilidade: ${inscricaoData.replicabilidade}`);
    yPosition += 5;

    // Step 5 - Informações Adicionais
    addText('5. INFORMAÇÕES ADICIONAIS', 12, true);
    addText(`Participou de edições anteriores: ${inscricaoData.participacao_anterior ? 'Sim' : 'Não'}`);
    
    if (inscricaoData.edicao_anterior) {
      addText(`Especificação: ${inscricaoData.edicao_anterior}`);
    }
    
    addText(`Declaração de veracidade: ${inscricaoData.declaracao_veracidade ? 'Sim' : 'Não'}`);
    yPosition += 5;

    // Informações do documento
    addText(`Data da inscrição: ${new Date(inscricaoData.created_at).toLocaleString('pt-BR')}`, 8);
    addText(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, 8);

    // Salvar o PDF
    const fileName = `Inscricao_${inscricaoData.nome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
    resolve();
  });
};