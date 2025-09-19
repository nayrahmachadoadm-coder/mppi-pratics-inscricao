-- Script para recriar a tabela inscricoes corretamente
-- Migração 003: Recriar tabela com estrutura completa

-- Remover tabela existente se houver (cuidado: isso apaga dados!)
DROP TABLE IF EXISTS public.inscricoes CASCADE;

-- Recriar a tabela com estrutura completa
CREATE TABLE public.inscricoes (
  -- Campos de controle
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Dados do proponente
  nome_completo TEXT NOT NULL,
  cargo_funcao TEXT NOT NULL,
  matricula TEXT NOT NULL,
  unidade_setor TEXT NOT NULL,
  telefone_institucional TEXT NOT NULL,
  email_institucional TEXT NOT NULL,
  equipe_envolvida TEXT NOT NULL,
  
  -- Informações sobre a inscrição
  area TEXT NOT NULL,
  titulo_iniciativa TEXT NOT NULL,
  ano_inicio_execucao TEXT NOT NULL,
  situacao_atual TEXT NOT NULL,
  data_conclusao TEXT,
  
  -- Descrição da prática/projeto
  resumo_executivo TEXT NOT NULL,
  problema_necessidade TEXT NOT NULL,
  objetivos_estrategicos TEXT NOT NULL,
  etapas_metodologia TEXT NOT NULL,
  resultados_alcancados TEXT NOT NULL,
  
  -- Critérios de avaliação
  cooperacao TEXT NOT NULL,
  inovacao TEXT NOT NULL,
  resolutividade TEXT NOT NULL,
  impacto_social TEXT NOT NULL,
  alinhamento_ods TEXT NOT NULL,
  replicabilidade TEXT NOT NULL,
  
  -- Informações adicionais
  participou_edicoes_anteriores TEXT NOT NULL,
  especificar_edicoes_anteriores TEXT,
  foi_vencedor_anterior TEXT NOT NULL,
  
  -- Declaração
  concorda_termos BOOLEAN NOT NULL DEFAULT false,
  local_data TEXT NOT NULL,
  
  -- Campos de controle adicional
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado')),
  observacoes TEXT
);

-- Criar índices para melhorar performance
CREATE INDEX idx_inscricoes_created_at ON public.inscricoes(created_at);
CREATE INDEX idx_inscricoes_email_institucional ON public.inscricoes(email_institucional);
CREATE INDEX idx_inscricoes_status ON public.inscricoes(status);
CREATE INDEX idx_inscricoes_area ON public.inscricoes(area);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_inscricoes_updated_at 
    BEFORE UPDATE ON public.inscricoes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (formulário público)
CREATE POLICY "Permitir inserção pública" ON public.inscricoes
    FOR INSERT 
    WITH CHECK (true);

-- Política para permitir leitura apenas para administradores autenticados
CREATE POLICY "Permitir leitura para administradores" ON public.inscricoes
    FOR SELECT 
    USING (false);

-- Política para permitir atualização apenas para administradores autenticados
CREATE POLICY "Permitir atualização para administradores" ON public.inscricoes
    FOR UPDATE 
    USING (false);

-- Comentários para documentação
COMMENT ON TABLE public.inscricoes IS 'Tabela para armazenar inscrições do programa Melhores Práticas MPPI 2025';
COMMENT ON COLUMN public.inscricoes.id IS 'Identificador único da inscrição';
COMMENT ON COLUMN public.inscricoes.status IS 'Status da inscrição: pendente, em_analise, aprovado, rejeitado';
COMMENT ON COLUMN public.inscricoes.email_institucional IS 'Email institucional do proponente para contato';
COMMENT ON COLUMN public.inscricoes.observacoes IS 'Observações administrativas sobre a inscrição';

-- Verificar se a tabela foi criada corretamente
SELECT 
    'Tabela criada com sucesso!' as resultado,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'inscricoes';