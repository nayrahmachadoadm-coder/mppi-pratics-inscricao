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
  // ⚠️ ATENÇÃO: VERIFIQUE SE ESTES VALORES ESTÃO CORRETOS NO SEU DASHBOARD EMAILJS
  
  // ID do serviço EmailJS (encontrado em Email Services)
  // ❌ ERRO COMUM: Verificar se este serviço existe e está ativo
  SERVICE_ID: 'service_7wgbrkh',
  
  // ID do template EmailJS (encontrado em Email Templates)  
  // ❌ ERRO COMUM: Verificar se este template existe e está publicado
  TEMPLATE_ID: 'template_6zi9h8j',
  
  // Chave pública do EmailJS (encontrada em Account > General)
  PUBLIC_KEY: 'KhlLBUAUHTe84YtRp',
  
  // Email de destino (sempre receberá uma cópia)
  CC_EMAIL: 'planejamento@mppi.mp.br'
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