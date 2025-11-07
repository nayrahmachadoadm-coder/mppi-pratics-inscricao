-- =============================================
-- MIGRAÇÃO COMPLETA - Sistema de Avaliação MPPI
-- =============================================

-- 1. LIMPAR TABELA INSCRICOES (remover duplicações)
-- Primeiro, criar tabela temporária com estrutura limpa
CREATE TABLE IF NOT EXISTS public.inscricoes_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados pessoais
  nome_completo text NOT NULL,
  cargo_funcao text NOT NULL,
  matricula text,
  telefone text NOT NULL,
  email_institucional text NOT NULL,
  lotacao text NOT NULL,
  
  -- Dados da iniciativa
  area_atuacao text NOT NULL,
  titulo_iniciativa text NOT NULL,
  data_inicio text NOT NULL,
  data_fim text,
  publico_alvo text NOT NULL,
  situacao_atual text,
  data_conclusao text,
  
  -- Descrição da prática/projeto
  descricao_iniciativa text NOT NULL,
  problema_necessidade text,
  objetivos text NOT NULL,
  metodologia text NOT NULL,
  principais_resultados text NOT NULL,
  
  -- Critérios de avaliação
  cooperacao text NOT NULL,
  inovacao text NOT NULL,
  resolutividade text NOT NULL,
  impacto_social text NOT NULL,
  alinhamento_ods text NOT NULL,
  replicabilidade text NOT NULL,
  
  -- Informações adicionais
  participou_edicoes_anteriores boolean DEFAULT false,
  foi_vencedor_anterior boolean DEFAULT false,
  local_data text,
  
  -- Declaração e observações
  declaracao boolean DEFAULT false,
  observacoes text,
  
  -- Status administrativo
  status text DEFAULT 'pendente',
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Garantir que colunas legadas existam na tabela antiga antes da migração
-- Isso evita erros quando a consulta de migração referencia nomes alternativos
ALTER TABLE IF EXISTS public.inscricoes
  ADD COLUMN IF NOT EXISTS telefone_institucional text,
  ADD COLUMN IF NOT EXISTS unidade_setor text,
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS ano_inicio_execucao text,
  ADD COLUMN IF NOT EXISTS equipe_envolvida text,
  ADD COLUMN IF NOT EXISTS resumo_executivo text,
  ADD COLUMN IF NOT EXISTS objetivos_estrategicos text,
  ADD COLUMN IF NOT EXISTS etapas_metodologia text,
  ADD COLUMN IF NOT EXISTS resultados_alcancados text,
  ADD COLUMN IF NOT EXISTS concorda_termos boolean,
  ADD COLUMN IF NOT EXISTS especificar_edicoes_anteriores text;

-- Migrar dados da tabela antiga para nova (se existirem)
INSERT INTO public.inscricoes_new (
  id, nome_completo, cargo_funcao, matricula, telefone, email_institucional,
  lotacao, area_atuacao, titulo_iniciativa, data_inicio, data_fim,
  publico_alvo, situacao_atual, data_conclusao, descricao_iniciativa,
  problema_necessidade, objetivos, metodologia, principais_resultados,
  cooperacao, inovacao, resolutividade, impacto_social,
  alinhamento_ods, replicabilidade, participou_edicoes_anteriores,
  foi_vencedor_anterior, local_data, declaracao, observacoes, status,
  created_at, updated_at
)
SELECT 
  id,
  COALESCE(nome_completo, ''),
  COALESCE(cargo_funcao, ''),
  matricula,
  COALESCE(telefone, telefone_institucional, ''),
  COALESCE(email_institucional, ''),
  COALESCE(lotacao, unidade_setor, ''),
  COALESCE(area_atuacao, area, ''),
  COALESCE(titulo_iniciativa, ''),
  COALESCE(data_inicio, ano_inicio_execucao, ''),
  data_fim,
  COALESCE(publico_alvo, equipe_envolvida, ''),
  situacao_atual,
  data_conclusao,
  COALESCE(descricao_iniciativa, resumo_executivo, ''),
  problema_necessidade,
  COALESCE(objetivos, objetivos_estrategicos, ''),
  COALESCE(metodologia, etapas_metodologia, ''),
  COALESCE(principais_resultados, resultados_alcancados, ''),
  COALESCE(cooperacao, 'Não informado'),
  COALESCE(inovacao, 'Não informado'),
  COALESCE(resolutividade, 'Não informado'),
  COALESCE(impacto_social, 'Não informado'),
  COALESCE(alinhamento_ods, 'Não informado'),
  COALESCE(replicabilidade, 'Não informado'),
  CASE 
    WHEN participou_edicoes_anteriores = 'sim' THEN true 
    WHEN participou_edicoes_anteriores = 'nao' THEN false
    ELSE false
  END,
  CASE 
    WHEN foi_vencedor_anterior = 'sim' THEN true 
    WHEN foi_vencedor_anterior = 'nao' THEN false
    ELSE false
  END,
  local_data,
  COALESCE(declaracao, concorda_termos, false),
  COALESCE(observacoes, especificar_edicoes_anteriores),
  COALESCE(status, 'pendente'),
  created_at,
  updated_at
FROM public.inscricoes
ON CONFLICT (id) DO NOTHING;

-- Dropar tabela antiga e renomear nova
DROP TABLE IF EXISTS public.inscricoes CASCADE;
ALTER TABLE public.inscricoes_new RENAME TO inscricoes;

-- 2. CRIAR TABELA DE PERFIS DE USUÁRIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text,
  seat_code text, -- código da vaga para jurados (PGJ1, APMP, etc)
  seat_label text, -- label da vaga
  must_change_password boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. CRIAR ENUM PARA ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'jurado', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. CRIAR TABELA DE ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 5. CRIAR TABELA DE AVALIAÇÕES
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscricao_id uuid REFERENCES public.inscricoes(id) ON DELETE CASCADE NOT NULL,
  jurado_username text NOT NULL,
  cooperacao integer NOT NULL CHECK (cooperacao >= 0 AND cooperacao <= 5),
  inovacao integer NOT NULL CHECK (inovacao >= 0 AND inovacao <= 5),
  resolutividade integer NOT NULL CHECK (resolutividade >= 0 AND resolutividade <= 5),
  impacto_social integer NOT NULL CHECK (impacto_social >= 0 AND impacto_social <= 5),
  alinhamento_ods integer NOT NULL CHECK (alinhamento_ods >= 0 AND alinhamento_ods <= 5),
  replicabilidade integer NOT NULL CHECK (replicabilidade >= 0 AND replicabilidade <= 5),
  total integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(inscricao_id, jurado_username)
);

-- 6. CRIAR TABELA DE VOTOS POPULARES
CREATE TABLE IF NOT EXISTS public.votos_populares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  inscricao_id uuid REFERENCES public.inscricoes(id) ON DELETE CASCADE NOT NULL,
  fingerprint text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(categoria, fingerprint)
);

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_inscricoes_area ON public.inscricoes(area_atuacao);
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON public.inscricoes(status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_created ON public.inscricoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_inscricao ON public.avaliacoes(inscricao_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_jurado ON public.avaliacoes(jurado_username);
CREATE INDEX IF NOT EXISTS idx_votos_categoria ON public.votos_populares(categoria);
CREATE INDEX IF NOT EXISTS idx_votos_inscricao ON public.votos_populares(inscricao_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- 8. HABILITAR RLS
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos_populares ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR FUNÇÃO PARA VERIFICAR ROLES (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 10. POLÍTICAS RLS PARA INSCRICOES
DROP POLICY IF EXISTS "admin_public_select" ON public.inscricoes;
DROP POLICY IF EXISTS "admin_public_insert" ON public.inscricoes;
DROP POLICY IF EXISTS "admin_public_update" ON public.inscricoes;
DROP POLICY IF EXISTS "admin_public_delete" ON public.inscricoes;

-- Permite inserção pública (formulário de inscrição)
CREATE POLICY "allow_public_insert" ON public.inscricoes
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Permite leitura para jurados e admins
CREATE POLICY "allow_jurado_admin_select" ON public.inscricoes
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role IN ('admin', 'jurado')
    )
  );

-- Permite atualização apenas para admins
CREATE POLICY "allow_admin_update" ON public.inscricoes
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- Permite exclusão apenas para admins
CREATE POLICY "allow_admin_delete" ON public.inscricoes
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- 11. POLÍTICAS RLS PARA PROFILES
-- Usuários podem ver seu próprio perfil
CREATE POLICY "allow_own_profile_select" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Admins podem ver todos os perfis
CREATE POLICY "allow_admin_all_profiles" ON public.profiles
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- 12. POLÍTICAS RLS PARA USER_ROLES
-- Apenas admins podem gerenciar roles
CREATE POLICY "allow_admin_manage_roles" ON public.user_roles
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- 13. POLÍTICAS RLS PARA AVALIACOES
-- Jurados podem inserir/atualizar suas próprias avaliações
CREATE POLICY "allow_jurado_insert_own" ON public.avaliacoes
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.username = jurado_username
    )
  );

CREATE POLICY "allow_jurado_update_own" ON public.avaliacoes
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.username = jurado_username
    )
  );

-- Admins podem ver todas as avaliações
CREATE POLICY "allow_admin_select_avaliacoes" ON public.avaliacoes
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- Jurados podem ver suas próprias avaliações
CREATE POLICY "allow_jurado_select_own" ON public.avaliacoes
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.username = jurado_username
    )
  );

-- 14. POLÍTICAS RLS PARA VOTOS_POPULARES
-- Permite inserção pública
CREATE POLICY "allow_public_vote" ON public.votos_populares
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Permite leitura pública (para contagem)
CREATE POLICY "allow_public_read_votes" ON public.votos_populares
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- 15. CRIAR FUNÇÃO RPC PARA CONTAGEM DE VOTOS
CREATE OR REPLACE FUNCTION public.votos_count(categoria text)
RETURNS TABLE(inscricao_id uuid, votos bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT inscricao_id, COUNT(*) as votos
  FROM public.votos_populares
  WHERE votos_populares.categoria = votos_count.categoria
  GROUP BY inscricao_id;
$$;

-- 16. CRIAR TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inscricoes_updated_at ON public.inscricoes;
CREATE TRIGGER update_inscricoes_updated_at
  BEFORE UPDATE ON public.inscricoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_avaliacoes_updated_at ON public.avaliacoes;
CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON public.avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();