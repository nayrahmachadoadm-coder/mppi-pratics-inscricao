import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Scale, 
  ScrollText, 
  Users, 
  Vote, 
  FileSearch,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const InscricoesEncerradas: React.FC = () => {
  const navigate = useNavigate();
  const [isRegulamentoOpen, setIsRegulamentoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-foreground">
      {/* Topo Institucional */}
      <header className="w-full border-b border-black/15 bg-white/95 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
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
              onClick={() => navigate('/proponente')}
              className="text-xs h-9 border-black/20 hover:border-black/40 text-gray-800 font-medium rounded-xs"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Área do Proponente
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/admin/login')}
              className="text-xs h-9 bg-primary hover:bg-primary-dark text-white font-medium rounded-xs border border-black/20 shadow-xs"
            >
              <Scale className="w-3.5 h-3.5 mr-1.5" />
              Comissão Julgadora
            </Button>
          </div>
        </div>
      </header>

      {/* Container Principal */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 flex-1">
        {/* Cabeçalho Hero com Título e Frase Inspiradora */}
        <div className="rounded-xs border border-black/20 bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white p-6 sm:p-10 text-center shadow-xs">
          <div className="flex flex-col items-center">
            {/* Badge comemorativo dos 10 anos */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-black/30 border border-white/20 text-yellow-300 text-xs font-semibold mb-3">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>10ª EDIÇÃO COMEMORATIVA • 10 ANOS DE BOAS PRÁTICAS</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3 max-w-3xl leading-tight">
              Prêmio Melhores Práticas do MPPI
            </h1>

            {/* Frase Inspiradora */}
            <p className="text-sm sm:text-base text-yellow-100/90 max-w-2xl font-normal leading-relaxed">
              Reconhecendo o talento, a inovação e o compromisso resolutivo dos membros e servidores na transformação social do Piauí.
            </p>
          </div>
        </div>

        {/* Seção Acessos Rápidos & Canais de Informação */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-black/15">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Acessos Rápidos & Canais de Informação
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Área do Proponente */}
            <Card className="hover:border-black/35 transition-all duration-150 border border-black/15 group bg-white shadow-2xs">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-xs bg-blue-50 border border-black/10 text-blue-700 flex items-center justify-center mb-2.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Área do Proponente
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Acompanhe as fases de seleção, critérios do julgamento técnico e orientações do certame.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/proponente')}
                  className="w-full text-xs font-semibold text-gray-900 border-black/20 hover:border-black/40 hover:bg-slate-50 justify-between mt-auto rounded-xs"
                >
                  <span>Acompanhar Processo</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Comissão Julgadora */}
            <Card className="hover:border-black/35 transition-all duration-150 border border-black/15 group bg-white shadow-2xs">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-xs bg-amber-50 border border-black/10 text-amber-700 flex items-center justify-center mb-2.5">
                    <Scale className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Portal dos Jurados
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Acesso exclusivo para membros da Comissão Julgadora realizarem avaliações.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/admin/login')}
                  className="w-full text-xs font-semibold text-gray-900 border-black/20 hover:border-black/40 hover:bg-slate-50 justify-between mt-auto rounded-xs"
                >
                  <span>Entrar no Painel</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Regulamento Oficial */}
            <Card className="hover:border-black/35 transition-all duration-150 border border-black/15 group bg-white shadow-2xs">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-xs bg-emerald-50 border border-black/10 text-emerald-700 flex items-center justify-center mb-2.5">
                    <ScrollText className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Regulamento Oficial
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Consulte os critérios avaliativos, categorias e regras do Edital nº 88/2026.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsRegulamentoOpen(true)}
                  className="w-full text-xs font-semibold text-gray-900 border-black/20 hover:border-black/40 hover:bg-slate-50 justify-between mt-auto rounded-xs"
                >
                  <span>Ver Edital</span>
                  <FileSearch className="w-3.5 h-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Card 4: Votação Popular */}
            <Card className="hover:border-black/35 transition-all duration-150 border border-black/15 group bg-white shadow-2xs">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-xs bg-purple-50 border border-black/10 text-purple-700 flex items-center justify-center mb-2.5">
                    <Vote className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Votação Popular
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Aberta a todos os servidores e membros do MPPI para eleger os destaques.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/voto-popular')}
                  className="w-full text-xs font-semibold text-gray-900 border-black/20 hover:border-black/40 hover:bg-slate-50 justify-between mt-auto rounded-xs"
                >
                  <span>Conhecer Etapa</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
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

export default InscricoesEncerradas;
