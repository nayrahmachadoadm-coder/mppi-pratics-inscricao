-- Atualiza o cronograma oficial de acordo com o Anexo Único do Edital (2026)
INSERT INTO public.cronograma_parametros (chave, valor_data, descricao) VALUES
('inicio_inscricoes', '2026-09-08 00:00:00-03', 'Início do período de inscrições'),
('fim_inscricoes', '2026-10-08 23:59:59-03', 'Fim do período de inscrições'),
('inicio_votacao', '2026-11-04 00:00:00-03', 'Início da votação popular'),
('fim_votacao', '2026-11-13 23:59:59-03', 'Fim da votação popular')
ON CONFLICT (chave) DO UPDATE 
SET valor_data = EXCLUDED.valor_data, descricao = EXCLUDED.descricao;
