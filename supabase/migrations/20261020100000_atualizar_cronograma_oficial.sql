-- Atualização do Cronograma Oficial da 10ª Edição do Prêmio Melhores Práticas MPPI
-- 04/09/2026 — Lançamento do Edital
-- 08/09/2026 a 18/10/2026 — Período de inscrições
-- 21/10/2026 — Divulgação da relação provisória das inscrições deferidas e indeferidas
-- 22/10/2026 a 26/10/2026 — Prazo para pedido de reconsideração
-- 29/10/2026 — Divulgação da relação definitiva das inscrições habilitadas
-- 29/10/2026 a 09/11/2026 — Julgamento técnico pela Comissão Julgadora
-- 11/11/2026 — Divulgação dos finalistas
-- 12/11/2026 a 23/11/2026 — Votação popular
-- Dezembro de 2026 — Cerimônia de premiação
-- Após a cerimônia — Publicação e homologação do resultado final

UPDATE public.cronograma_parametros 
SET valor_data = '2026-11-12 00:00:00-03' 
WHERE chave = 'inicio_votacao';

UPDATE public.cronograma_parametros 
SET valor_data = '2026-11-23 23:59:59-03' 
WHERE chave = 'fim_votacao';
