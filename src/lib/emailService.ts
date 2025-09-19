import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from './emailConfig';

interface EmailData {
  nomeCompleto: string;
  emailInstitucional: string;
  tituloIniciativa: string;
  pdfBlob: Blob;
  inscricaoId?: string;
}

export const sendEmailWithPDF = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Converter o PDF para base64
    const pdfBase64 = await blobToBase64(emailData.pdfBlob);
    
    // Preparar os dados para o template do EmailJS
    const templateParams = {
      to_name: emailData.nomeCompleto,
      to_email: emailData.emailInstitucional,
      cc_email: EMAIL_CONFIG.CC_EMAIL,
      subject: `Inscrição - ${emailData.tituloIniciativa}`,
      message: `
        Prezado(a) ${emailData.nomeCompleto},

        Sua inscrição no Prêmio Melhores Práticas MPPI - 9ª Edição - 2025 foi enviada com sucesso!

        Título da Prática/Projeto: ${emailData.tituloIniciativa}
        ${emailData.inscricaoId ? `Número da Inscrição: ${emailData.inscricaoId}` : ''}

        Em anexo, você encontrará o PDF com todos os dados da sua inscrição.

        Sua inscrição será avaliada pela Comissão Julgadora conforme o cronograma do edital.
        ${emailData.inscricaoId ? `Guarde o número da sua inscrição para futuras consultas.` : ''}

        Atenciosamente,
        Equipe do Prêmio Melhores Práticas MPPI
      `,
      attachment: pdfBase64,
      attachment_name: `Inscricao_${emailData.tituloIniciativa.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    };

    // Enviar email
    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAIL_CONFIG.PUBLIC_KEY
    );

    console.log('Email enviado com sucesso:', response);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
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