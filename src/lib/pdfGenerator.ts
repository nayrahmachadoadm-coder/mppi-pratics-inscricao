import jsPDF from 'jspdf';

interface FormData {
  nomeCompleto: string;
  cargoFuncao: string;
  matricula: string;
  unidadeSetor: string;
  telefoneInstitucional: string;
  emailInstitucional: string;
  equipeEnvolvida: string;
  area: string;
  tituloIniciativa: string;
  anoInicioExecucao: string;
  situacaoAtual: string;
  dataConclusao?: string;
  resumoExecutivo: string;
  problemaNecessidade: string;
  objetivosEstrategicos: string;
  etapasMetodologia: string;
  resultadosAlcancados: string;
  cooperacao: string;
  inovacao: string;
  resolutividade: string;
  impactoSocial: string;
  alinhamentoODS: string;
  replicabilidade: string;
  participouEdicoesAnteriores: string;
  especificarEdicoesAnteriores?: string;
  foiVencedorAnterior: string;
  concordaTermos: boolean;
  localData: string;
}

export const generatePDF = (formData: FormData): Promise<Blob> => {
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
    addText(`Nome Completo: ${formData.nomeCompleto}`);
    addText(`Cargo/Função: ${formData.cargoFuncao}`);
    addText(`Matrícula: ${formData.matricula}`);
    addText(`Unidade/Setor: ${formData.unidadeSetor}`);
    addText(`Telefone Institucional: ${formData.telefoneInstitucional}`);
    addText(`E-mail Institucional: ${formData.emailInstitucional}`);
    yPosition += 5;

    // Step 2 - Informações da Inscrição
    addText('2. INFORMAÇÕES DA INSCRIÇÃO', 12, true);
    addText(`Título da Prática/Projeto: ${formData.tituloIniciativa}`);
    
    // Mapear área para texto legível
    const areaMap: { [key: string]: string } = {
      'finalistica-pratica': 'Prática Finalística',
      'finalistica-projeto': 'Projeto Finalístico',
      'estruturante-pratica': 'Prática Estruturante',
      'estruturante-projeto': 'Projeto Estruturante',
      'categoria-especial-ia': 'Categoria Especial – Inteligência Artificial'
    };
    addText(`Área/Categoria: ${areaMap[formData.area] || formData.area}`);
    
    addText(`Ano de Início da Execução: ${formData.anoInicioExecucao}`);
    
    const situacaoMap: { [key: string]: string } = {
      'concluido': 'Concluído',
      'em-execucao': 'Em execução'
    };
    addText(`Situação Atual: ${situacaoMap[formData.situacaoAtual] || formData.situacaoAtual}`);
    
    if (formData.dataConclusao) {
      addText(`Data de Conclusão: ${formData.dataConclusao}`);
    }
    
    addText(`Equipe Envolvida: ${formData.equipeEnvolvida}`);
    yPosition += 5;

    // Step 3 - Descrição
    addText('3. DESCRIÇÃO', 12, true);
    addText(`Resumo Executivo: ${formData.resumoExecutivo}`);
    addText(`Problema/Necessidade: ${formData.problemaNecessidade}`);
    addText(`Objetivos Estratégicos: ${formData.objetivosEstrategicos}`);
    addText(`Etapas/Metodologia: ${formData.etapasMetodologia}`);
    addText(`Resultados Alcançados: ${formData.resultadosAlcancados}`);
    yPosition += 5;

    // Step 4 - Critérios
    addText('4. CRITÉRIOS DE AVALIAÇÃO', 12, true);
    addText(`Cooperação: ${formData.cooperacao}`);
    addText(`Inovação: ${formData.inovacao}`);
    addText(`Resolutividade: ${formData.resolutividade}`);
    addText(`Impacto Social: ${formData.impactoSocial}`);
    addText(`Alinhamento aos ODS: ${formData.alinhamentoODS}`);
    addText(`Replicabilidade: ${formData.replicabilidade}`);
    yPosition += 5;

    // Step 5 - Finalização
    addText('5. INFORMAÇÕES ADICIONAIS', 12, true);
    
    const participouMap: { [key: string]: string } = {
      'sim': 'Sim',
      'nao': 'Não'
    };
    addText(`Participou de edições anteriores: ${participouMap[formData.participouEdicoesAnteriores] || formData.participouEdicoesAnteriores}`);
    
    if (formData.especificarEdicoesAnteriores) {
      addText(`Especificação: ${formData.especificarEdicoesAnteriores}`);
    }
    
    addText(`Foi vencedor anterior: ${participouMap[formData.foiVencedorAnterior] || formData.foiVencedorAnterior}`);
    addText(`Concordou com os termos: ${formData.concordaTermos ? 'Sim' : 'Não'}`);
    
    if (formData.localData) {
      addText(`Local e Data: ${formData.localData}`);
    }

    yPosition += 10;
    addText(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, 8);

    // Converter para Blob
    const pdfBlob = pdf.output('blob');
    resolve(pdfBlob);
  });
};