import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Scale, 
  ScrollText, 
  Users, 
  Vote, 
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Mail,
  Sparkles,
  Target,
  TrendingUp,
  Compass,
  FileCheck,
  Info,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { calcularCertameStatus } from '@/utils/cronogramaEtapas';
import { getCronogramaParametros } from '@/lib/supabaseService';

const AreaProponente: React.FC = () => {
  const navigate = useNavigate();
  const [isRegulamentoOpen, setIsRegulamentoOpen] = useState(false);
  const [certameStatus, setCertameStatus] = useState(() => calcularCertameStatus());

  useEffect(() => {
    let isMounted = true;
    getCronogramaParametros().then((params) => {
      if (isMounted && Object.keys(params).length > 0) {
        setCertameStatus(calcularCertameStatus(new Date(), params));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);


  const criterios = [
    {
      num: 'I',
      icon: Users,
      titulo: 'Cooperação',
      pontos: '0 a 5 pts',
      desc: 'Grau de articulação e colaboração entre unidades do MPPI, órgãos parceiros e sociedade civil.',
    },
    {
      num: 'II',
      icon: Sparkles,
      titulo: 'Inovação',
      pontos: '0 a 5 pts',
      desc: 'Adoção de solução, método ou ferramenta nova ou aperfeiçoada que gere ganho de qualidade ou eficiência.',
    },
    {
      num: 'III',
      icon: Target,
      titulo: 'Resolutividade',
      pontos: '0 a 5 pts',
      desc: 'Capacidade concreta de solucionar, prevenir ou reduzir o problema que motivou a implementação.',
    },
    {
      num: 'IV',
      icon: TrendingUp,
      titulo: 'Impacto Social ou Institucional',
      pontos: '0 a 5 pts',
      desc: 'Profundidade e relevância das transformações produzidas para a sociedade ou para o funcionamento do MPPI.',
    },
    {
      num: 'V',
      icon: Compass,
      titulo: 'Replicabilidade',
      pontos: '0 a 5 pts',
      desc: 'Viabilidade e facilidade de a iniciativa ser reaplicada ou adaptada por outras unidades ou comarcas.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-foreground">
      {/* Topo Institucional */}
      <header className="w-full border-b border-black/15 bg-white/95 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-mppi.png" 
              alt="Brasão MPPI" 
              className="h-9 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/favicon.ico';
              }}
            />
            <div className="border-l border-black/20 pl-3">
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
              onClick={() => navigate('/')}
              className="text-xs h-9 border-black/20 hover:border-black/40 text-gray-800 font-medium rounded-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Início
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/admin/login')}
              className="text-xs h-9 bg-primary hover:bg-primary-dark text-white font-medium rounded-xs border border-black/20 shadow-xs"
            >
              <Scale className="w-3.5 h-3.5 mr-1.5" />
              Portal dos Jurados
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 flex-1">
        {/* Banner Hero */}
        <div className="rounded-xs border border-black/20 bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-black/30 border border-white/20 text-yellow-300 text-xs font-semibold mb-3">
              <FileCheck className="w-3.5 h-3.5 text-yellow-400" />
              <span>PAINEL PÚBLICO DO PROPONENTE • EDITAL Nº 88/2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Acompanhamento da Seleção e Julgamento
            </h1>
            <p className="text-sm text-yellow-100/90 max-w-3xl font-normal leading-relaxed">
              Consulte as diretrizes oficiais de habilitação, o cronograma das fases avaliativas, 
              os critérios técnicos de pontuação e as instruções para recursos do Prêmio Melhores Práticas do MPPI.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                onClick={() => setIsRegulamentoOpen(true)}
                className="bg-white text-gray-950 border border-black/30 hover:bg-gray-100 text-xs font-semibold rounded-xs shadow-xs"
              >
                <ScrollText className="w-4 h-4 mr-1.5" />
                Consultar Regulamento Completo
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/voto-popular')}
                className="bg-black/35 text-white border border-white/50 hover:bg-black/55 hover:border-white text-xs font-medium rounded-xs shadow-xs"
              >
                <Vote className="w-4 h-4 mr-1.5 text-yellow-300" />
                Informações da Votação Popular
              </Button>
            </div>
          </div>
        </div>

        {/* Quadro Informativo de Status */}
        <div className="bg-amber-50/70 border border-black/15 rounded-xs p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/15 border border-black/10 text-amber-900 rounded-xs shrink-0 mt-0.5">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Fase Atual do Certame
                </span>
                <Badge className="bg-amber-600 text-white border border-black/20 text-[10px] font-bold rounded-xs">
                  {certameStatus.bannerBadge}
                </Badge>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-white/90 border border-black/10 px-2 py-0.5 rounded-xs shadow-2xs">
                  <Calendar className="w-3 h-3 text-primary" />
                  Hoje: {certameStatus.dataHojeFormatada}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">
                {certameStatus.bannerTitulo}
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed max-w-3xl mt-1">
                {certameStatus.bannerDescricao}
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white rounded-xs p-3.5 border border-black/15 text-xs space-y-1 w-full md:w-auto shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500 block uppercase">Próximo Marco:</span>
            <span className="font-bold text-primary block text-sm">{certameStatus.proximoMarcoData}</span>
            <span className="text-gray-600 block text-[11px] max-w-[220px]">{certameStatus.proximoMarcoDesc}</span>
          </div>
        </div>

        {/* Bloco 1: Linha do Tempo e Etapas da Seleção */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                Etapas do Processo de Julgamento
              </h2>
              <p className="text-xs text-muted-foreground">
                Confira o cronograma oficial de todas as fases até o encerramento do certame.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {certameStatus.etapas.map((item, idx) => {
              const isDone = item.status === 'concluido';
              const isCurrent = item.status === 'em_andamento';

              return (
                <div 
                  key={idx}
                  className={`rounded-xs p-3.5 border transition-all duration-150 flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-amber-50/80 border-amber-600/50 shadow-xs ring-2 ring-amber-500/30'
                      : isDone
                        ? 'bg-slate-100/70 border-black/15 text-gray-600'
                        : 'bg-white border-black/15 hover:border-black/30 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs border border-black/10 ${
                        isCurrent
                          ? 'bg-amber-500 text-white font-extrabold shadow-2xs'
                          : isDone
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-primary/10 text-primary'
                      }`}>
                        ETAPA {item.etapa}
                      </span>
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                        isCurrent 
                          ? 'text-amber-900 font-bold bg-amber-100/80 px-2 py-0.5 rounded-xs border border-amber-300' 
                          : isDone 
                            ? 'text-emerald-700 font-medium' 
                            : 'text-gray-500'
                      }`}>
                        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {item.statusLabel}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 mb-1 leading-snug">
                      {item.titulo}
                    </h4>
                    <div className="text-xs font-semibold text-primary mb-1.5">
                      {item.periodo}
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

        {/* Bloco 2: Critérios do Julgamento Técnico */}
        <div className="border border-black/15 bg-white rounded-xs p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-black/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Item 4 do Edital nº 88/2026</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-900 border-black/15 text-[10px] rounded-xs font-semibold">
                  Pesos Iguais
                </Badge>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Critérios de Avaliação da Comissão Julgadora
              </h2>
              <p className="text-xs text-muted-foreground">
                Saiba como as práticas e projetos habilitados serão avaliados pelos jurados técnicos.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xs bg-amber-50 border border-black/15 text-xs text-amber-900 font-medium">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Pontuação Máxima por Jurado: <strong>25 pontos</strong> (5 pts por critério)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {criterios.map((crit, i) => {
              const Icon = crit.icon;
              return (
                <div key={i} className="bg-slate-50 border border-black/15 rounded-xs p-3.5 flex flex-col justify-between hover:border-black/30 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-xs border border-black/10">
                        {crit.num}
                      </span>
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-black/15 px-1.5 py-0.5 rounded-xs">
                        {crit.pontos}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1 rounded-xs bg-primary/10 text-primary border border-black/10">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 leading-snug">
                        {crit.titulo}
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {crit.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composição da Nota Final */}
          <div className="bg-amber-50/50 border border-black/15 rounded-xs p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-700">
            <div>
              <span className="font-bold text-gray-900 block mb-0.5">
                Cálculo da Nota Final (Item 8 do Edital):
              </span>
              <span>
                A nota dos jurados é convertida para escala 0 a 100 (Item 8.3). A média ponderada final é composta por <strong>80% Avaliação Técnica</strong> + <strong>20% Voto Popular</strong>.
              </span>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Badge className="bg-primary text-white text-xs px-2.5 py-0.5 rounded-xs border border-black/20">80% Comissão Julgadora</Badge>
              <Badge className="bg-purple-700 text-white text-xs px-2.5 py-0.5 rounded-xs border border-black/20">20% Voto Popular</Badge>
            </div>
          </div>
        </div>

        {/* Bloco 3: Orientações Gerais ao Proponente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Recursos e Reconsideração */}
          <Card className="border border-black/15 bg-white rounded-xs shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                Pedido de Reconsideração (Recurso)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2.5 text-xs text-gray-600 leading-relaxed">
              <p>
                Após a divulgação da relação provisória em <strong>21/10/2026</strong>, caso alguma inscrição conste como indeferida por inconformidade formal, 
                o autor poderá apresentar pedido de reconsideração devidamente fundamentado.
              </p>
              {certameStatus.recursoStatus === 'encerrado' ? (
                <div className="bg-slate-100 border border-black/15 rounded-xs p-2.5 text-gray-700 flex items-center justify-between">
                  <span><strong>Prazo Regulamentar:</strong> 22/10 a 26/10/2026</span>
                  <Badge variant="outline" className="text-[10px] bg-gray-200 text-gray-700 border-black/20 font-bold">
                    Encerrado em 26/10
                  </Badge>
                </div>
              ) : certameStatus.recursoStatus === 'aberto' ? (
                <div className="bg-amber-50 border border-amber-300 rounded-xs p-2.5 text-amber-900 flex items-center justify-between">
                  <span><strong>Prazo Regulamentar:</strong> 22/10 a 26/10/2026</span>
                  <Badge className="text-[10px] bg-amber-600 text-white font-bold">
                    Prazo Aberto
                  </Badge>
                </div>
              ) : (
                <div className="bg-slate-50 border border-black/15 rounded-xs p-2.5 text-gray-600">
                  <strong>Prazo Regulamentar:</strong> de 22/10 a 26/10/2026
                </div>
              )}
              <p>
                Os pedidos deverão ser encaminhados ao canal oficial da comissão com a indicação expressa do número do protocolo e esclarecimentos sobre os requisitos apontados.
              </p>
            </CardContent>
          </Card>

          {/* Card: Como acompanhar e contatos */}
          <Card className="border border-black/15 bg-white rounded-xs shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900">
                <Mail className="w-4 h-4 text-primary" />
                Canal de Dúvidas e Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2.5 text-xs text-gray-600 leading-relaxed">
              <p>
                Como as inscrições foram recebidas diretamente por formulário público sem necessidade de criação prévia de conta no sistema, 
                o comprovante emitido na submissão é seu protocolo de garantia.
              </p>
              <div className="bg-slate-50 border border-black/15 rounded-xs p-2.5 space-y-0.5">
                <span className="font-bold text-gray-900 block text-xs">Assessoria de Planejamento e Gestão (ASSESPPLAGES)</span>
                <span className="text-gray-600 block text-[11px]">Procuradoria-Geral de Justiça do MPPI</span>
                <div className="pt-1 flex items-center gap-1.5 text-primary font-semibold text-xs">
                  <Mail className="w-3.5 h-3.5" />
                  <a href="mailto:planejamento@mppi.mp.br" className="hover:underline">
                    planejamento@mppi.mp.br
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                Todas as relações preliminares e definitivas serão publicadas no Diário Oficial e atualizadas nesta plataforma.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Rodapé da Página */}
      <footer className="text-center text-xs text-gray-500 space-y-1.5 py-5 border-t border-black/15 bg-white">
        <p className="font-medium text-gray-700">
          © 2026 Ministério Público do Estado do Piauí — Todos os direitos reservados.
        </p>
        <p className="text-[11px] text-gray-500">
          Procuradoria-Geral de Justiça • Assessoria de Planejamento e Gestão (ASSESPPLAGES)
        </p>
      </footer>

      {/* Modal / Dialog do Regulamento Oficial */}
      <Dialog open={isRegulamentoOpen} onOpenChange={setIsRegulamentoOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-xs border border-black/25">
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

          <div className="space-y-4 text-xs text-gray-700 leading-relaxed pt-2 border-t border-black/10">
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

            <div className="pt-2 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsRegulamentoOpen(false)}
                className="rounded-xs border-black/20"
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

export default AreaProponente;
