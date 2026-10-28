/**
 * Utilitário central de gerenciamento e cálculo dinâmico das etapas do certame
 * Prêmio Melhores Práticas MPPI • 10ª Edição (2026)
 *
 * Garante que a aplicação saiba dinamicamente a data atual e determine
 * com exatidão o status de cada etapa e a fase em andamento.
 */

export type EtapaStatus = 'concluido' | 'em_andamento' | 'proximo';

export interface EtapaDef {
  etapa: string;
  titulo: string;
  periodo: string;
  desc: string;
  startIso: string;
  endIso: string;
  defaultStatusLabel: string;
  concluidoLabel?: string;
  badge: string;
  bannerTitle: string;
  bannerDesc: string;
  proximoMarcoData: string;
  proximoMarcoTitulo: string;
}

export interface EtapaDisplayItem {
  etapa: string;
  titulo: string;
  periodo: string;
  status: EtapaStatus;
  statusLabel: string;
  desc: string;
}

export interface CertameStatus {
  etapas: EtapaDisplayItem[];
  etapaAtual: EtapaDef | null;
  etapaAtualIndex: number;
  bannerBadge: string;
  bannerTitulo: string;
  bannerDescricao: string;
  proximoMarcoData: string;
  proximoMarcoDesc: string;
  dataReferencia: Date;
  dataHojeFormatada: string;
  recursoStatus: 'futuro' | 'aberto' | 'encerrado';
}

/**
 * Definições oficiais das 8 etapas do Edital nº 88/2026 (Anexo Único)
 */
export const ETAPAS_OFICIAIS: EtapaDef[] = [
  {
    etapa: '01',
    titulo: 'Submissão das Inscrições',
    periodo: '08/09 a 18/10/2026',
    desc: 'Período oficial de cadastro e envio das práticas e projetos inovadores via formulário eletrônico público.',
    startIso: '2026-09-08T00:00:00-03:00',
    endIso: '2026-10-18T23:59:59-03:00',
    defaultStatusLabel: 'Inscrições',
    concluidoLabel: 'Encerrado',
    badge: 'Inscrições Abertas',
    bannerTitle: 'Submissão de Práticas e Projetos em Andamento',
    bannerDesc: 'Período oficial de cadastro e envio das práticas e projetos inovadores via formulário eletrônico público.',
    proximoMarcoData: '18/10/2026',
    proximoMarcoTitulo: 'Encerramento do prazo oficial de inscrições',
  },
  {
    etapa: '02',
    titulo: 'Relação Provisória de Inscrições',
    periodo: '21/10/2026',
    desc: 'Divulgação preliminar no Diário Oficial das iniciativas que foram deferidas e indeferidas na triagem formal.',
    startIso: '2026-10-19T00:00:00-03:00',
    endIso: '2026-10-21T23:59:59-03:00',
    defaultStatusLabel: 'Triagem Formal',
    concluidoLabel: 'Concluído',
    badge: 'Triagem & Habilitação',
    bannerTitle: 'Inscrições encerradas • Triagem formal e habilitação preliminar',
    bannerDesc: 'As inscrições submetidas foram processadas pela equipe técnica para verificação dos requisitos do Edital e publicação da relação provisória.',
    proximoMarcoData: '21/10/2026',
    proximoMarcoTitulo: 'Divulgação da relação provisória no Diário Oficial',
  },
  {
    etapa: '03',
    titulo: 'Prazo para Pedido de Reconsideração',
    periodo: '22/10 a 26/10/2026',
    desc: 'Prazo para autores de inscrições preliminarmente indeferidas apresentarem justificativa e recurso fundamentado.',
    startIso: '2026-10-22T00:00:00-03:00',
    endIso: '2026-10-26T23:59:59-03:00',
    defaultStatusLabel: 'Fase Recursal',
    concluidoLabel: 'Encerrado',
    badge: 'Fase Recursal',
    bannerTitle: 'Relação preliminar publicada • Pedidos de reconsideração abertos',
    bannerDesc: 'Autores de inscrições com inconformidades formais podem apresentar justificativa e pedido de reconsideração à Comissão Organizadora.',
    proximoMarcoData: '26/10/2026',
    proximoMarcoTitulo: 'Encerramento do prazo para pedidos de reconsideração',
  },
  {
    etapa: '04',
    titulo: 'Relação Definitiva de Habilitados',
    periodo: '29/10/2026',
    desc: 'Apreciação dos pedidos de reconsideração e publicação da lista definitiva com todas as iniciativas habilitadas a serem julgadas pela Comissão Julgadora.',
    startIso: '2026-10-27T00:00:00-03:00',
    endIso: '2026-10-29T23:59:59-03:00',
    defaultStatusLabel: 'Homologação',
    concluidoLabel: 'Concluído',
    badge: 'Análise de Recursos & Homologação',
    bannerTitle: 'Prazo recursal encerrado • Processamento da lista definitiva',
    bannerDesc: 'O prazo para pedidos de reconsideração encerrou-se em 26/10/2026. A equipe técnica está processando os recursos para publicação da relação definitiva de habilitados no Diário Oficial.',
    proximoMarcoData: '29/10/2026',
    proximoMarcoTitulo: 'Publicação da relação definitiva e início da avaliação técnica',
  },
  {
    etapa: '05',
    titulo: 'Julgamento Técnico pelos Jurados',
    periodo: '29/10 a 09/11/2026',
    desc: 'Análise individual e atribuição de notas de 0 a 5 em cada um dos 5 critérios por parte dos jurados designados.',
    startIso: '2026-10-30T00:00:00-03:00',
    endIso: '2026-11-09T23:59:59-03:00',
    defaultStatusLabel: 'Avaliação Técnica',
    concluidoLabel: 'Encerrado',
    badge: 'Avaliação Técnica',
    bannerTitle: 'Julgamento Técnico pela Comissão Julgadora em Andamento',
    bannerDesc: 'Os jurados técnicos designados estão avaliando as iniciativas habilitadas conforme os 5 critérios: Cooperação, Inovação, Resolutividade, Impacto Social e Replicabilidade.',
    proximoMarcoData: '11/11/2026',
    proximoMarcoTitulo: 'Divulgação oficial dos finalistas (Top 3 de cada categoria)',
  },
  {
    etapa: '06',
    titulo: 'Divulgação dos Finalistas',
    periodo: '11/11/2026',
    desc: 'Apresentação dos 3 (três) trabalhos com maior média técnica em cada categoria habilitados ao voto popular.',
    startIso: '2026-11-10T00:00:00-03:00',
    endIso: '2026-11-11T23:59:59-03:00',
    defaultStatusLabel: 'Classificação',
    concluidoLabel: 'Concluído',
    badge: 'Classificação Técnica',
    bannerTitle: 'Conclusão do Julgamento Técnico • Relação de Finalistas',
    bannerDesc: 'Publicação oficial dos 3 trabalhos com maior média técnica em cada categoria que concorrerão à premiação no voto popular.',
    proximoMarcoData: '12/11/2026',
    proximoMarcoTitulo: 'Abertura da votação popular institucional',
  },
  {
    etapa: '07',
    titulo: 'Votação Popular Institucional',
    periodo: '12/11 a 23/11/2026',
    desc: 'Votação aberta e direta para todos os integrantes (membros e servidores) do Ministério Público do Piauí.',
    startIso: '2026-11-12T00:00:00-03:00',
    endIso: '2026-11-23T23:59:59-03:00',
    defaultStatusLabel: 'Votação Aberta',
    concluidoLabel: 'Encerrado',
    badge: 'Votação Popular Aberta',
    bannerTitle: 'Votação Popular Aberta aos Integrantes do MPPI',
    bannerDesc: 'Membros e servidores do Ministério Público do Piauí estão votando diretamente em seus trabalhos preferidos entre os finalistas.',
    proximoMarcoData: '23/11/2026',
    proximoMarcoTitulo: 'Encerramento da votação popular',
  },
  {
    etapa: '08',
    titulo: 'Cerimônia de Premiação e Homologação',
    periodo: 'Dezembro de 2026',
    desc: 'Solenidade comemorativa dos 10 anos, entrega de troféus aos vencedores e homologação no Diário Oficial.',
    startIso: '2026-11-24T00:00:00-03:00',
    endIso: '2026-12-31T23:59:59-03:00',
    defaultStatusLabel: 'Resultado Final',
    concluidoLabel: 'Concluído',
    badge: 'Premiação & Homologação',
    bannerTitle: 'Apuração Consolidada e Cerimônia de Premiação',
    bannerDesc: 'Cálculo da nota final ponderada (80% comissão técnica + 20% voto popular) e realização da cerimônia comemorativa de entrega dos troféus aos vencedores.',
    proximoMarcoData: 'Dezembro de 2026',
    proximoMarcoTitulo: 'Cerimônia solene de premiação e homologação final',
  },
];

/**
 * Calcula o status de todas as etapas e os dados do banner informativo
 * com base na data de referência fornecida (por padrão: new Date()).
 */
export function calcularCertameStatus(
  dataReferencia: Date = new Date(),
  overrides?: Record<string, Date | null>
): CertameStatus {
  const agoraTime = dataReferencia.getTime();

  // Permite sobrescrever datas caso parâmetros dinâmicos estejam no banco
  const etapasAjustadas = ETAPAS_OFICIAIS.map((etapa) => {
    let start = new Date(etapa.startIso).getTime();
    let end = new Date(etapa.endIso).getTime();

    if (overrides) {
      if (etapa.etapa === '01') {
        if (overrides.inicio_inscricoes) start = overrides.inicio_inscricoes.getTime();
        if (overrides.fim_inscricoes) end = overrides.fim_inscricoes.getTime();
      } else if (etapa.etapa === '03') {
        if (overrides.inicio_recursos_inscricao) start = overrides.inicio_recursos_inscricao.getTime();
        if (overrides.fim_recursos_inscricao) end = overrides.fim_recursos_inscricao.getTime();
      } else if (etapa.etapa === '05') {
        if (overrides.inicio_julgamento) start = overrides.inicio_julgamento.getTime();
        if (overrides.fim_julgamento) end = overrides.fim_julgamento.getTime();
      } else if (etapa.etapa === '07') {
        if (overrides.inicio_votacao) start = overrides.inicio_votacao.getTime();
        if (overrides.fim_votacao) end = overrides.fim_votacao.getTime();
      }
    }

    return {
      def: etapa,
      startTime: start,
      endTime: end,
    };
  });

  // Localiza a etapa atual (aquela em que startTime <= agora <= endTime)
  let etapaAtualIndex = etapasAjustadas.findIndex(
    (e) => agoraTime >= e.startTime && agoraTime <= e.endTime
  );

  // Se agoraTime estiver antes da primeira etapa
  if (etapaAtualIndex === -1 && agoraTime < etapasAjustadas[0].startTime) {
    etapaAtualIndex = -2; // Antes do início
  }

  // Se agoraTime estiver após a última etapa
  if (etapaAtualIndex === -1 && agoraTime > etapasAjustadas[etapasAjustadas.length - 1].endTime) {
    etapaAtualIndex = etapasAjustadas.length; // Certame finalizado
  }

  // Se por alguma razão cair entre etapas (gap), encontra a próxima
  if (etapaAtualIndex === -1) {
    const nextIdx = etapasAjustadas.findIndex((e) => agoraTime < e.startTime);
    if (nextIdx !== -1) {
      etapaAtualIndex = nextIdx;
    } else {
      etapaAtualIndex = etapasAjustadas.length - 1;
    }
  }

  const etapaAtualDef =
    etapaAtualIndex >= 0 && etapaAtualIndex < ETAPAS_OFICIAIS.length
      ? ETAPAS_OFICIAIS[etapaAtualIndex]
      : null;

  // Monta a lista formatada para exibição
  const etapasDisplay: EtapaDisplayItem[] = etapasAjustadas.map((item, idx) => {
    let status: EtapaStatus = 'proximo';
    let statusLabel = item.def.defaultStatusLabel;

    if (agoraTime > item.endTime) {
      status = 'concluido';
      statusLabel = item.def.concluidoLabel || 'Encerrado';
    } else if (idx === etapaAtualIndex || (agoraTime >= item.startTime && agoraTime <= item.endTime)) {
      status = 'em_andamento';
      statusLabel = 'Em Andamento';
    } else {
      status = 'proximo';
      statusLabel = item.def.defaultStatusLabel;
    }

    return {
      etapa: item.def.etapa,
      titulo: item.def.titulo,
      periodo: item.def.periodo,
      status,
      statusLabel,
      desc: item.def.desc,
    };
  });

  // Determina dados do banner
  let bannerBadge = 'Fase Atual';
  let bannerTitulo = 'Acompanhamento do Certame';
  let bannerDescricao = 'Consulte o cronograma e as etapas do Prêmio Melhores Práticas MPPI.';
  let proximoMarcoData = '29/10/2026';
  let proximoMarcoDesc = 'Relação definitiva de inscrições';

  if (etapaAtualIndex === -2) {
    // Antes das inscrições
    bannerBadge = 'Edital Lançado';
    bannerTitulo = 'Inscrições em Breve • 10ª Edição';
    bannerDescricao = 'O Edital nº 88/2026 foi lançado. As inscrições começam oficialmente no dia 08/09/2026.';
    proximoMarcoData = '08/09/2026';
    proximoMarcoDesc = 'Abertura das inscrições';
  } else if (etapaAtualDef) {
    bannerBadge = etapaAtualDef.badge;
    bannerTitulo = etapaAtualDef.bannerTitle;
    bannerDescricao = etapaAtualDef.bannerDesc;
    proximoMarcoData = etapaAtualDef.proximoMarcoData;
    proximoMarcoDesc = etapaAtualDef.proximoMarcoTitulo;
  } else if (etapaAtualIndex >= ETAPAS_OFICIAIS.length) {
    // Certame concluído
    bannerBadge = 'Certame Concluído';
    bannerTitulo = '10ª Edição Concluída e Homologada';
    bannerDescricao = 'Todas as etapas do Prêmio Melhores Práticas 2026 foram realizadas com sucesso e homologadas no Diário Oficial.';
    proximoMarcoData = 'Finalizado';
    proximoMarcoDesc = 'Certame homologado';
  }

  // Verifica status do recurso (Etapa 03: 22/10 a 26/10)
  const etapaRecurso = etapasAjustadas[2];
  let recursoStatus: 'futuro' | 'aberto' | 'encerrado' = 'futuro';
  if (agoraTime > etapaRecurso.endTime) {
    recursoStatus = 'encerrado';
  } else if (agoraTime >= etapaRecurso.startTime && agoraTime <= etapaRecurso.endTime) {
    recursoStatus = 'aberto';
  }

  const dataHojeFormatada = dataReferencia.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return {
    etapas: etapasDisplay,
    etapaAtual: etapaAtualDef,
    etapaAtualIndex,
    bannerBadge,
    bannerTitulo,
    bannerDescricao,
    proximoMarcoData,
    proximoMarcoDesc,
    dataReferencia,
    dataHojeFormatada,
    recursoStatus,
  };
}
