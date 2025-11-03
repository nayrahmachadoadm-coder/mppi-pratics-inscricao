// Serviço mock para demonstração do sistema administrativo
import { AdminInscricaoData, AdminInscricoesResult, InscricaoFilters } from './adminService';

// Dados mock para demonstração
const mockInscricoes: AdminInscricaoData[] = [
  {
    id: '1',
    nome_completo: 'João Silva Santos',
    email_institucional: 'joao.silva@mppi.mp.br',
    telefone: '(86) 99999-1234',
    matricula: '12345',
    lotacao: 'Procuradoria Geral',
    area_atuacao: 'finalistica-projeto',
    titulo_iniciativa: 'Sistema de Gestão de Capacitação Digital',
    data_inicio: '2024-01-15',
    data_fim: '2024-12-15',
    publico_alvo: 'Servidores do MPPI',
    descricao_iniciativa: 'Implementação de um sistema digital para gestão de capacitações e treinamentos dos servidores.',
    objetivos: 'Modernizar o processo de capacitação e melhorar a eficiência.',
    metodologia: 'Desenvolvimento ágil com participação dos usuários finais.',
    principais_resultados: 'Redução de 60% no tempo de gestão de capacitações.',
    situacao_atual: 'Em execução',
    data_conclusao: null,
    problema_necessidade: 'Processo manual demorado e propenso a erros.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    nome_completo: 'Maria Oliveira Costa',
    email_institucional: 'maria.oliveira@mppi.mp.br',
    telefone: '(86) 99999-5678',
    matricula: '67890',
    lotacao: 'Promotoria de Justiça',
    area_atuacao: 'estruturante-projeto',
    titulo_iniciativa: 'Portal de Transparência Avançado',
    data_inicio: '2024-03-01',
    data_fim: '2024-11-30',
    publico_alvo: 'Cidadãos e servidores',
    descricao_iniciativa: 'Desenvolvimento de portal com funcionalidades avançadas de transparência e acesso à informação.',
    objetivos: 'Aumentar a transparência e facilitar o acesso às informações públicas.',
    metodologia: 'Design thinking e desenvolvimento centrado no usuário.',
    principais_resultados: 'Aumento de 150% no acesso às informações públicas.',
    situacao_atual: 'Concluído',
    data_conclusao: '2024-11-30',
    problema_necessidade: 'Portal antigo com baixa usabilidade.',
    participou_edicoes_anteriores: true,
    foi_vencedor_anterior: false,
    observacoes: 'Participou da edição de 2023',
    declaracao: true,
    created_at: '2024-02-25T14:30:00Z',
    updated_at: '2024-11-30T16:45:00Z'
  },
  {
    id: '3',
    nome_completo: 'Carlos Eduardo Lima',
    email_institucional: 'carlos.lima@mppi.mp.br',
    telefone: '(86) 99999-9012',
    matricula: '11111',
    lotacao: 'Corregedoria',
    area_atuacao: 'finalistica-pratica',
    titulo_iniciativa: 'Protocolo Digital Integrado',
    data_inicio: '2024-06-01',
    data_fim: '2025-05-31',
    publico_alvo: 'Todos os setores do MPPI',
    descricao_iniciativa: 'Sistema integrado de protocolo digital para todos os documentos institucionais.',
    objetivos: 'Eliminar o uso de papel e agilizar o trâmite de documentos.',
    metodologia: 'Implementação gradual por setores com treinamento contínuo.',
    principais_resultados: 'Redução de 80% no uso de papel nos setores implementados.',
    situacao_atual: 'Em execução',
    data_conclusao: null,
    problema_necessidade: 'Processo de protocolo manual e lento.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-05-20T09:15:00Z',
    updated_at: '2024-05-20T09:15:00Z'
  },
  {
    id: '4',
    nome_completo: 'Ana Paula Ferreira',
    email_institucional: 'ana.ferreira@mppi.mp.br',
    telefone: '(86) 99999-3456',
    matricula: '22222',
    lotacao: 'Centro de Apoio Operacional',
    area_atuacao: 'estruturante-pratica',
    titulo_iniciativa: 'Monitoramento Ambiental Inteligente',
    data_inicio: '2024-02-01',
    data_fim: '2024-10-31',
    publico_alvo: 'Promotores e técnicos ambientais',
    descricao_iniciativa: 'Sistema de monitoramento em tempo real de áreas de preservação usando IoT e IA.',
    objetivos: 'Melhorar a fiscalização ambiental e prevenir crimes ambientais.',
    metodologia: 'Instalação de sensores IoT e desenvolvimento de algoritmos de IA.',
    principais_resultados: 'Detecção precoce de 95% dos incidentes ambientais.',
    situacao_atual: 'Concluído',
    data_conclusao: '2024-10-31',
    problema_necessidade: 'Dificuldade de monitoramento contínuo de áreas extensas.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-01-25T11:30:00Z',
    updated_at: '2024-10-31T17:00:00Z'
  },
  {
    id: '5',
    nome_completo: 'Roberto Almeida Santos',
    email_institucional: 'roberto.santos@mppi.mp.br',
    telefone: '(86) 99999-7890',
    matricula: '33333',
    lotacao: 'Promotoria Criminal',
    area_atuacao: 'categoria-especial-ia',
    titulo_iniciativa: 'Análise Preditiva de Criminalidade',
    data_inicio: '2024-04-01',
    data_fim: '2025-03-31',
    publico_alvo: 'Promotores criminais e forças de segurança',
    descricao_iniciativa: 'Ferramenta de análise preditiva para identificar padrões criminais e otimizar recursos.',
    objetivos: 'Reduzir índices de criminalidade através de prevenção inteligente.',
    metodologia: 'Machine learning aplicado a dados históricos de criminalidade.',
    principais_resultados: 'Redução de 25% nos crimes nas áreas piloto.',
    situacao_atual: 'Em execução',
    data_conclusao: null,
    problema_necessidade: 'Alocação ineficiente de recursos de segurança.',
    participou_edicoes_anteriores: true,
    foi_vencedor_anterior: true,
    observacoes: 'Vencedor da categoria Inovação em 2023',
    declaracao: true,
    created_at: '2024-03-15T08:45:00Z',
    updated_at: '2024-03-15T08:45:00Z'
  },
  {
    id: '6',
    nome_completo: 'Luciana Moreira Silva',
    email_institucional: 'luciana.silva@mppi.mp.br',
    telefone: '(86) 99999-2468',
    matricula: '44444',
    lotacao: 'Assessoria de Comunicação',
    area_atuacao: 'categoria-especial-ia',
    titulo_iniciativa: 'Chatbot Jurídico Cidadão',
    data_inicio: '2024-05-15',
    data_fim: '2024-12-31',
    publico_alvo: 'Cidadãos em geral',
    descricao_iniciativa: 'Chatbot com IA para orientação jurídica básica e direcionamento de demandas.',
    objetivos: 'Facilitar o acesso à justiça e reduzir demandas desnecessárias.',
    metodologia: 'Desenvolvimento com processamento de linguagem natural.',
    principais_resultados: 'Atendimento de 10.000+ consultas com 90% de satisfação.',
    situacao_atual: 'Em execução',
    data_conclusao: null,
    problema_necessidade: 'Dificuldade de acesso à orientação jurídica básica.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-05-10T13:20:00Z',
    updated_at: '2024-05-10T13:20:00Z'
  },
  {
    id: '7',
    nome_completo: 'Fernando Costa Oliveira',
    email_institucional: 'fernando.oliveira@mppi.mp.br',
    telefone: '(86) 99999-1357',
    matricula: '55555',
    lotacao: 'Ouvidoria',
    area_atuacao: 'finalistica-projeto',
    titulo_iniciativa: 'Portal Unificado de Denúncias',
    data_inicio: '2024-01-01',
    data_fim: '2024-08-31',
    publico_alvo: 'Cidadãos e servidores',
    descricao_iniciativa: 'Portal integrado para recebimento e acompanhamento de denúncias e sugestões.',
    objetivos: 'Centralizar e agilizar o processamento de denúncias.',
    metodologia: 'Desenvolvimento web responsivo com workflow automatizado.',
    principais_resultados: 'Redução de 70% no tempo de resposta às denúncias.',
    situacao_atual: 'Concluído',
    data_conclusao: '2024-08-31',
    problema_necessidade: 'Múltiplos canais descoordenados para denúncias.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2023-12-20T16:00:00Z',
    updated_at: '2024-08-31T18:30:00Z'
  },
  {
    id: '8',
    nome_completo: 'Patricia Ribeiro Gomes',
    email_institucional: 'patricia.gomes@mppi.mp.br',
    telefone: '(86) 99999-9753',
    matricula: '66666',
    lotacao: 'Centro de Estudos e Aperfeiçoamento',
    area_atuacao: 'estruturante-projeto',
    titulo_iniciativa: 'Plataforma EAD Jurídica Avançada',
    data_inicio: '2024-03-15',
    data_fim: '2025-02-28',
    publico_alvo: 'Servidores e membros do MPPI',
    descricao_iniciativa: 'Plataforma de ensino à distância com gamificação e trilhas personalizadas.',
    objetivos: 'Modernizar a capacitação jurídica e aumentar engajamento.',
    metodologia: 'Design instrucional com elementos de gamificação.',
    principais_resultados: 'Aumento de 200% na participação em cursos.',
    situacao_atual: 'Em execução',
    data_conclusao: null,
    problema_necessidade: 'Baixa adesão aos cursos de capacitação tradicionais.',
    participou_edicoes_anteriores: true,
    foi_vencedor_anterior: false,
    observacoes: 'Participou em 2022 com projeto similar',
    declaracao: true,
    created_at: '2024-03-10T10:15:00Z',
    updated_at: '2024-03-10T10:15:00Z'
  },
  {
    id: '9',
    nome_completo: 'Marcos Antonio Silva',
    email_institucional: 'marcos.silva@mppi.mp.br',
    telefone: '(86) 99999-4567',
    matricula: '77777',
    lotacao: 'Promotoria de Justiça Cível',
    area_atuacao: 'finalistica-projeto',
    titulo_iniciativa: 'Sistema de Mediação Digital',
    data_inicio: '2024-02-01',
    data_fim: '2024-10-31',
    publico_alvo: 'Cidadãos e advogados',
    descricao_iniciativa: 'Plataforma digital para mediação de conflitos cíveis.',
    objetivos: 'Reduzir a judicialização e acelerar a resolução de conflitos.',
    metodologia: 'Desenvolvimento de plataforma web com videoconferência.',
    principais_resultados: 'Resolução de 80% dos casos sem necessidade de processo.',
    situacao_atual: 'Concluído',
    data_conclusao: '2024-10-31',
    problema_necessidade: 'Alto volume de processos cíveis.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-01-28T14:20:00Z',
    updated_at: '2024-10-31T16:45:00Z'
  },
  {
    id: '10',
    nome_completo: 'Sandra Regina Costa',
    email_institucional: 'sandra.costa@mppi.mp.br',
    telefone: '(86) 99999-8901',
    matricula: '88888',
    lotacao: 'Centro de Apoio Técnico',
    area_atuacao: 'estruturante-projeto',
    titulo_iniciativa: 'Modernização da Infraestrutura de TI',
    data_inicio: '2024-01-01',
    data_fim: '2024-12-31',
    publico_alvo: 'Todos os servidores do MPPI',
    descricao_iniciativa: 'Projeto de modernização completa da infraestrutura tecnológica.',
    objetivos: 'Melhorar performance e segurança dos sistemas.',
    metodologia: 'Implementação gradual com migração para nuvem.',
    principais_resultados: 'Redução de 90% nos incidentes de TI.',
    situacao_atual: 'Em execução',
    data_conclusao: null,
    problema_necessidade: 'Infraestrutura obsoleta e instável.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2023-12-15T09:00:00Z',
    updated_at: '2023-12-15T09:00:00Z'
  },
  {
    id: '11',
    nome_completo: 'Rafael Mendes Oliveira',
    email_institucional: 'rafael.oliveira@mppi.mp.br',
    telefone: '(86) 99999-2345',
    matricula: '99999',
    lotacao: 'Promotoria de Defesa do Consumidor',
    area_atuacao: 'finalistica-pratica',
    titulo_iniciativa: 'Atendimento Digital ao Consumidor',
    data_inicio: '2024-03-01',
    data_fim: '2024-09-30',
    publico_alvo: 'Consumidores do Estado do Piauí',
    descricao_iniciativa: 'Prática de atendimento digital para denúncias de consumo.',
    objetivos: 'Facilitar o acesso do consumidor aos serviços do MPPI.',
    metodologia: 'Implementação de canais digitais integrados.',
    principais_resultados: 'Aumento de 300% no número de atendimentos.',
    situacao_atual: 'Concluído',
    data_conclusao: '2024-09-30',
    problema_necessidade: 'Dificuldade de acesso presencial dos consumidores.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-02-25T11:30:00Z',
    updated_at: '2024-09-30T17:15:00Z'
  },
  {
    id: '12',
    nome_completo: 'Juliana Pereira Santos',
    email_institucional: 'juliana.santos@mppi.mp.br',
    telefone: '(86) 99999-6789',
    matricula: '10101',
    lotacao: 'Promotoria Eleitoral',
    area_atuacao: 'estruturante-pratica',
    titulo_iniciativa: 'Fiscalização Eleitoral Digital',
    data_inicio: '2024-04-01',
    data_fim: '2024-11-30',
    publico_alvo: 'Eleitores e candidatos',
    descricao_iniciativa: 'Prática de fiscalização eleitoral usando ferramentas digitais.',
    objetivos: 'Aumentar a eficiência da fiscalização eleitoral.',
    metodologia: 'Uso de aplicativos móveis e análise de dados.',
    principais_resultados: 'Detecção de 95% das irregularidades eleitorais.',
    situacao_atual: 'Concluído',
    data_conclusao: '2024-11-30',
    problema_necessidade: 'Fiscalização manual limitada e demorada.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-03-25T13:45:00Z',
    updated_at: '2024-11-30T18:00:00Z'
  },
  {
    id: '13',
    nome_completo: 'Eduardo Lima Ferreira',
    email_institucional: 'eduardo.ferreira@mppi.mp.br',
    telefone: '(86) 99999-3456',
    matricula: '11223',
    lotacao: 'Promotoria de Justiça Criminal',
    area_atuacao: 'finalistica-pratica',
    titulo_iniciativa: 'Audiências de Custódia Virtuais',
    data_inicio: '2024-05-01',
    data_fim: '2024-12-31',
    publico_alvo: 'Presos e advogados',
    descricao_iniciativa: 'Implementação de audiências de custódia por videoconferência.',
    objetivos: 'Agilizar o processo e reduzir custos de transporte.',
    metodologia: 'Uso de plataforma de videoconferência segura.',
    principais_resultados: 'Redução de 70% no tempo de realização das audiências.',
    situacao_atual: 'Em execução',
    data_conclusao: null,
    problema_necessidade: 'Demora e alto custo das audiências presenciais.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-04-20T10:30:00Z',
    updated_at: '2024-04-20T10:30:00Z'
  },
  {
    id: '14',
    nome_completo: 'Carla Rodrigues Almeida',
    email_institucional: 'carla.almeida@mppi.mp.br',
    telefone: '(86) 99999-7890',
    matricula: '33445',
    lotacao: 'Assessoria de Gestão Estratégica',
    area_atuacao: 'estruturante-pratica',
    titulo_iniciativa: 'Gestão de Indicadores em Tempo Real',
    data_inicio: '2024-06-01',
    data_fim: '2024-12-31',
    publico_alvo: 'Gestores e servidores',
    descricao_iniciativa: 'Dashboard em tempo real para acompanhamento de indicadores institucionais.',
    objetivos: 'Melhorar a tomada de decisão baseada em dados.',
    metodologia: 'Desenvolvimento de BI com integração de sistemas.',
    principais_resultados: 'Melhoria de 50% na velocidade de tomada de decisões.',
    situacao_atual: 'Em execução',
    data_conclusao: null,
    problema_necessidade: 'Falta de visibilidade dos indicadores institucionais.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-05-25T15:00:00Z',
    updated_at: '2024-05-25T15:00:00Z'
  }
  ,
  {
    id: '15',
    nome_completo: 'Beatriz Nogueira Lima',
    email_institucional: 'beatriz.lima@mppi.mp.br',
    telefone: '(86) 99999-1122',
    matricula: '55667',
    lotacao: 'Núcleo de Inovação Tecnológica',
    area_atuacao: 'categoria-especial-ia',
    titulo_iniciativa: 'Assistente de Redação com IA para Petições',
    data_inicio: '2024-07-01',
    data_fim: '2025-01-31',
    publico_alvo: 'Membros e servidores do MPPI',
    descricao_iniciativa: 'Ferramenta de IA que auxilia na elaboração de petições e minutas com modelos e linguagem jurídica adequada.',
    objetivos: 'Aumentar produtividade e padronização dos documentos jurídicos.',
    metodologia: 'Fine-tuning de modelos de linguagem e integração com base de precedentes.',
    principais_resultados: 'Redução de 40% no tempo médio de elaboração de petições.',
    situacao_atual: 'Em execução',
    data_conclusao: null,
    problema_necessidade: 'Demanda elevada e tempo de elaboração de documentos.',
    participou_edicoes_anteriores: false,
    foi_vencedor_anterior: false,
    observacoes: null,
    declaracao: true,
    created_at: '2024-06-28T10:00:00Z',
    updated_at: '2024-06-28T10:00:00Z'
  }
];

export async function getAllInscricoesMock(
  page: number = 1,
  limit: number = 20,
  filters?: InscricaoFilters
): Promise<AdminInscricoesResult> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredData = [...mockInscricoes];
  
  // Aplicar filtros
  if (filters) {
    if (filters.area_atuacao && filters.area_atuacao !== 'todas') {
      filteredData = filteredData.filter(item => 
        item.area_atuacao === filters.area_atuacao
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.nome_completo.toLowerCase().includes(searchLower) ||
        item.email_institucional.toLowerCase().includes(searchLower) ||
        item.titulo_iniciativa.toLowerCase().includes(searchLower)
      );
    }
  }
  
  const total = filteredData.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: paginatedData,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

export async function getInscricaoByIdMock(id: string): Promise<AdminInscricoesResult> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const inscricao = mockInscricoes.find(item => item.id === id);
  
  if (!inscricao) {
    return {
      success: false,
      error: 'Inscrição não encontrada'
    };
  }
  
  return {
    success: true,
    data: [inscricao]
  };
}

export async function getInscricoesStatsMock() {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const total = mockInscricoes.length;
  
  // Estatísticas por área
  const porArea = mockInscricoes.reduce((acc, item) => {
    const area = item.area_atuacao;
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const por_area = Object.entries(porArea).map(([area, count]) => ({
    area,
    count
  }));
  
  // Estatísticas por mês (últimos 6 meses)
  const por_mes = [
    { mes: '2024-07', count: 0 },
    { mes: '2024-08', count: 0 },
    { mes: '2024-09', count: 1 },
    { mes: '2024-10', count: 0 },
    { mes: '2024-11', count: 1 },
    { mes: '2024-12', count: 1 }
  ];
  
  // Últimas 24h (simulado)
  const ultimas_24h = 0;
  
  return {
    success: true,
    data: {
      total,
      por_area,
      por_mes,
      ultimas_24h
    }
  };
}

export async function getAreasAtuacaoMock() {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const areas = [...new Set(mockInscricoes.map(item => item.area_atuacao))];
  
  return {
    success: true,
    data: areas
  };
}