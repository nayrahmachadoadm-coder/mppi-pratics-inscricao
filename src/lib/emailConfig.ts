// ========================================
// CONFIGURAÇÕES DO EMAILJS
// ========================================
// 
// INSTRUÇÕES PARA CONFIGURAR:
// 
// 1. Acesse https://www.emailjs.com/ e crie uma conta
// 
// 2. Configure um serviço de email:
//    - Vá em "Email Services" 
//    - Adicione um serviço (Gmail, Outlook, etc.)
//    - Anote o SERVICE_ID gerado
// 
// 3. Crie um template de email:
//    - Vá em "Email Templates"
//    - Crie um novo template
//    - Use as seguintes variáveis no template:
//      {{nome_completo}} - Nome do inscrito
//      {{email_institucional}} - Email do inscrito  
//      {{titulo_iniciativa}} - Título da iniciativa
//      {{inscricao_id}} - ID da inscrição
//      {{pdf_attachment}} - Anexo PDF
//    - Anote o TEMPLATE_ID gerado
// 
// 4. Obtenha a chave pública:
//    - Vá em "Account" > "General"
//    - Copie a "Public Key"
// 
// 5. Substitua os valores abaixo:

export const EMAIL_CONFIG = {
  // ⚠️ ATENÇÃO: CONFIGURAÇÕES TEMPORÁRIAS PARA TESTE
  // Para produção, configure corretamente no dashboard do EmailJS
  
  // ID do serviço EmailJS (encontrado em Email Services)
  SERVICE_ID: 'service_test123', // ⚠️ SUBSTITUIR pelo SERVICE_ID real
  
  // ID do template EmailJS (encontrado em Email Templates)  
  TEMPLATE_ID: 'template_test123', // ⚠️ SUBSTITUIR pelo TEMPLATE_ID real
  
  // Chave pública do EmailJS (encontrada em Account > General)
  PUBLIC_KEY: 'test_public_key', // ⚠️ SUBSTITUIR pela PUBLIC_KEY real
  
  // Email de destino (sempre receberá uma cópia)
  CC_EMAIL: 'planejamento@mppi.mp.br'
};

// Função para validar configurações
export const validateEmailConfig = (): boolean => {
  const isValid = EMAIL_CONFIG.SERVICE_ID !== 'service_test123' &&
                  EMAIL_CONFIG.TEMPLATE_ID !== 'template_test123' &&
                  EMAIL_CONFIG.PUBLIC_KEY !== 'test_public_key' &&
                  EMAIL_CONFIG.SERVICE_ID.length > 0 &&
                  EMAIL_CONFIG.TEMPLATE_ID.length > 0 &&
                  EMAIL_CONFIG.PUBLIC_KEY.length > 0;
  
  if (!isValid) {
    console.warn('⚠️ EmailJS não configurado corretamente. Usando configurações de teste.');
  }
  
  return isValid;
};

// 🔧 INSTRUÇÕES PARA CORRIGIR O ERRO 400:
// 
// 1. Acesse: https://dashboard.emailjs.com/admin/account
// 2. Na seção "Public Key", copie o valor exato
// 3. Substitua 'YOUR_PUBLIC_KEY_HERE' acima pelo valor copiado
// 4. Certifique-se de que não há espaços extras no início ou fim
// 5. A chave deve ter formato similar a: 'user_xxxxxxxxxxxxxxxxx'
//
// EXEMPLO DE CONFIGURAÇÃO CORRETA:
// PUBLIC_KEY: 'user_abc123def456ghi789',

// Template sugerido para o EmailJS:
/*
Assunto: Inscrição - {{subject}}

Corpo do email:
Prezado(a) {{to_name}},

{{message}}

Atenciosamente,
Equipe do Prêmio Melhores Práticas MPPI

---
Este é um email automático, não responda.
*/
