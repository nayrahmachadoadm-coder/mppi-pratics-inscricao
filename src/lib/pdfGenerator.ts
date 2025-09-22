import jsPDF from 'jspdf';

interface InscricaoData {
  nome_completo: string;
  email_institucional: string;
  telefone: string;
  lotacao: string;
  cargo_funcao: string;
  titulo_iniciativa: string;
  descricao_iniciativa: string;
  area_atuacao: string;
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
    addText(`Nome Completo: ${inscricaoData.nome_completo}`);
    addText(`Cargo/Função: ${inscricaoData.cargo_funcao}`);
    addText(`Órgão/Unidade: ${inscricaoData.lotacao}`);
    addText(`Telefone: ${inscricaoData.telefone}`);
    addText(`E-mail: ${inscricaoData.email_institucional}`);
    yPosition += 5;

    // Step 2 - Informações da Prática
    addText('2. INFORMAÇÕES DA PRÁTICA', 12, true);
    addText(`Título da Prática/Projeto: ${inscricaoData.titulo_iniciativa}`);
    addText(`Área: ${inscricaoData.area_atuacao}`);
    yPosition += 5;

    // Step 3 - Descrição
    addText('3. DESCRIÇÃO DA PRÁTICA', 12, true);
    addText(`Descrição da Iniciativa: ${inscricaoData.descricao_iniciativa}`);
    addText(`Objetivos: ${inscricaoData.objetivos}`);
    addText(`Metodologia: ${inscricaoData.metodologia}`);
    addText(`Principais Resultados: ${inscricaoData.principais_resultados}`);
    yPosition += 5;

    // Step 4 - Critérios
    addText('4. CRITÉRIOS DE AVALIAÇÃO', 12, true);
    addText(`Cooperação: ${inscricaoData.cooperacao}`);
    addText(`Inovação: ${inscricaoData.inovacao}`);
    addText(`Resolutividade: ${inscricaoData.resolutividade}`);
    addText(`Impacto Social: ${inscricaoData.impacto_social}`);
    addText(`Alinhamento aos ODS: ${inscricaoData.alinhamento_ods}`);
    addText(`Replicabilidade: ${inscricaoData.replicabilidade}`);
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

    // Informações do documento
    addText(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, 8);

    // Salvar o PDF
    const fileName = `Inscricao_${inscricaoData.nome_completo.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
    resolve();
  });
};