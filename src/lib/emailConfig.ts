// Configurações do EmailJS
// Para configurar o EmailJS:
// 1. Acesse https://www.emailjs.com/
// 2. Crie uma conta e configure um serviço de email
// 3. Crie um template de email
// 4. Substitua os valores abaixo pelas suas configurações

export const EMAIL_CONFIG = {
  // ID do serviço EmailJS (ex: 'service_abc123')
  SERVICE_ID: 'service_mppi',
  
  // ID do template EmailJS (ex: 'template_xyz789')
  TEMPLATE_ID: 'template_inscricao',
  
  // Chave pública do EmailJS (ex: 'user_abc123xyz')
  PUBLIC_KEY: 'your_public_key_here',
  
  // Email de destino adicional (sempre será enviado para este email também)
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