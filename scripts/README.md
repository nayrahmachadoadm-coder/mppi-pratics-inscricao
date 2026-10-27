# Scripts e Utilitários de Manutenção

Este diretório reúne os scripts auxiliares, diagnósticos e rotinas de manutenção utilizados pela equipe de tecnologia e administração do banco de dados do **Prêmio Melhores Práticas do MPPI (10ª Edição)**.

---

## Estrutura

```
scripts/
├── sql/     # Scripts SQL manuais para execução no Dashboard do Supabase
└── debug/   # Ferramentas HTML e scripts JS/MJS para diagnósticos e testes
```

---

## 1. `scripts/sql/` (Scripts de Banco de Dados)

Scripts SQL pontuais de correção, suporte e auditoria executados via SQL Editor no Supabase:

- **RLS & Permissões:**
  - `restaurar_rls_inscricoes_publicas.sql`: Restaura e garante a política `inscricoes_public_insert` permitindo inserções públicas sem autenticação.
  - `disable-rls-emergency.sql`: Script emergencial para desbloqueio de RLS em caso de incidentes.
  - `fix-rls.sql`, `fix-rls-direct.sql`, `fix-rls-final.sql`: Histórico de ajustes incrementais nas políticas da tabela `inscricoes`.
- **Administração & Perfis:**
  - `create-admin-profile.sql`, `fix-admin-user.sql`, `ensure-planejamento-admin.sql`: Criação e garantia de acesso administrativo para contas institucionais da Assessoria de Planejamento e Gestão (ASSESPPLAGES).
  - `tornar_nayrah_admin.sql`: Atribuição de perfil administrador à gestão do certame.
- **Estrutura & Colunas:**
  - `add_missing_columns_inscricoes.sql`: Adiciona colunas complementares da ficha de inscrição.
  - `fix-matricula-field.sql`: Ajusta o formato e validação da matrícula funcional.
  - `fix-step5-fields.sql`: Ajusta campos de justificativa e dados do formulário de submissão.
  - `remover_obrigatoriedade_ods.sql`: Torna o campo de Objetivos de Desenvolvimento Sustentável (ODS) opcional conforme orientação da comissão.
- **Auditoria, RPCs & Limpeza:**
  - `check-step5-migration.sql` e `check-table-constraints.sql`: Diagnóstico de integridade de constraints e colunas.
  - `criar_rpc_exclusao_inscricao.sql`: Procedure segura para exclusão administrativa de inscrições inválidas ou duplicadas.
  - `limpar_notas_testes_edicao_2026.sql`: Remove votos e notas de homologação prévia antes do início oficial da fase de julgamento.

---

## 2. `scripts/debug/` (Páginas e Scripts de Teste)

Ferramentas executadas em ambiente de desenvolvimento local para validação de integrações e APIs:

- **Conexão & Dados do Supabase:**
  - `test-supabase-connection.html`, `test-supabase.html`: Validação de conectividade com a API REST do Supabase.
  - `test-table-structure.html`, `test-table-columns.html`: Inspeção visual da estrutura de colunas retornadas.
  - `debug-all-supabase-data.html`: Consulta rápida de registros da base de dados.
  - `debug-specific-user.html`, `debug-thiago-data.html`: Inspeção detalhada de registros específicos para depuração de suporte.
- **Validação de Inscrições & RPCs:**
  - `test-insert.mjs`, `test-rpc.mjs`, `test-schema.mjs`: Scripts Node.js para validação assíncrona de inserção e chamada de procedures.
  - `test-area-atuacao.html`: Verificação de categorização entre Atuação Finalística e Estruturante.
  - `test-rls-disabled.html`: Verificação de comportamento sob políticas permissivas.
- **Notificações & E-mail:**
  - `test-emailjs.html`: Validação do envio de e-mails via serviço do EmailJS.
  - `emailjs-template-example.html`: Template HTML de referência para o comprovante enviado por e-mail ao proponente.
