import jsPDF from 'jspdf';
import { formatObjetivoEstrategico } from '@/utils/objetivosEstrategicos';

type GeneratePdfOptions = {
  maskSensitive?: boolean;
};

// Máscara para telefone (exibe 2 primeiros e 2 últimos dígitos)
const maskPhone = (phone: string | undefined): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) {
    return '*'.repeat(Math.max(digits.length, 0));
  }
  const start = digits.slice(0, 2);
  const end = digits.slice(-2);
  const middleLen = digits.length - 4;
  return `${start}${'•'.repeat(middleLen)}${end}`;
};

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

// Funções de formatação para padronizar a exibição
const formatCargoFuncao = (cargo: string) => {
  const cargoMap: { [key: string]: string } = {
    'promotor-de-justica': 'Promotor de Justiça',
    'procurador-de-justica': 'Procurador de Justiça',
    'servidor': 'Servidor'
  };
  
  return cargoMap[cargo] || cargo;
};

const formatAreaAtuacao = (area: string) => {
  const areaMap: { [key: string]: string } = {
    'finalistica-pratica': 'Prática Finalística',
    'finalistica-projeto': 'Projeto Finalístico',
    'estruturante-pratica': 'Prática Estruturante',
    'estruturante-projeto': 'Projeto Estruturante',
    'categoria-especial-ia': 'Categoria Especial – Inteligência Artificial'
  };
  
  return areaMap[area] || area;
};

export const generatePDF = (inscricaoData: InscricaoData, options: GeneratePdfOptions = {}): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
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
    simulateAddText(`Cargo/Função: ${formatCargoFuncao(inscricaoData.cargo_funcao)}`);
    if (inscricaoData.matricula) simulateAddText(`Matrícula: ${inscricaoData.matricula}`);
    simulateAddText(`Órgão/Unidade: ${inscricaoData.lotacao}`);
    const simulatedPhone = options.maskSensitive ? maskPhone(inscricaoData.telefone) : inscricaoData.telefone;
    simulateAddText(`Telefone: ${simulatedPhone}`);
    simulateAddText(`E-mail: ${inscricaoData.email_institucional}`);
    tempYPosition += 2;

    // Step 2
    simulateAddText('2. INFORMAÇÕES DA INSCRIÇÃO', 11);
    simulateAddText(`Título da Prática/Projeto: ${inscricaoData.titulo_iniciativa}`);
    simulateAddText(`Área: ${formatAreaAtuacao(inscricaoData.area_atuacao)}`);
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
    simulateAddText('Objetivo Estratégico:', 9);
    simulateAddText(formatObjetivoEstrategico(inscricaoData.objetivos));
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
        // Usar asset local para confiabilidade e performance
        const logoUrl = '/logo-mppi.png';
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

    // Função para adicionar espaçamento entre quesitos
    const addQuestionSpacing = () => {
      yPosition += 4; // Espaçamento entre quesitos
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
      
      // Melhorar quebra de parágrafos - dividir por quebras de linha explícitas primeiro
      const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
      let totalHeight = 0;
      
      // Calcular altura total considerando todos os parágrafos
      paragraphs.forEach(paragraph => {
        const splitText = pdf.splitTextToSize(paragraph.trim(), maxWidth);
        totalHeight += splitText.length * lineHeight;
        if (paragraphs.length > 1) {
          totalHeight += 2; // Espaçamento entre parágrafos
        }
      });
      
      checkPageBreak(totalHeight);
      
      // Reconfigurar fonte após possível quebra de página
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      // Processar cada parágrafo
      paragraphs.forEach((paragraph, paragraphIndex) => {
        const splitText = pdf.splitTextToSize(paragraph.trim(), maxWidth);
        
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
        
        yPosition += splitText.length * lineHeight;
        
        // Adicionar espaçamento entre parágrafos (exceto no último)
        if (paragraphIndex < paragraphs.length - 1) {
          yPosition += 2;
        }
      });
      
      yPosition += 1; // Espaçamento mínimo após o texto
    };

    // Adicionar cabeçalho inicial
    await addHeader();
    yPosition = 70;

    // Step 1 - Dados do Proponente
    addText('1. DADOS DO PROPONENTE', 11, true, true);
    addText(`Nome Completo: ${inscricaoData.nome_completo}`);
    addText(`Cargo/Função: ${formatCargoFuncao(inscricaoData.cargo_funcao)}`);
    if (inscricaoData.matricula) {
      addText(`Matrícula: ${inscricaoData.matricula}`);
    }
    addText(`Órgão/Unidade: ${inscricaoData.lotacao}`);
    const finalPhone = options.maskSensitive ? maskPhone(inscricaoData.telefone) : inscricaoData.telefone;
    addText(`Telefone: ${finalPhone}`);
    addText(`E-mail: ${inscricaoData.email_institucional}`);
    yPosition += 2; // Espaçamento final da seção

    // Step 2 - Informações da Inscrição
    addText('2. INFORMAÇÕES DA INSCRIÇÃO', 11, true, true);
    addText(`Título da Prática/Projeto: ${inscricaoData.titulo_iniciativa}`);
    addText(`Área: ${formatAreaAtuacao(inscricaoData.area_atuacao)}`);
    if (inscricaoData.situacao_atual) {
      addText(`Situação Atual: ${inscricaoData.situacao_atual}`);
    }
    if (inscricaoData.data_conclusao) {
      addText(`Data de Conclusão: ${inscricaoData.data_conclusao}`);
    }
    if (inscricaoData.publico_alvo) {
      addQuestionSpacing();
      addText('Relação da Equipe:', 9, true);
      addText(inscricaoData.publico_alvo, 9, false, false, true);
    }
    yPosition += 2; // Espaçamento final da seção

    // Step 3 - Descrição
    addText('3. DESCRIÇÃO DA PRÁTICA', 11, true, true);
    
    addText('Resumo Executivo:', 9, true);
    addText(inscricaoData.descricao_iniciativa);
    addQuestionSpacing();
    
    if (inscricaoData.problema_necessidade) {
      addText('Problema ou Necessidade:', 9, true);
      addText(inscricaoData.problema_necessidade);
      addQuestionSpacing();
    }
    
    addText('Objetivo Estratégico:', 9, true);
    addText(formatObjetivoEstrategico(inscricaoData.objetivos));
    addQuestionSpacing();
    
    addText('Metodologia:', 9, true);
    addText(inscricaoData.metodologia);
    addQuestionSpacing();
    
    addText('Principais Resultados:', 9, true);
    addText(inscricaoData.principais_resultados);
    yPosition += 2; // Espaçamento final da seção

    // Step 4 - Critérios
    addText('4. CRITÉRIOS DE AVALIAÇÃO', 11, true, true);
    
    addText('Cooperação:', 9, true);
    addText(inscricaoData.cooperacao);
    addQuestionSpacing();
    
    addText('Inovação:', 9, true);
    addText(inscricaoData.inovacao);
    addQuestionSpacing();
    
    addText('Resolutividade:', 9, true);
    addText(inscricaoData.resolutividade);
    addQuestionSpacing();
    
    addText('Impacto Social:', 9, true);
    addText(inscricaoData.impacto_social);
    addQuestionSpacing();
    
    addText('Alinhamento aos ODS:', 9, true);
    addText(inscricaoData.alinhamento_ods);
    addQuestionSpacing();
    
    addText('Replicabilidade:', 9, true);
    addText(inscricaoData.replicabilidade);
    yPosition += 2; // Espaçamento final da seção

    // Step 5 - Informações Adicionais
    addText('5. INFORMAÇÕES ADICIONAIS', 11, true, true);
    addText(`Participou de edições anteriores: ${inscricaoData.participou_edicoes_anteriores ? 'Sim' : 'Não'}`);
    addText(`Foi vencedor anterior: ${inscricaoData.foi_vencedor_anterior ? 'Sim' : 'Não'}`);
    addQuestionSpacing();
    
    if (inscricaoData.observacoes) {
      addText(`Observações: ${inscricaoData.observacoes}`);
      addQuestionSpacing();
    }
    
    addText(`Declaração de veracidade: ${inscricaoData.declaracao ? 'Sim' : 'Não'}`);
    yPosition += 2; // Espaçamento final da seção

    // Adicionar rodapé final
    addFooter();

    // Salvar o PDF
    const fileName = `Inscricao_${inscricaoData.nome_completo.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    try {
      pdf.save(fileName);
      resolve();
    } catch (e) {
      reject(e);
    }
    } catch (e) {
      reject(e as Error);
    }
  });
};

// Geração de PDF do Regulamento (Edital nº 107/2025)
export const generateRegulamentoPDF = (elementId: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const container = document.getElementById(elementId);
      if (!container) {
        reject(new Error(`Elemento com id '${elementId}' não encontrado`));
        return;
      }

      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      let y = 20;

      const checkPageBreak = (additionalHeight: number = 0) => {
        if (y + additionalHeight > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
      };

      // Cabeçalho simples com logo e título
      try {
        const logoUrl = 'https://i.postimg.cc/pT3rRnwr/logo-mppi.png';
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolveImg) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const width = 80;
            const height = 15;
            canvas.width = width * 4;
            canvas.height = height * 4;
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const imgData = canvas.toDataURL('image/png', 1.0);
              pdf.addImage(imgData, 'PNG', (pageWidth - width) / 2, y, width, height);
            }
            resolveImg();
          };
          img.onerror = () => resolveImg();
          img.src = logoUrl;
        });
      } catch {
        // Prosseguir sem logo caso falhe
      }

      y += 22;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      const title1 = 'PRÊMIO MELHORES PRÁTICAS MPPI';
      pdf.text(title1, (pageWidth - pdf.getTextWidth(title1)) / 2, y);
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const title2 = 'Regulamento – Edital nº 107/2025';
      pdf.text(title2, (pageWidth - pdf.getTextWidth(title2)) / 2, y);
      y += 8;
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Coletar conteúdo textual relevante (exclui navegação e tabelas)
      const nodes = Array.from(container.querySelectorAll('h3, p, ul li')) as HTMLElement[];
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      const addText = (text: string, isHeading: boolean = false) => {
        const maxWidth = pageWidth - margin * 2;
        const lines = pdf.splitTextToSize(text, maxWidth);
        const lineHeight = isHeading ? 6 : 5;
        const blockHeight = lines.length * lineHeight;
        checkPageBreak(blockHeight);
        if (isHeading) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        lines.forEach((line) => {
          pdf.text(line, margin, y);
          y += lineHeight;
        });
        y += isHeading ? 3 : 1;
      };

      nodes.forEach((el) => {
        const text = el.innerText.trim();
        if (!text) return;
        const isHeading = el.tagName.toLowerCase() === 'h3';
        addText(text, isHeading);
      });

      // Rodapé com paginação simples
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        const footerText = `Página ${i} de ${pageCount}`;
        pdf.text(footerText, pageWidth - margin - pdf.getTextWidth(footerText), pageHeight - 10);
      }

      pdf.save('Regulamento-MPPI-Edital-107-2025.pdf');
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};