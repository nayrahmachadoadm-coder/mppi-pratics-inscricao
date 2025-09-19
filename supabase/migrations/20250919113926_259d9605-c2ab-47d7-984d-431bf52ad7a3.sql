-- Create table for storing inscriptions
CREATE TABLE public.inscricoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Proponent data
  nome_completo TEXT NOT NULL,
  cargo_funcao TEXT NOT NULL,
  email_institucional TEXT NOT NULL,
  telefone TEXT NOT NULL,
  lotacao TEXT NOT NULL,
  
  -- Initiative data
  titulo_iniciativa TEXT NOT NULL,
  area_atuacao TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  publico_alvo TEXT NOT NULL,
  
  -- Descriptions
  descricao_iniciativa TEXT NOT NULL,
  objetivos TEXT NOT NULL,
  metodologia TEXT NOT NULL,
  principais_resultados TEXT NOT NULL,
  
  -- Evaluation criteria
  cooperacao TEXT NOT NULL,
  inovacao TEXT NOT NULL,
  resolutividade TEXT NOT NULL,
  impacto_social TEXT NOT NULL,
  alinhamento_ods TEXT NOT NULL,
  replicabilidade TEXT NOT NULL,
  
  -- Additional information
  participou_edicoes_anteriores BOOLEAN NOT NULL DEFAULT false,
  foi_vencedor_anterior BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  
  -- Declaration
  declaracao BOOLEAN NOT NULL DEFAULT false,
  
  -- Control fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public insertions (form is public)
CREATE POLICY "Anyone can insert inscricoes" 
ON public.inscricoes 
FOR INSERT 
WITH CHECK (true);

-- Create policy for reading (only for authenticated users - admin access)
CREATE POLICY "Authenticated users can view inscricoes" 
ON public.inscricoes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inscricoes_updated_at
  BEFORE UPDATE ON public.inscricoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();