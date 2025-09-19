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
  // ⚠️ SUBSTITUA PELOS VALORES REAIS DO SEU EMAILJS:
  
  // ID do serviço EmailJS (encontrado em Email Services)
  SERVICE_ID: 'SEU_SERVICE_ID_AQUI',
  
  // ID do template EmailJS (encontrado em Email Templates)  
  TEMPLATE_ID: 'SEU_TEMPLATE_ID_AQUI',
  
  // Chave pública do EmailJS (encontrada em Account > General)
  PUBLIC_KEY: 'SUA_PUBLIC_KEY_AQUI',
  
  // Email de destino (sempre receberá uma cópia)
  CC_EMAIL: 'planejamento@mppi.mp.br'
};

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