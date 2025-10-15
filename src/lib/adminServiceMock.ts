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
    area_atuacao: 'Gestão de Pessoas',
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
    area_atuacao: 'Tecnologia da Informação',
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
    area_atuacao: 'Gestão Administrativa',
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