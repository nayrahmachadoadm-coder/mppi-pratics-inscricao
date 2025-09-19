# 📧 Configuração do EmailJS

Este documento explica como configurar o EmailJS para o sistema de inscrições do Prêmio Melhores Práticas 2025.

## 🚀 Passo a Passo

### 1. Criar Conta no EmailJS

1. Acesse [https://www.emailjs.com/](https://www.emailjs.com/)
2. Clique em "Sign Up" e crie uma conta gratuita
3. Confirme seu email

### 2. Configurar Serviço de Email

1. No painel do EmailJS, vá em **"Email Services"**
2. Clique em **"Add New Service"**
3. Escolha seu provedor de email:
   - **Gmail** (recomendado para testes)
   - **Outlook/Hotmail**
   - **Yahoo**
   - Ou outro de sua preferência
4. Siga as instruções para conectar sua conta de email
5. **Anote o SERVICE_ID** gerado (ex: `service_abc123`)

### 3. Criar Template de Email

1. Vá em **"Email Templates"**
2. Clique em **"Create New Template"**
3. Configure o template:

#### Subject (Assunto):
```
Confirmação de Inscrição - {{titulo_iniciativa}} - Melhores Práticas 2025
```

#### Content (Conteúdo):
- Copie o conteúdo do arquivo `emailjs-template-example.html`
- Cole na seção "Content" do template
- Ou use o editor visual do EmailJS

#### Settings (Configurações):
- **To Email**: `{{to_email}}`
- **From Name**: `Ministério Público do Piauí`
- **Reply To**: `planejamento@mppi.mp.br`
- **BCC**: `{{cc_email}}` (opcional)

4. **Anote o TEMPLATE_ID** gerado (ex: `template_xyz789`)

### 4. Obter Chave Pública

1. Vá em **"Account"** > **"General"**
2. Na seção "API Keys", copie a **"Public Key"**
3. **Anote a PUBLIC_KEY** (ex: `user_abc123xyz`)

### 5. Configurar no Sistema

1. Abra o arquivo `src/lib/emailConfig.ts`
2. Substitua os valores:

```typescript
export const EMAIL_CONFIG = {
  SERVICE_ID: 'seu_service_id_aqui',      // Do passo 2
  TEMPLATE_ID: 'seu_template_id_aqui',    // Do passo 3  
  PUBLIC_KEY: 'sua_public_key_aqui',      // Do passo 4
  CC_EMAIL: 'planejamento@mppi.mp.br'     // Email que sempre receberá cópia
};
```

## 🧪 Testando a Configuração

### Teste Básico no EmailJS

1. No painel do EmailJS, vá no seu template
2. Clique em **"Test it"**
3. Preencha as variáveis de teste:
   ```
   nome_completo: João Silva
   email_institucional: joao@exemplo.com
   titulo_iniciativa: Teste de Iniciativa
   inscricao_id: TEST001
   data_submissao: 15/01/2025 14:30
   ```
4. Envie o teste e verifique se o email chegou

### Teste no Sistema

1. Abra o sistema no navegador
2. Preencha o formulário de inscrição
3. Submeta o formulário
4. Verifique:
   - Console do navegador para logs
   - Email de confirmação na caixa de entrada
   - Email de cópia em `planejamento@mppi.mp.br`

## 🔧 Variáveis do Template

O sistema envia as seguintes variáveis para o template:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{{nome_completo}}` | Nome completo do inscrito | João Silva |
| `{{email_institucional}}` | Email do inscrito | joao@mppi.mp.br |
| `{{titulo_iniciativa}}` | Título da iniciativa | Digitalização de Processos |
| `{{inscricao_id}}` | ID único da inscrição | INS_2025_001 |
| `{{data_submissao}}` | Data e hora da submissão | 15/01/2025 14:30 |
| `{{to_email}}` | Email de destino | joao@mppi.mp.br |
| `{{cc_email}}` | Email de cópia | planejamento@mppi.mp.br |
| `{{pdf_attachment}}` | PDF da inscrição (base64) | (dados binários) |

## 🚨 Solução de Problemas

### Erro: "Invalid Public Key"
- Verifique se a PUBLIC_KEY está correta
- Certifique-se de que não há espaços extras

### Erro: "Service not found"
- Verifique se o SERVICE_ID está correto
- Confirme se o serviço está ativo no EmailJS

### Erro: "Template not found"
- Verifique se o TEMPLATE_ID está correto
- Confirme se o template foi salvo

### Email não chega
- Verifique a pasta de spam
- Confirme se o serviço de email está configurado corretamente
- Teste com um email diferente

### PDF não anexa
- Verifique se a variável `{{pdf_attachment}}` está no template
- Confirme se o template suporta anexos

## 📝 Limites da Conta Gratuita

- **200 emails/mês** na conta gratuita
- Para mais emails, considere upgrade para plano pago
- Monitore o uso no painel do EmailJS

## 🔒 Segurança

- ✅ A PUBLIC_KEY pode ser exposta no frontend
- ✅ Não exponha a PRIVATE_KEY
- ✅ Use sempre HTTPS em produção
- ✅ Configure CORS adequadamente no EmailJS

## 📞 Suporte

Se precisar de ajuda:
1. Consulte a [documentação oficial do EmailJS](https://www.emailjs.com/docs/)
2. Entre em contato com a equipe de desenvolvimento
3. Verifique os logs do console do navegador para erros específicos