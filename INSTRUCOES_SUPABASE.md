# 🗄️ Instruções para Configuração do Supabase

## 📋 Pré-requisitos

1. **Conta no Supabase**: Acesse [supabase.com](https://supabase.com) e faça login
2. **Projeto já criado**: O projeto `ljbxctmywdpsfmjvmlmh` já está configurado
3. **Acesso ao SQL Editor**: No painel do Supabase

## 🚀 Passo a Passo para Implementação

### 1. Executar a Migração do Banco de Dados

1. **Acesse o Supabase Dashboard**:
   - URL: https://supabase.com/dashboard/project/ljbxctmywdpsfmjvmlmh
   - Faça login com suas credenciais

2. **Abra o SQL Editor**:
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script de Migração Corrigido**:
   
   **IMPORTANTE**: Se você já tentou executar a migração anterior e teve erro de "column status does not exist", execute este script:
   
   - Copie todo o conteúdo do arquivo `supabase/migrations/003_recreate_inscricoes_table.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar
   
   **OU**, se é a primeira vez:
   
   - Copie todo o conteúdo do arquivo `supabase/migrations/001_create_inscricoes_table.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

4. **Verificar se a Tabela foi Criada**:
   ```sql
   SELECT * FROM public.inscricoes LIMIT 1;
   ```

5. **Verificar Estrutura da Tabela**:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'inscricoes' 
   ORDER BY ordinal_position;
   ```

### 2. Verificar Configurações de Segurança

1. **Row Level Security (RLS)**:
   ```sql
   -- Verificar se RLS está habilitado
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'inscricoes';
   ```

2. **Políticas de Acesso**:
   ```sql
   -- Listar políticas criadas
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'inscricoes';
   ```

### 3. Testar a Integração

1. **Teste de Inserção**:
   ```sql
   -- Teste manual de inserção (opcional)
   INSERT INTO public.inscricoes (
     nome_completo, cargo_funcao, matricula, unidade_setor,
     telefone_institucional, email_institucional, equipe_envolvida,
     area, titulo_iniciativa, ano_inicio_execucao, situacao_atual,
     resumo_executivo, problema_necessidade, objetivos_estrategicos,
     etapas_metodologia, resultados_alcancados,
     cooperacao, inovacao, resolutividade, impacto_social,
     alinhamento_ods, replicabilidade,
     participou_edicoes_anteriores, foi_vencedor_anterior,
     concorda_termos, local_data
   ) VALUES (
     'Teste Usuario', 'Promotor de Justiça', '12345', 'Unidade Teste',
     '(86) 9999-9999', 'teste@mppi.mp.br', 'Equipe Teste',
     'Área Teste', 'Título Teste', '2024', 'Em execução',
     'Resumo teste', 'Problema teste', 'Objetivos teste',
     'Etapas teste', 'Resultados teste',
     'Cooperação teste', 'Inovação teste', 'Resolutividade teste', 'Impacto teste',
     'ODS teste', 'Replicabilidade teste',
     'Não', 'Não',
     true, 'Teresina, 15 de janeiro de 2025'
   );
   ```

2. **Verificar Inserção**:
   ```sql
   SELECT id, nome_completo, email_institucional, created_at 
   FROM public.inscricoes 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

## 🔧 Configurações Adicionais

### Atualizar Tipos TypeScript (Automático)

Após criar a tabela, o Supabase irá automaticamente atualizar o arquivo `src/integrations/supabase/types.ts` com os novos tipos.

### Configurar Webhooks (Opcional)

Para notificações automáticas quando uma nova inscrição for criada:

1. **Acesse Database > Webhooks**
2. **Crie um novo webhook**:
   - Nome: `nova_inscricao`
   - Tabela: `inscricoes`
   - Eventos: `INSERT`
   - URL: (seu endpoint de notificação)

## 📊 Monitoramento e Logs

### Visualizar Logs de Inserção

```sql
-- Ver últimas inserções
SELECT 
  id,
  nome_completo,
  email_institucional,
  titulo_iniciativa,
  status,
  created_at
FROM public.inscricoes 
ORDER BY created_at DESC 
LIMIT 10;
```

### Estatísticas Básicas

```sql
-- Contagem por área
SELECT area, COUNT(*) as total 
FROM public.inscricoes 
GROUP BY area 
ORDER BY total DESC;

-- Contagem por status
SELECT status, COUNT(*) as total 
FROM public.inscricoes 
GROUP BY status;

-- Inscrições por dia
SELECT 
  DATE(created_at) as data,
  COUNT(*) as inscricoes
FROM public.inscricoes 
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Erro: "column status does not exist"**:
   - **Causa**: A tabela foi criada sem a coluna status
   - **Solução**: Execute o script `003_recreate_inscricoes_table.sql`
   - **Comando**:
     ```sql
     -- No SQL Editor do Supabase, execute:
     -- Copie e cole todo o conteúdo de 003_recreate_inscricoes_table.sql
     ```

2. **Erro de Permissão**:
   - Verificar se RLS está configurado corretamente
   - Verificar políticas de acesso

3. **Erro de Conexão**:
   - Verificar se as credenciais no `client.ts` estão corretas
   - Verificar se o projeto está ativo

4. **Erro de Tipo**:
   - Regenerar tipos: No Supabase Dashboard > Settings > API > Generate types

### Comandos de Debug

```sql
-- Verificar estrutura da tabela
\d public.inscricoes

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'inscricoes';

-- Verificar triggers
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'inscricoes';
```

## ✅ Checklist de Implementação

- [ ] Executar script de migração
- [ ] Verificar criação da tabela
- [ ] Testar inserção manual
- [ ] Verificar RLS e políticas
- [ ] Testar aplicação completa
- [ ] Verificar logs de inserção
- [ ] Configurar monitoramento (opcional)

## 📞 Suporte

Em caso de problemas:
1. Verificar logs no console do navegador
2. Verificar logs no Supabase Dashboard > Logs
3. Consultar documentação: [docs.supabase.com](https://docs.supabase.com)

---

**Importante**: Após executar a migração, teste a aplicação completamente para garantir que a integração está funcionando corretamente.