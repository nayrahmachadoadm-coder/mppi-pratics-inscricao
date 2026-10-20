import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { 
  Trophy, 
  Award, 
  CalendarClock, 
  CheckCircle2, 
  Scale, 
  ScrollText, 
  Users, 
  Vote, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  FileSearch,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Target,
  Compass,
  Check,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const InscricoesEncerradas: React.FC = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [isRegulamentoOpen, setIsRegulamentoOpen] = useState(false);

  // Desativa os confetes após alguns segundos para não distrair a leitura
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const timelineSteps = [
    {
      step: '01',
      title: 'Lançamento do Edital',
      period: '04/09/2026',
      status: 'completed',
      statusLabel: 'Concluído',
      desc: 'Publicação oficial do Edital nº 88/2026 no Diário Oficial do MPPI.',
    },
    {
      step: '02',
      title: 'Período de Inscrições',
      period: '08/09 a 18/10/2026',
      status: 'completed',
      statusLabel: 'Encerrado',
      desc: 'Submissão de práticas e projetos inovadores por membros e servidores.',
    },
    {
      step: '03',
      title: 'Relação Provisória (Deferidas e Indeferidas)',
      period: '21/10/2026',
      status: 'active_highlight',
      statusLabel: 'Próxima Etapa',
      desc: 'Divulgação preliminar da relação de inscrições deferidas e indeferidas.',
    },
    {
      step: '04',
      title: 'Pedido de Reconsideração',
      period: '22/10 a 26/10/2026',
      status: 'upcoming',
      statusLabel: 'Prazo Recursal',
      desc: 'Prazo regulamentar para interposição de pedidos de reconsideração.',
    },
    {
      step: '05',
      title: 'Relação Definitiva de Habilitados',
      period: '29/10/2026',
      status: 'upcoming',
      statusLabel: 'Homologação',
      desc: 'Divulgação definitiva da relação das iniciativas habilitadas ao prêmio.',
    },
    {
      step: '06',
      title: 'Julgamento Técnico',
      period: '29/10 a 09/11/2026',
      status: 'upcoming',
      statusLabel: 'Avaliação dos Jurados',
      desc: 'Análise aprofundada e atribuição de notas pela Comissão Julgadora.',
    },
    {
      step: '07',
      title: 'Divulgação dos Finalistas',
      period: '11/11/2026',
      status: 'upcoming',
      statusLabel: 'Finalistas',
      desc: 'Divulgação dos 3 trabalhos com maior média em cada categoria.',
    },
    {
      step: '08',
      title: 'Votação Popular Institucional',
      period: '12/11 a 23/11/2026',
      status: 'upcoming',
      statusLabel: 'Votação Aberta',
      desc: 'Votação popular aberta e direta para todos os integrantes do MPPI.',
    },
    {
      step: '09',
      title: 'Cerimônia de Premiação',
      period: 'Dezembro de 2026',
      status: 'upcoming',
      statusLabel: 'Solenidade',
      desc: 'Solenidade comemorativa dos 10 anos e entrega dos troféus aos vencedores.',
    },
    {
      step: '10',
      title: 'Homologação do Resultado Final',
      period: 'Após a cerimônia',
      status: 'upcoming',
      statusLabel: 'Encerramento',
      desc: 'Publicação e homologação do resultado final no Diário Oficial do MPPI.',
    },
  ];

  const criteriosAvaliacao = [
    {
      num: 'I',
      icon: Users,
      title: 'Cooperação',
      pontos: '0 a 5 pontos',
      desc: 'Grau de articulação e de colaboração entre unidades do MPPI, instituições parceiras ou organizações da sociedade civil.',
    },
    {
      num: 'II',
      icon: Sparkles,
      title: 'Inovação',
      pontos: '0 a 5 pontos',
      desc: 'Adoção de solução, método, processo, ferramenta ou forma de atuação nova ou significativamente aperfeiçoada, capaz de produzir ganho de qualidade, eficiência ou desempenho.',
    },
    {
      num: 'III',
      icon: Target,
      title: 'Resolutividade',
      pontos: '0 a 5 pontos',
      desc: 'Capacidade da iniciativa de solucionar, prevenir, reduzir ou enfrentar de maneira concreta o problema que motivou sua implementação.',
    },
    {
      num: 'IV',
      icon: TrendingUp,
      title: 'Impacto Social ou Institucional',
      pontos: '0 a 5 pontos',
      desc: 'Dimensão, relevância e profundidade das mudanças produzidas para a sociedade, para o público beneficiado ou para o funcionamento da Instituição.',
    },
    {
      num: 'V',
      icon: Compass,
      title: 'Replicabilidade',
      pontos: '0 a 5 pontos',
      desc: 'Possibilidade de a iniciativa ser reaplicada ou adaptada em outras unidades, áreas ou contextos institucionais, considerando sua viabilidade prática e seu potencial de produzir resultados semelhantes.',
    },
  ];

  const escalaPontuacao = [
    { ponto: '0 ponto', label: 'Critério não demonstrado' },
    { ponto: '1 ponto', label: 'Atendimento incipiente' },
    { ponto: '2 pontos', label: 'Atendimento parcial ou pouco consistente' },
    { ponto: '3 pontos', label: 'Atendimento satisfatório' },
    { ponto: '4 pontos', label: 'Atendimento relevante e bem demonstrado' },
    { ponto: '5 pontos', label: 'Atendimento excelente, amplamente demonstrado' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-amber-50/25 to-slate-100 flex flex-col items-center justify-start relative overflow-hidden text-foreground selection:bg-yellow-500/30">
      {/* Confetti comemorativo de 10 anos */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={350}
          gravity={0.12}
          colors={['#D4AF37', '#B8860B', '#FFD700', '#701128', '#4A0414', '#ffffff']}
        />
      )}

      {/* Elementos decorativos de fundo com efeito suave */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-yellow-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute top-60 right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '3s' }} />

      {/* Topo Institucional */}
      <header className="w-full border-b border-border/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-mppi.png" 
              alt="Brasão MPPI" 
              className="h-9 w-auto object-contain"
              onError={(e) => {
                // Fallback para favicon se houver problema
                (e.target as HTMLImageElement).src = '/favicon.ico';
              }}
            />
            <div className="border-l border-gray-300 pl-3">
              <span className="block text-xs font-semibold tracking-wider text-primary uppercase">
                Ministério Público do Estado do Piauí
              </span>
              <span className="block text-[11px] text-muted-foreground font-medium">
                Prêmio Melhores Práticas • 10ª Edição
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs h-9 border-primary/20 hover:border-primary/50 text-primary font-medium hover:bg-primary/5"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Área do Proponente
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/admin/login')}
              className="text-xs h-9 bg-primary hover:bg-primary-dark text-white font-medium shadow-sm"
            >
              <Scale className="w-3.5 h-3.5 mr-1.5" />
              Comissão Julgadora
            </Button>
          </div>
        </div>
      </header>

      {/* Container Principal */}
      <main className="w-full max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-8 relative z-10">
        
        {/* Card Hero de Aviso Oficial */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-yellow-500/30 bg-white/95 backdrop-blur-xl">
          {/* Header estilizado em tom institucional e dourado */}
          <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark p-6 sm:p-8 text-white relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(circle, #FFD700 1.5px, transparent 1.5px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Badge comemorativo dos 10 anos */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-xs font-semibold mb-4 shadow-inner">
                <Trophy className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                <span>10ª EDIÇÃO COMEMORATIVA • 10 ANOS DE BOAS PRÁTICAS</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 max-w-3xl leading-tight">
                Prêmio Melhores Práticas do MPPI
              </h1>
              <p className="text-sm sm:text-base text-yellow-100/90 max-w-2xl font-light">
                Reconhecendo o talento, a inovação e o compromisso resolutivo dos membros e servidores na transformação social do Piauí.
              </p>

              {/* Status Pill em destaque */}
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/30 border border-red-400/30 backdrop-blur-md shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
                <Lock className="w-4 h-4 text-red-300" />
                <span className="text-xs sm:text-sm font-semibold text-red-100">
                  Prazo de Inscrições Encerrado ontem, 18/10/2026 às 23h59
                </span>
              </div>
            </div>
          </div>

          {/* Corpo do Aviso Oficial */}
          <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-white to-amber-50/20">
            {/* Mensagem Institucional Solene */}
            <div className="bg-amber-500/10 border-l-4 border-amber-600 rounded-r-xl p-4 sm:p-5 flex items-start gap-4">
              <div className="bg-amber-600/10 text-amber-700 p-2.5 rounded-xl shrink-0 mt-0.5">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Inscrições Encerradas • Etapa de Análise, Habilitação e Julgamento Técnico
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed text-justify sm:text-left">
                  Conforme estipulado no <strong>Edital nº 88/2026</strong> e no cronograma oficial da 10ª Edição, 
                  o prazo para submissão e alteração de fichas de inscrição <strong>encerrou-se pontualmente no dia 18 de outubro de 2026</strong>. 
                  Sendo assim, o formulário de cadastro público de novas inscrições encontra-se <strong>desabilitado</strong>.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed pt-1">
                  O certame avança agora com a <strong>divulgação da relação provisória das inscrições deferidas e indeferidas (21/10/2026)</strong>,{' '}
                  seguida do <strong>prazo para pedido de reconsideração (22 a 26/10/2026)</strong>,{' '}
                  <strong>divulgação da relação definitiva das inscrições habilitadas (29/10/2026)</strong> e{' '}
                  <strong>julgamento técnico pela Comissão Julgadora (29/10 a 09/11/2026)</strong>.
                </p>
              </div>
            </div>

            {/* Destaque da Fase: Julgamento Técnico */}
            <div className="border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 via-white to-primary/5 rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-yellow-500/20 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl shadow-md">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Julgamento Técnico</span>
                      <Badge variant="outline" className="bg-yellow-500/15 text-yellow-800 border-yellow-400 text-[10px] font-bold px-2 py-0.5">
                        29/10 a 09/11/2026
                      </Badge>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Critérios de Avaliação da Comissão Julgadora (Item 4 do Edital)
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-700 font-medium shadow-xs self-start md:self-auto">
                  <CalendarClock className="w-4 h-4 text-primary" />
                  <span>Período de Julgamento: <strong>29/10/2026 a 09/11/2026</strong></span>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <p className="text-sm text-gray-700 leading-relaxed text-justify sm:text-left">
                  Conforme o <strong>Item 4.1 do Edital nº 88/2026</strong>, as práticas e os projetos habilitados nas categorias 
                  <strong> Atuação Finalística</strong> e <strong>Atuação Estruturante</strong> serão avaliados pela Comissão Julgadora segundo 
                  <strong> 5 critérios de igual valor</strong> (sem diferenciação de pesos).
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-primary font-medium bg-amber-500/10 border border-amber-300/60 rounded-xl px-4 py-2.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Itens 4.2 e 4.3 do Edital:</strong> Cada critério receberá pontuação inteira de <strong>0 a 5 pontos</strong>. A pontuação máxima atribuível por integrante da Comissão Julgadora é de <strong>25 (vinte e cinco) pontos</strong>.
                  </span>
                </div>
              </div>

              {/* Grid dos 5 Critérios de Avaliação (Item 4.1) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
                {criteriosAvaliacao.map((criterio, idx) => {
                  const Icon = criterio.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-white/95 border border-gray-200/90 rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-yellow-400 transition-all duration-200 group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {criterio.num}
                            </span>
                            <div className="p-1.5 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold text-amber-800 bg-amber-50 border-amber-300">
                            {criterio.pontos}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 mb-1.5 leading-snug">
                          {criterio.title}
                        </h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed text-justify sm:text-left">
                          {criterio.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Escala Oficial de Pontuação (Item 4.2 do Edital) */}
              <div className="bg-white/90 border border-gray-200 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Escala Oficial de Pontuação por Critério (Item 4.2)
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Critérios com pesos iguais (0 a 5 pts cada)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {escalaPontuacao.map((escala, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex flex-col justify-between">
                      <span className="text-xs font-extrabold text-primary mb-1">
                        {escala.ponto}
                      </span>
                      <span className="text-[10px] text-gray-600 leading-tight">
                        {escala.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-600 gap-1">
                  <span><strong>Nota Técnica:</strong> Média aritmética das notas válidas da Comissão Julgadora (Item 8.2) convertida para escala 0 a 100 (Item 8.3).</span>
                  <span className="font-semibold text-primary">Composição Final: 80% Técnica + 20% Voto Popular (Item 8.1)</span>
                </div>
              </div>
            </div>

            {/* Linha do Tempo do Cronograma */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-primary" />
                    Cronograma Oficial das Próximas Etapas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Acompanhe o andamento das fases do certame até a grande cerimônia comemorativa.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {timelineSteps.map((item, idx) => {
                  const isCompleted = item.status === 'completed';
                  const isHighlight = item.status === 'active_highlight';
                  const isActive = item.status === 'active';

                  return (
                    <div 
                      key={idx}
                      className={`relative rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                        isHighlight 
                          ? 'bg-gradient-to-br from-yellow-50 to-amber-50/50 border-yellow-500 shadow-md ring-2 ring-yellow-400/30' 
                          : isActive 
                            ? 'bg-blue-50/60 border-blue-300 shadow-xs'
                            : isCompleted
                              ? 'bg-gray-50/80 border-gray-200 text-gray-600'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                            isHighlight 
                              ? 'bg-yellow-500 text-primary-dark font-extrabold'
                              : isCompleted 
                                ? 'bg-gray-200 text-gray-700' 
                                : 'bg-primary/10 text-primary'
                          }`}>
                            ETAPA {item.step}
                          </span>

                          <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                            isCompleted 
                              ? 'text-emerald-700' 
                              : isHighlight 
                                ? 'text-amber-800 font-bold animate-pulse' 
                                : 'text-gray-500'
                          }`}>
                            {isCompleted && <Check className="w-3 h-3 text-emerald-600" />}
                            {item.statusLabel}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug">
                          {item.title}
                        </h4>
                        <div className="text-xs font-semibold text-primary mb-2">
                          {item.period}
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ações Rápidas & Canais de Acesso */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                Acessos Rápidos & Canais de Informação
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Área do Proponente */}
                <Card className="hover:shadow-md transition-all border-primary/20 hover:border-primary group bg-white">
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">
                        Área do Proponente
                      </h4>
                      <p className="text-xs text-gray-600 leading-snug">
                        Acesse sua conta para consultar suas práticas já submetidas e o protocolo.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/login')}
                      className="w-full text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50 justify-between"
                    >
                      <span>Acessar Práticas</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Card 2: Comissão Julgadora */}
                <Card className="hover:shadow-md transition-all border-yellow-500/30 hover:border-yellow-500 group bg-white">
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                        <Scale className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">
                        Portal dos Jurados
                      </h4>
                      <p className="text-xs text-gray-600 leading-snug">
                        Acesso exclusivo para membros da Comissão Julgadora realizarem avaliações.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/admin/login')}
                      className="w-full text-xs font-semibold text-amber-800 border-amber-300 hover:bg-amber-50 justify-between"
                    >
                      <span>Entrar no Painel</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Card 3: Regulamento Oficial */}
                <Card className="hover:shadow-md transition-all border-gray-200 hover:border-gray-400 group bg-white">
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                        <ScrollText className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">
                        Regulamento Oficial
                      </h4>
                      <p className="text-xs text-gray-600 leading-snug">
                        Consulte os 5 critérios avaliativos (0 a 5 pontos), escala oficial, categorias e regras do Edital nº 88/2026.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsRegulamentoOpen(true)}
                      className="w-full text-xs font-semibold text-emerald-800 border-emerald-200 hover:bg-emerald-50 justify-between"
                    >
                      <span>Ver Edital</span>
                      <FileSearch className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Card 4: Votação Popular */}
                <Card className="hover:shadow-md transition-all border-gray-200 hover:border-gray-400 group bg-white">
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                        <Vote className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">
                        Votação Popular
                      </h4>
                      <p className="text-xs text-gray-600 leading-snug">
                        Aberta a todos os servidores e membros do MPPI de 12 a 23 de novembro de 2026.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/voto-popular')}
                      className="w-full text-xs font-semibold text-purple-700 border-purple-200 hover:bg-purple-50 justify-between"
                    >
                      <span>Conhecer Etapa</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mensagem de Reconhecimento Institucional */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Agradecimento Institucional da Procuradoria-Geral de Justiça</span>
                </div>
                <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                  A Comissão Organizadora agradece a todos os membros, servidores e estagiários que submeteram suas propostas. 
                  A participação de cada unidade consolida uma cultura de excelência e inovação contínua no Ministério Público do Estado do Piauí.
                </p>
              </div>

              <div className="shrink-0 text-center sm:text-right">
                <span className="text-[11px] text-gray-400 block">Dúvidas ou Suporte:</span>
                <a 
                  href="mailto:planejamento@mppi.mp.br" 
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  planejamento@mppi.mp.br
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé da Página */}
        <footer className="text-center text-xs text-gray-500 space-y-2 pb-6">
          <p>© 2026 Ministério Público do Estado do Piauí — Todos os direitos reservados.</p>
          <p className="text-[11px] text-gray-400">
            Subprocuradoria-Geral de Justiça Institucional • Secretaria de Planejamento e Gestão (SECPLAN)
          </p>
        </footer>
      </main>

      {/* Modal / Dialog do Regulamento Oficial */}
      <Dialog open={isRegulamentoOpen} onOpenChange={setIsRegulamentoOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <ScrollText className="w-4 h-4" />
              Edital nº 88/2026 • Regulamento do Prêmio
            </div>
            <DialogTitle className="text-xl font-bold">
              10ª Edição do Prêmio Melhores Práticas do MPPI
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Normas, categorias e critérios de avaliação do certame
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">1. DO OBJETO</h4>
              <p>
                O Prêmio Melhores Práticas do Ministério Público do Estado do Piauí visa identificar, reconhecer, 
                premiar e disseminar iniciativas inovadoras e resolutivas desenvolvidas por membros e servidores 
                no exercício de suas funções.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">2. DAS CATEGORIAS</h4>
              <p className="mb-1">O Prêmio é composto por duas áreas de atuação institucional:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Área Finalística:</strong> Iniciativas voltadas diretamente à atividade-fim do MPPI (Defesa dos direitos difusos, coletivos, tutela penal, infância, cidadania, etc.).</li>
                <li><strong>Área Estruturante:</strong> Iniciativas voltadas ao aprimoramento da gestão administrativa, governança, tecnologia da informação, comunicação e suporte institucional.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">3. MODALIDADES</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Prática:</strong> Ação ou conjunto de ações já executadas com resultados comprovados e mensuráveis.</li>
                <li><strong>Projeto:</strong> Proposta estruturada formalizada ou institucionalizada que apresenta metodologia com metas e etapas.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">4. DOS CRITÉRIOS DE AVALIAÇÃO</h4>
              <p className="mb-2 text-gray-700">
                4.1 Conforme o Edital nº 88/2026, as práticas e os projetos serão avaliados de acordo com os seguintes critérios (todos de igual valor, sem diferenciação de pesos):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3 text-gray-700">
                <li><strong>I — cooperação:</strong> grau de articulação e de colaboração entre unidades do MPPI, instituições parceiras ou organizações da sociedade civil;</li>
                <li><strong>II — inovação:</strong> adoção de solução, método, processo, ferramenta ou forma de atuação nova ou significativamente aperfeiçoada, capaz de produzir ganho de qualidade, eficiência ou desempenho;</li>
                <li><strong>III — resolutividade:</strong> capacidade da iniciativa de solucionar, prevenir, reduzir ou enfrentar de maneira concreta o problema que motivou sua implementação;</li>
                <li><strong>IV — impacto social ou institucional:</strong> dimensão, relevância e profundidade das mudanças produzidas para a sociedade, para o público beneficiado ou para o funcionamento da Instituição; e</li>
                <li><strong>V — replicabilidade:</strong> possibilidade de a iniciativa ser reaplicada ou adaptada em outras unidades, áreas ou contextos institucionais, considerando sua viabilidade prática e seu potencial de produzir resultados semelhantes.</li>
              </ul>
              <p className="mb-1 text-gray-700 font-medium">
                4.2 Cada critério receberá pontuação inteira de 0 (zero) a 5 (cinco), de acordo com a seguinte escala:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-gray-600 mb-2">
                <li><strong>0 ponto:</strong> critério não demonstrado;</li>
                <li><strong>1 ponto:</strong> atendimento incipiente;</li>
                <li><strong>2 pontos:</strong> atendimento parcial ou pouco consistente;</li>
                <li><strong>3 pontos:</strong> atendimento satisfatório;</li>
                <li><strong>4 pontos:</strong> atendimento relevante e bem demonstrado; e</li>
                <li><strong>5 pontos:</strong> atendimento excelente, amplamente demonstrado por dados, resultados ou evidências.</li>
              </ul>
              <p className="font-semibold text-primary pt-1">
                4.3 A pontuação máxima atribuível por integrante da Comissão Julgadora será de 25 (vinte e cinco) pontos.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">5. VOTAÇÃO POPULAR</h4>
              <p>
                Os 3 (três) trabalhos com maior média em cada categoria serão divulgados em <strong>11/11/2026</strong> como finalistas 
                e concorrerão ao voto dos membros e servidores do MPPI no período de <strong>12/11 a 23/11/2026</strong>.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">6. CRONOGRAMA OFICIAL</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-gray-200 rounded">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-50"><td className="p-2 font-medium">04/09/2026</td><td className="p-2">Lançamento do Edital</td></tr>
                    <tr><td className="p-2 font-medium">08/09 a 18/10/2026</td><td className="p-2">Período de inscrições</td></tr>
                    <tr className="bg-gray-50"><td className="p-2 font-medium">21/10/2026</td><td className="p-2">Divulgação da relação provisória das inscrições deferidas e indeferidas</td></tr>
                    <tr><td className="p-2 font-medium">22/10 a 26/10/2026</td><td className="p-2">Prazo para pedido de reconsideração</td></tr>
                    <tr className="bg-gray-50"><td className="p-2 font-medium">29/10/2026</td><td className="p-2">Divulgação da relação definitiva das inscrições habilitadas</td></tr>
                    <tr><td className="p-2 font-medium">29/10 a 09/11/2026</td><td className="p-2">Julgamento técnico pela Comissão Julgadora</td></tr>
                    <tr className="bg-gray-50"><td className="p-2 font-medium">11/11/2026</td><td className="p-2">Divulgação dos finalistas</td></tr>
                    <tr><td className="p-2 font-medium">12/11 a 23/11/2026</td><td className="p-2">Votação popular</td></tr>
                    <tr className="bg-gray-50"><td className="p-2 font-medium">Dezembro de 2026</td><td className="p-2">Cerimônia de premiação</td></tr>
                    <tr><td className="p-2 font-medium">Após a cerimônia</td><td className="p-2">Publicação e homologação do resultado final</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsRegulamentoOpen(false)}
              >
                Fechar Regulamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InscricoesEncerradas;
