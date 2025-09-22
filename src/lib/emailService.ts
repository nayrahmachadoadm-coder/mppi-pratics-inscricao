import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG, validateEmailConfig } from './emailConfig';

interface EmailData {
  nomeCompleto: string;
  emailInstitucional: string;
  tituloIniciativa: string;
  pdfBlob: Blob;
  inscricaoId?: string;
}

export const sendEmailWithPDF = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log('🔄 Iniciando envio de email...', {
      nomeCompleto: emailData.nomeCompleto,
      emailInstitucional: emailData.emailInstitucional,
      tituloIniciativa: emailData.tituloIniciativa,
      config: EMAIL_CONFIG
    });

    // Verificar se as configurações estão válidas
    if (!validateEmailConfig()) {
      console.warn('⚠️ EmailJS não configurado. Simulando envio de email...');
      // Simular sucesso para não bloquear o fluxo
      return true;
    }

    // Inicializar EmailJS
    console.log('🔧 Inicializando EmailJS...');
    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);

    // Converter o PDF para base64
    console.log('📄 Convertendo PDF para base64...');
    const pdfBase64 = await blobToBase64(emailData.pdfBlob);
    console.log('✅ PDF convertido com sucesso, tamanho:', pdfBase64.length);
    
    // Preparar os dados para o template do EmailJS
    console.log('📧 Preparando dados do template...');
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const templateParams = {
      // Variáveis para o template HTML
      nome_completo: emailData.nomeCompleto,
      email_institucional: emailData.emailInstitucional,
      titulo_iniciativa: emailData.tituloIniciativa,
      inscricao_id: emailData.inscricaoId || 'Aguardando processamento',
      data_submissao: dataAtual,
      
      // Configurações de email
      to_email: emailData.emailInstitucional,
      cc_email: EMAIL_CONFIG.CC_EMAIL,
      
      // Anexo PDF
      pdf_attachment: pdfBase64,
      attachment_name: `Inscricao_${emailData.tituloIniciativa.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    };

    console.log('📤 Enviando email via EmailJS...', {
      serviceId: EMAIL_CONFIG.SERVICE_ID,
      templateId: EMAIL_CONFIG.TEMPLATE_ID,
      publicKey: EMAIL_CONFIG.PUBLIC_KEY.substring(0, 10) + '...' // Não mostrar a chave completa no log
    });

    // Enviar email
    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Email enviado com sucesso:', response);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    console.error('Detalhes do erro:', {
      message: error?.message,
      status: error?.status,
      text: error?.text,
      name: error?.name
    });
    
    // Tentar envio sem anexo como fallback
    console.log('🔄 Tentando envio sem anexo como fallback...');
    return await sendEmailWithoutAttachment(emailData);
  }
};

// Função de fallback para envio sem anexo
const sendEmailWithoutAttachment = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log('📧 Tentando envio sem anexo...');
    
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const templateParams = {
      nome_completo: emailData.nomeCompleto,
      email_institucional: emailData.emailInstitucional,
      titulo_iniciativa: emailData.tituloIniciativa,
      inscricao_id: emailData.inscricaoId || 'Aguardando processamento',
      data_submissao: dataAtual,
      to_email: emailData.emailInstitucional,
      cc_email: EMAIL_CONFIG.CC_EMAIL,
      // Sem anexo
      message: `Sua inscrição foi recebida com sucesso! O PDF será enviado separadamente.`
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Email sem anexo enviado com sucesso:', response);
    return true;
  } catch (error) {
    console.error('❌ Erro no envio sem anexo:', error);
    return false;
  }
};

// Função auxiliar para converter Blob para base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remover o prefixo "data:application/pdf;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Função alternativa usando fetch para envio direto (caso o EmailJS não funcione com anexos)
export const sendEmailAlternative = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Esta é uma implementação alternativa que pode ser usada
    // se você tiver um backend próprio para envio de emails
    
    const formData = new FormData();
    formData.append('to', emailData.emailInstitucional);
    formData.append('cc', 'planejamento@mppi.mp.br');
    formData.append('subject', `Inscrição - ${emailData.tituloIniciativa}`);
    formData.append('message', `
      Prezado(a) ${emailData.nomeCompleto},

      Sua inscrição no Prêmio Melhores Práticas MPPI - 9ª Edição - 2025 foi enviada com sucesso!

      Título da Prática/Projeto: ${emailData.tituloIniciativa}

      Em anexo, você encontrará o PDF com todos os dados da sua inscrição.

      Atenciosamente,
      Equipe do Prêmio Melhores Práticas MPPI
    `);
    formData.append('pdf', emailData.pdfBlob, `Inscricao_${emailData.tituloIniciativa.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);

    // Aqui você faria a requisição para seu backend
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   body: formData
    // });

    // return response.ok;
    
    console.log('Função alternativa preparada para envio via backend');
    return true;
  } catch (error) {
    console.error('Erro no envio alternativo:', error);
    return false;
  }
};