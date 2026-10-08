-- Prorrogação das inscrições para o prêmio até 18 de outubro de 2026

UPDATE public.cronograma_parametros 
SET valor_data = '2026-10-18 23:59:59' 
WHERE chave = 'fim_inscricoes';
