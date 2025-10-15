/**
 * Mapeamento dos códigos dos objetivos estratégicos do MPPI para suas descrições completas
 */
export const objetivosEstrategicos = {
  obj1: "Aperfeiçoar a atividade investigativa e de inteligência do MPPI",
  obj2: "Aprimorar a efetividade da persecução cível e penal, assegurando ainda direitos e garantias a acusados e vítimas",
  obj3: "Consolidar a atuação ministerial integrada e estimular a articulação interinstitucional",
  obj4: "Garantir a transversalidade dos direitos fundamentais em toda a atividade ministerial",
  obj5: "Impulsionar a fiscalização do emprego de recursos públicos, a implementação de políticas públicas e o controle social",
  obj6: "Intensificar o diálogo com a sociedade e fomentar a solução pacífica de conflitos",
  obj7: "Disseminar práticas de governança e gestão, em todos os níveis, orientadas para resultados",
  obj8: "Zelar pela sustentabilidade em toda forma de atuação",
  obj9: "Assegurar a disponibilidade e a aplicação eficiente dos recursos orçamentários",
  obj10: "Estabelecer gestão administrativa compartilhada e padronizada",
  obj11: "Fortalecer os processos de comunicação e a imagem institucional",
  obj12: "Promover a gestão por competências e a qualidade de vida no trabalho",
  obj13: "Prover soluções tecnológicas integradas e inovadoras"
} as const;

/**
 * Função para obter a descrição completa de um objetivo estratégico
 * @param codigo - Código do objetivo (ex: "obj1", "obj2", etc.)
 * @returns Descrição completa do objetivo ou o código original se não encontrado
 */
export function getObjetivoEstrategicoDescricao(codigo: string): string {
  return objetivosEstrategicos[codigo as keyof typeof objetivosEstrategicos] || codigo;
}

/**
 * Função para formatar o objetivo estratégico para exibição
 * @param codigo - Código do objetivo (ex: "obj1", "obj2", etc.)
 * @returns Descrição formatada do objetivo
 */
export function formatObjetivoEstrategico(codigo: string): string {
  const descricao = getObjetivoEstrategicoDescricao(codigo);
  return descricao;
}