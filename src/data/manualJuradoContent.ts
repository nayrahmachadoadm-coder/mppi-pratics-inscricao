/**
 * Conteúdo Completo e Estruturado do Manual do Jurado
 * 10ª Edição do Prêmio Melhores Práticas do MPPI (2026)
 * Edital nº 88/2026 - PGJ/PI
 */

export interface ManualSection {
  id: string;
  numero: string;
  titulo: string;
  resumo?: string;
  subsecoes?: {
    titulo: string;
    conteudo: string[];
    destaque?: string;
  }[];
  tabela?: {
    cabecalhos: string[];
    linhas: string[][];
  };
}

export const MANUAL_JURADO_METADATA = {
  titulo: 'MANUAL DO JURADO',
  subtitulo: 'Guia Oficial de Diretrizes, Avaliação Técnica e Julgamento das Iniciativas',
  certame: 'Prêmio Melhores Práticas do Ministério Público do Estado do Piauí',
  edicao: '10ª Edição Comemorativa (2016–2026) • 10 Anos de Inovação e Resolutividade',
  edital: 'Edital nº 88/2026 — PGJ/PI',
  orgaoEmissor: 'Comissão Julgadora Oficial • Assessoria de Planejamento e Gestão (ASSESPPLAGES)',
  localData: 'Teresina - PI, Outubro/Novembro de 2026',
  versao: '1.0 — Oficial',
};

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'boas-vindas',
    numero: '1',
    titulo: 'Mensagem de Acolhida e Boas-Vindas',
    resumo: 'Saudação institucional da Procuradoria-Geral de Justiça aos eminentes jurados.',
    subsecoes: [
      {
        titulo: 'Prezado(a) Membro da Comissão Julgadora,',
        conteudo: [
          'É com profundo orgulho e elevado espírito republicano que o Ministério Público do Estado do Piauí dá as boas-vindas a Vossa Senhoria para integrar a Comissão Julgadora da 10ª Edição Comemorativa do Prêmio Melhores Práticas.',
          'Neste marco de dez anos de existência, o certame consolida-se como o mais relevante instrumento de valorização, fomento e disseminação das iniciativas resolutivas, inovadoras e de alto impacto social concebidas por membros e servidores que dedicam seu labor cotidiano à transformação da realidade piauiense.',
          'Sua honrosa participação como jurado confere ao julgamento a indispensável isenção, a solidez técnica e o olhar crítico de quem compreende as complexidades dos desafios públicos e o papel constitucional transformador do Ministério Público.',
          'Este manual foi estruturado com o propósito de orientar e subsidiar todas as etapas do seu trabalho avaliativo, fornecendo segurança metodológica, critérios claros e instruções operacionais detalhadas.',
        ],
        destaque: 'Sua avaliação é o alicerce que legitima e consagra o mérito das iniciativas que estão transformando o Piauí.',
      },
    ],
  },
  {
    id: 'comissao-instituicoes',
    numero: '2',
    titulo: 'A Comissão Julgadora e a Importância das Instituições Representadas',
    resumo: 'A composição plural, multidisciplinar e representativa como garantia de legitimidade.',
    subsecoes: [
      {
        titulo: 'A Pluralidade como Pilar da Legitimidade',
        conteudo: [
          'A Comissão Julgadora da 10ª Edição do Prêmio Melhores Práticas foi concebida sob o primado da pluralidade institucional, congregando personalidades de notável saber jurídico, administrativo e social.',
          'A presença de representantes de diversas esferas públicas e da sociedade civil assegura que a escolha dos vencedores seja imune a visões corporativas isoladas, submetendo cada trabalho a um escrutínio abrangente, técnico e equilibrado.',
        ],
      },
      {
        titulo: 'Instituições que Integram o Colegiado',
        conteudo: [
          'A composição reúne representantes formalmente designados das seguintes instituições:',
          '• Procuradoria-Geral de Justiça do Estado do Piauí (PGJ/PI): garantindo o alinhamento com os objetivos estratégicos ministeriais;',
          '• Associação Piauiense do Ministério Público (APMP): representando a visão associativa da carreira de promotores e procuradores;',
          '• Sindicato dos Servidores do MPPI (SINDSEMP-PI): trazendo a perspectiva da força de trabalho técnico-administrativa;',
          '• Poder Judiciário do Estado do Piauí (TJ/PI): conferindo a ótica da jurisdição e da cooperação institucional no Sistema de Justiça;',
          '• Ordem dos Advogados do Brasil - Seccional Piauí (OAB/PI): assegurando a defesa da cidadania, do contraditório e do Estado de Direito;',
          '• Universidade Federal do Piauí (UFPI) e Universidade Estadual do Piauí (UESPI): aportando o rigor científico, metodológico e acadêmico;',
          '• Defensoria Pública do Estado do Piauí (DPE/PI) e Tribunal de Contas do Estado (TCE/PI): enriquecendo o debate sobre resolutividade e eficiência.',
        ],
        destaque: 'A convergência dessas instituições projeta credibilidade inquestionável e reconhecimento público aos projetos premiados.',
      },
    ],
  },
  {
    id: 'presidente-comissao',
    numero: '3',
    titulo: 'A Liderança e o Papel do Presidente da Comissão Julgadora',
    resumo: 'Atribuições, condução dos trabalhos colegiados e resolução de situações omissas.',
    subsecoes: [
      {
        titulo: 'Garantia da Segurança Jurídica e Regularidade Procedimental',
        conteudo: [
          'O Presidente da Comissão Julgadora, designado pela Procuradora-Geral de Justiça, exerce papel central na liderança moral, administrativa e jurídica do colegiado.',
          'Compete ao Presidente zelar pelo cumprimento estrito dos termos do Edital nº 88/2026, assegurando tratamento equânime a todos os proponentes, prazos rigorosos e preservação do sigilo até a proclamação oficial dos resultados.',
        ],
      },
      {
        titulo: 'Atribuições Principais do Presidente',
        conteudo: [
          '1. Presidir as reuniões formais de alinhamento, esclarecimento de dúvidas e deliberações da Comissão Julgadora;',
          '2. Dirigir e coordenar a interlocução entre os jurados e o suporte técnico prestado pela ASSESPPLAGES;',
          '3. Decidir sobre pedidos de diligências complementares ou esclarecimentos solicitados pelos jurados às iniciativas inscritas;',
          '4. Dirimir dúvidas interpretativas e resolver casos omissos ou situações excepcionais não previstas expressamente no Edital;',
          '5. Proclamar o resultado consolidado da avaliação técnica para encaminhamento à fase de Votação Popular e posterior homologação pela PGJ.',
        ],
      },
    ],
  },
  {
    id: 'contribuicao-jurados',
    numero: '4',
    titulo: 'A Contribuição dos Jurados para o Engrandecimento e Inovação do MPPI',
    resumo: 'Como o olhar criterioso do jurado estimula a melhoria contínua dos serviços públicos.',
    subsecoes: [
      {
        titulo: 'Mais que uma Avaliação: Um Impulso à Gestão Pública Eficiente',
        conteudo: [
          'A atuação dos jurados não se encerra na mera atribuição de notas. Cada parecer emitido, cada nota ponderada e cada reflexão compartilhada constituem um diagnóstico qualitativo sobre como o Ministério Público do Piauí está inovando e entregando valor à sociedade.',
          'Ao identificar iniciativas com elevado potencial de cooperação, inovação e resolutividade, os jurados apontam caminhos que merecem ser institucionalizados, fortalecidos com recursos e multiplicados para todas as comarcas do Estado.',
        ],
      },
      {
        titulo: 'Reconhecimento do Capital Humano',
        conteudo: [
          'O julgamento técnico é a mais nobre forma de valorizar o esforço dedicado de membros e servidores que, superando limitações estruturais, criaram soluções que impactam positivamente a infância, o meio ambiente, a probidade administrativa, os direitos humanos e a gestão pública.',
          'Sua assinatura neste processo chancela as melhores práticas como patrimônio intelectual permanente do MPPI.',
        ],
      },
    ],
  },
  {
    id: 'cronograma-prazos',
    numero: '5',
    titulo: 'Cronograma Oficial e Prazos do Julgamento Técnico',
    resumo: 'Datas críticas, janelas de avaliação e marcos de divulgação conforme o Anexo Único.',
    subsecoes: [
      {
        titulo: 'Janela Oficial da Avaliação Técnica',
        conteudo: [
          'Em conformidade com a atualização oficial do Cronograma do Edital nº 88/2026, a fase privativa de julgamento técnico pelos jurados transcorre no período:',
          '• Início do Julgamento Técnico: 29 de outubro de 2026 (quinta-feira)',
          '• Encerramento do Julgamento Técnico: 09 de novembro de 2026 (segunda-feira), às 23h59min',
          '• Divulgação Oficial dos Finalistas: 11 de novembro de 2026 (quarta-feira)',
          '• Votação Popular Institucional: 12 de novembro a 23 de novembro de 2026',
          '• Cerimônia de Premiação e Homologação Final: Dezembro de 2026',
        ],
        destaque: 'ATENÇÃO: Todas as notas devem ser devidamente salvas e consolidadas na plataforma até as 23h59 do dia 09/11/2026.',
      },
    ],
    tabela: {
      cabecalhos: ['Etapa do Certame', 'Período Regulamentar', 'Responsável'],
      linhas: [
        ['Publicação da Relação Definitiva de Habilitados', '29/10/2026', 'Comissão Organizadora / Diário Oficial'],
        ['Julgamento Técnico pelos Jurados', '29/10/2026 a 09/11/2026', 'Comissão Julgadora'],
        ['Apuração Técnica e Divulgação dos Finalistas (Top 3)', '11/11/2026', 'Comissão / ASSESPPLAGES'],
        ['Votação Popular Institucional', '12/11/2026 a 23/11/2026', 'Membros e Servidores do MPPI'],
        ['Cerimônia Oficial de Premiação dos Vencedores', 'Dezembro de 2026', 'Procuradoria-Geral de Justiça'],
      ],
    },
  },
  {
    id: 'formas-acesso-seguranca',
    numero: '6',
    titulo: 'Formas de Acesso ao Sistema e Sigilo Institucional',
    resumo: 'Credenciais personalizadas, primeiro login com troca de senha e dever de confidencialidade.',
    subsecoes: [
      {
        titulo: 'Acesso Seguro ao Portal do Julgador',
        conteudo: [
          'O acesso ao sistema informatizado é realizado exclusivamente através do endereço oficial:',
          'Portal Web: https://mppi-praticas-inscricao.vercel.app/admin/login (ou na intranet institucional)',
          'Cada jurado recebeu credencial individualizada com usuário (e-mail cadastrado ou username) e senha inicial temporária.',
          'No primeiro acesso ao sistema, o jurado é automaticamente convidado a definir uma nova senha pessoal e intransferível na tela de troca obrigatória de senha.',
        ],
      },
      {
        titulo: 'Dever Absoluto de Sigilo e Confidencialidade',
        conteudo: [
          'Os jurados comprometem-se expressamente a manter sigilo absoluto sobre:',
          '1. As notas atribuídas a cada trabalho até a homologação final do resultado;',
          '2. Os pareceres e considerações técnicas registradas no sistema;',
          '3. Documentos internos, dados institucionais ou estratégicos anexados pelos proponentes que não sejam de domínio público;',
          '4. Qualquer diálogo ou deliberação interna havida no âmbito da Comissão Julgadora.',
        ],
        destaque: 'O vazamento prévio de notas ou parciais de classificação sujeita o certame a nulidade e o infrator às sanções legais cabíveis.',
      },
    ],
  },
  {
    id: 'rito-julgamento-etica',
    numero: '7',
    titulo: 'Rito do Julgamento Técnico e Postura Ética do Jurado',
    resumo: 'Autonomia decisória, dever de imparcialidade e impedimentos.',
    subsecoes: [
      {
        titulo: 'Autonomia Técnica e Isenção',
        conteudo: [
          'O jurado atua com plena independência técnica e funcional. Não há hierarquia nas notas: todos os votos têm idêntico peso no cálculo da média aritmética de cada categoria.',
          'A pontuação deve refletir estritamente a aderência do trabalho aos 5 critérios do Edital, amparada pelas evidências e documentos apresentados na ficha de inscrição.',
        ],
      },
      {
        titulo: 'Hipóteses de Impedimento e Abstenção Ética',
        conteudo: [
          'O jurado deve declarar-se imediatamente impedido ou suspeito de avaliar determinada iniciativa caso:',
          '• Tenha participado diretamente da elaboração, implementação ou execução do projeto/prática inscrito;',
          '• Possua vínculo de parentesco até terceiro grau com o autor ou coautores participantes;',
          '• Atue como superior hierárquico imediato com ingerência direta na iniciativa avaliada;',
          'A declaração de impedimento deve ser comunicada por escrito ao Presidente da Comissão para o devido registro formal em ata.',
        ],
      },
    ],
  },
  {
    id: 'passo-a-passo-sistema',
    numero: '8',
    titulo: 'Guia Passo a Passo de Utilização do Sistema',
    resumo: 'Como navegar na listagem, abrir fichas, pontuar critérios e consolidar avaliações.',
    subsecoes: [
      {
        titulo: '1. Acesso à Área de Julgamento',
        conteudo: [
          'Após o login bem-sucedido, selecione no menu superior a opção "Julgamento" ou clique no botão "Acessar Painel de Julgamento" na tela de Boas-Vindas.',
          'O painel principal exibirá as 4 categorias do certame e o resumo de quantas iniciativas foram avaliadas pelo seu perfil.',
        ],
      },
      {
        titulo: '2. Navegação pelas Categorias',
        conteudo: [
          'As iniciativas estão agrupadas nas seguintes categorias regulamentares:',
          '• Projetos Finalísticos: propostas estruturadas voltadas à atividade-fim do MPPI;',
          '• Projetos Estruturantes: propostas voltadas à gestão, suporte e governança institucional;',
          '• Práticas Finalísticas: ações já executadas com resultados mensuráveis na atividade-fim;',
          '• Práticas Estruturantes: ações já executadas com resultados na gestão administrativa.',
        ],
      },
      {
        titulo: '3. Análise e Atribuição de Notas',
        conteudo: [
          'Ao selecionar uma iniciativa:',
          'a) Visualize a ficha de inscrição completa com título, autor, justificativa, metodologia e resultados;',
          'b) Abra e analise todos os anexos e links comprobatórios;',
          'c) No quadro de pontuação à direita, marque a pontuação de 0 a 5 em cada um dos 5 critérios;',
          'd) Opcionalmente, adicione comentários, observações ou fundamentação no campo de texto;',
          'e) Clique em "Salvar Avaliação" para computar suas notas no banco de dados.',
        ],
        destaque: 'O sistema permite revisar e alterar suas notas a qualquer momento até o encerramento do prazo final (09/11/2026).',
      },
    ],
  },
  {
    id: 'analise-anexos-ficha',
    numero: '9',
    titulo: 'Análise da Ficha de Inscrição e dos Documentos Comprobatórios (Anexos)',
    resumo: 'Como confrontar as narrativas dos formulários com as evidências documentais anexadas.',
    subsecoes: [
      {
        titulo: 'Verificação da Consistência das Informações',
        conteudo: [
          'A ficha de inscrição é o documento principal submetido pelo proponente. Nela constam as respostas estruturadas para:',
          '• Resumo Executivo: visão sintetizada do trabalho;',
          '• Problema / Necessidade: a dor ou gargalo que motivou a ação;',
          '• Objetivos Estratégicos e Metas: alinhamento com a missão do MPPI;',
          '• Metodologia e Etapas: como o trabalho foi executado;',
          '• Principais Resultados Alcançados: dados concretos, indicadores e benefícios gerados.',
        ],
      },
      {
        titulo: 'Exame Criterioso dos Anexos e Links Externos',
        conteudo: [
          'Os anexos são fundamentais para comprovar a veracidade das informações relatadas. Os proponentes puderam anexar:',
          '• Relatórios analíticos e planilhas de indicadores estatísticos;',
          '• Atos normativos, portarias ou resoluções de institucionalização;',
          '• Fotografias, apresentações e gravações audiovisuais comprobatórias;',
          '• Matérias publicadas na imprensa ou no portal oficial do MPPI;',
          '• Termos de cooperação e acordos celebrados com parceiros.',
          'Dica ao jurado: iniciativas com resultados mensuráveis e sustentados por documentos anexados merecem maior pontuação nos critérios de Resolutividade e Impacto.',
        ],
      },
    ],
  },
  {
    id: 'criterios-avaliacao',
    numero: '10',
    titulo: 'Critérios Oficiais de Avaliação (Item 4 do Edital nº 88/2026)',
    resumo: 'Detalhamento aprofundado dos 5 critérios com pesos rigorosamente iguais.',
    subsecoes: [
      {
        titulo: 'Diretriz Geral do Edital',
        conteudo: [
          'Conforme o Item 4.1 do Edital nº 88/2026, todas as iniciativas habilitadas são avaliadas de acordo com 5 (cinco) critérios técnicos de igual valor (pesos iguais), variando de 0 a 5 pontos cada.',
        ],
      },
      {
        titulo: 'Critério I — Cooperação (0 a 5 pontos)',
        conteudo: [
          'Definição: Grau de articulação e colaboração estabelecido entre unidades do Ministério Público, órgãos públicos externos, instituições parceiras ou organizações da sociedade civil.',
          'O que observar:',
          '• Houve trabalho em rede ou atuação isolada?',
          '• A iniciativa envolveu setores diversos do MPPI, potencializando competências?',
          '• Foram celebradas parcerias produtivas com tribunais, polícias, prefeituras, OAB, universidades ou coletivos comunitários?',
        ],
      },
      {
        titulo: 'Critério II — Inovação (0 a 5 pontos)',
        conteudo: [
          'Definição: Adoção de solução, método, processo, ferramenta tecnológica ou forma de atuação nova ou significativamente aperfeiçoada, capaz de produzir ganho substancial de qualidade, eficiência ou celeridade.',
          'O que observar:',
          '• O projeto rompe com rotinas burocráticas tradicionais?',
          '• Foi desenvolvida ou adaptada ferramenta digital, inteligência artificial ou fluxo ágil?',
          '• Houve criatividade na superação de entraves com custo reduzido?',
        ],
      },
      {
        titulo: 'Critério III — Resolutividade (0 a 5 pontos)',
        conteudo: [
          'Definição: Capacidade concreta de a iniciativa solucionar, prevenir, reduzir ou enfrentar de maneira efetiva e mensurável o problema ou desafio que motivou sua implementação.',
          'O que observar:',
          '• A iniciativa atacou a causa raiz do problema ou apenas sintomas superficiais?',
          '• Os resultados apresentados são palpáveis e acompanhados de indicadores confiáveis?',
          '• Houve resolução de conflitos sem necessidade de judicialização morosa?',
        ],
      },
      {
        titulo: 'Critério IV — Impacto Social ou Institucional (0 a 5 pontos)',
        conteudo: [
          'Definição: Dimensão, relevância, profundidade e sustentabilidade das transformações produzidas para a sociedade civil, para o público vulnerável atendido ou para o funcionamento interno do MPPI.',
          'O que observar:',
          '• Quantas pessoas foram beneficiadas direta e indiretamente?',
          '• Houve melhoria sensível na qualidade de vida de comunidades vulneráveis?',
          '• Houve ganho de produtividade, transparência ou economia de recursos públicos para a instituição?',
        ],
      },
      {
        titulo: 'Critério V — Replicabilidade (0 a 5 pontos)',
        conteudo: [
          'Definição: Possibilidade e viabilidade prática de a iniciativa ser reaplicada, adaptada ou expandida para outras promotorias, comarcas, unidades ministeriais ou até outros Ministérios Públicos.',
          'O que observar:',
          '• A solução é excessivamente personalizada a uma única pessoa ou foi metodologicamente documentada?',
          '• Os custos e exigências técnicas para replicação são razoáveis e acessíveis?',
          '• A iniciativa já foi ou está apta a ser disseminada como padrão estadual?',
        ],
      },
    ],
  },
  {
    id: 'regras-pontuacao-calculo',
    numero: '11',
    titulo: 'Regras de Pontuação, Escala de Notas e Cálculo Final',
    resumo: 'A escala descritiva de 0 a 5 pontos, conversão para escala centesimal e média ponderada.',
    subsecoes: [
      {
        titulo: 'Escala de Pontuação Inteira (Item 4.2 do Edital)',
        conteudo: [
          'Cada jurado deve atribuir notas inteiras entre 0 e 5 pontos, obedecendo rigorosamente à escala do Edital:',
        ],
      },
      {
        titulo: 'Cálculo da Média Técnica e Composição Final (Itens 8 e 9 do Edital)',
        conteudo: [
          '1. Pontuação Máxima por Jurado: 25 pontos (5 critérios x 5 pontos).',
          '2. Média Técnica da Comissão Julgadora (escala 0 a 100): É calculada a média aritmética simples das notas de todos os jurados e convertida proporcionalmente para a escala de 0 a 100 pontos (Item 8.3).',
          '3. Composição da Nota Final do Prêmio (Item 8.1):',
          '• 80% (oitenta por cento): Nota da Avaliação Técnica da Comissão Julgadora;',
          '• 20% (vinte por cento): Nota obtida no Voto Popular Institucional;',
          '4. Classificação dos Finalistas: Os 3 (três) trabalhos com maior média técnica em cada uma das 4 categorias serão proclamados finalistas no dia 11/11/2026 e seguirão para a votação popular.',
        ],
        destaque: 'Fórmula Final: Nota Consolidada = (Média Técnica dos Jurados x 0,80) + (Percentual de Voto Popular x 0,20)',
      },
    ],
    tabela: {
      cabecalhos: ['Pontos', 'Conceito', 'Descrição do Desempenho no Critério'],
      linhas: [
        ['0 ponto', 'Critério Não Demonstrado', 'A iniciativa não apresentou elementos ou dados que comprovem o critério avaliado.'],
        ['1 ponto', 'Atendimento Incipiente', 'Demonstração tímida, vaga ou embrionária, com evidências mínimas ou insuficientes.'],
        ['2 pontos', 'Atendimento Parcial', 'Demonstração parcial ou pouco consistente, com lacunas metodológicas ou de resultados.'],
        ['3 pontos', 'Atendimento Satisfatório', 'Cumpre adequadamente o critério com coerência técnica e bons resultados demonstrados.'],
        ['4 pontos', 'Atendimento Relevante', 'Atendimento de alto nível, bem fundamentado, expressivo e com evidências robustas.'],
        ['5 pontos', 'Atendimento Excelente', 'Desempenho exemplar, amplamente demonstrado por dados, indicadores, inovação e excelência.'],
      ],
    },
  },
  {
    id: 'canais-apoio',
    numero: '12',
    titulo: 'Canais de Apoio Técnico e Dúvidas (ASSESPPLAGES)',
    resumo: 'Suporte institucional, SEI e canal direto com a comissão organizadora.',
    subsecoes: [
      {
        titulo: 'Assessoria de Planejamento e Gestão (ASSESPPLAGES)',
        conteudo: [
          'A ASSESPPLAGES atua como secretaria executiva e suporte permanente à Comissão Julgadora.',
          'Em caso de dificuldades de acesso, dúvidas sobre o Edital ou solicitação de diligências aos proponentes, utilize os canais exclusivos:',
          '• E-mail Institucional: planejamento@mppi.mp.br',
          '• Telefone / Ramal: (86) 2222-8000, ramal 8015',
          '• Procedimento Administrativo: SEI nº 19.22.0000.00088/2026',
          '• Endereço: Edifício-Sede da Procuradoria-Geral de Justiça do Piauí — Teresina/PI',
        ],
        destaque: 'A equipe de tecnologia e planejamento permanece de prontidão durante todo o período de julgamento.',
      },
    ],
  },
];
