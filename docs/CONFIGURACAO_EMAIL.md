# Configuração do Envio de Email com PDF

## Funcionalidade Implementada

Quando o usuário clica em "Finalizar Inscrição", o sistema agora:

1. ✅ Exibe a mensagem "Inscrição enviada com sucesso!"
2. ✅ Gera um PDF com todos os dados do formulário preenchido
3. ✅ Envia o PDF por email para:
   - O email institucional informado no Step 1
   - O email planejamento@mppi.mp.br

## Como Configurar o EmailJS

Para que o envio de email funcione, você precisa configurar o EmailJS:

### 1. Criar Conta no EmailJS
1. Acesse https://www.emailjs.com/
2. Crie uma conta gratuita
3. Faça login no dashboard

### 2. Configurar Serviço de Email
1. No dashboard, clique em "Email Services"
2. Clique em "Add New Service"
3. Escolha seu provedor de email (Gmail, Outlook, etc.)
4. Configure as credenciais
5. Anote o **Service ID** gerado

### 3. Criar Template de Email
1. Clique em "Email Templates"
2. Clique em "Create New Template"
3. Configure o template com os seguintes campos:

**Assunto:**
```
Inscrição - {{subject}}
```

**Corpo do email:**
```
Prezado(a) {{to_name}},

{{message}}

Atenciosamente,
Equipe do Prêmio Melhores Práticas MPPI

---
Este é um email automático, não responda.
```

4. Anote o **Template ID** gerado

### 4. Obter Chave Pública
1. Vá em "Account" > "General"
2. Copie a **Public Key**

### 5. Configurar no Sistema
1. Abra o arquivo `src/lib/emailConfig.ts`
2. Substitua os valores:

```typescript
export const EMAIL_CONFIG = {
  SERVICE_ID: 'seu_service_id_aqui',
  TEMPLATE_ID: 'seu_template_id_aqui', 
  PUBLIC_KEY: 'sua_public_key_aqui',
  CC_EMAIL: 'planejamento@mppi.mp.br'
};
```

## Arquivos Criados/Modificados

### Novos Arquivos:
- `src/lib/pdfGenerator.ts` - Gera PDF com dados do formulário
- `src/lib/emailService.ts` - Envia email com PDF anexado
- `src/lib/emailConfig.ts` - Configurações do EmailJS

### Arquivos Modificados:
- `src/components/InscricaoForm.tsx` - Integração da funcionalidade no handleSubmit

## Dependências Instaladas

```bash
npm install jspdf html2canvas @emailjs/browser
```

## Testando a Funcionalidade

1. Preencha todo o formulário
2. Clique em "Finalizar Inscrição"
3. Verifique se:
   - A mensagem de sucesso aparece
   - O email é enviado para o email institucional
   - O email é enviado para planejamento@mppi.mp.br
   - O PDF contém todos os dados do formulário

## Observações

- O EmailJS tem limite de 200 emails gratuitos por mês
- Para produção, considere usar um serviço de email dedicado
- O PDF é gerado no lado do cliente (browser)
- Todos os campos obrigatórios devem estar preenchidos para o envio funcionar

## Solução de Problemas

Se o email não estiver sendo enviado:

1. Verifique se as configurações no `emailConfig.ts` estão corretas
2. Verifique se o serviço EmailJS está ativo
3. Verifique o console do navegador para erros
4. Teste as configurações no dashboard do EmailJS

## Estrutura do PDF Gerado

O PDF contém todas as seções do formulário:
- Dados do Proponente
- Informações da Inscrição  
- Descrição
- Critérios de Avaliação
- Informações Adicionais
- Data/hora de geração