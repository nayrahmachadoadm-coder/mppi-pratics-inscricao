import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Printer,
  Scale,
  ArrowLeft,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  Calendar,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  FileText,
  Bookmark,
  ChevronRight,
  ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  MANUAL_JURADO_METADATA,
  MANUAL_SECTIONS,
  ManualSection
} from '@/data/manualJuradoContent';
import { exportManualJuradoPdf } from '@/lib/pdfManualJurado';
import { useToast } from '@/hooks/use-toast';

interface ManualJuradoViewerProps {
  onBackToHome?: () => void;
  showBackHomeButton?: boolean;
}

const sectionIcons: Record<string, React.ElementType> = {
  'boas-vindas': Award,
  'comissao-instituicoes': Users,
  'presidente-comissao': ShieldCheck,
  'contribuicao-jurados': Sparkles,
  'cronograma-prazos': Calendar,
  'formas-acesso-seguranca': FileCheck2,
  'rito-julgamento-etica': Scale,
  'passo-a-passo-sistema': BookOpen,
  'analise-anexos-ficha': FileText,
  'criterios-avaliacao': CheckCircle2,
  'regras-pontuacao-calculo': Bookmark,
  'canais-apoio': HelpCircle,
};

export const ManualJuradoViewer: React.FC<ManualJuradoViewerProps> = ({
  onBackToHome,
  showBackHomeButton = true,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      toast({
        title: 'Gerando PDF Oficial...',
        description: 'Aguarde enquanto o documento é diagramado e baixado.',
      });
      await exportManualJuradoPdf();
      toast({
        title: 'Download concluído!',
        description: 'O Manual do Jurado foi salvo com sucesso no seu dispositivo.',
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o arquivo. Tente novamente ou use a opção Imprimir.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 print:p-0 print:m-0 print:max-w-none">
      {/* Barra Superior de Ações e Navegação */}
      <div className="bg-white/95 border border-black/15 rounded-xs p-4 shadow-2xs sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md print:hidden">
        <div className="flex items-center gap-2">
          {showBackHomeButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToHome || (() => navigate('/admin'))}
              className="text-xs h-9 border-black/20 hover:border-black/40 text-gray-800 rounded-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Início / Boas-Vindas
            </Button>
          )}
          <div className="hidden sm:block border-l border-black/15 h-5 ml-1 pl-3">
            <span className="text-xs font-bold text-gray-800 block">
              Manual do Jurado • Edital nº 88/2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="text-xs h-9 bg-primary hover:bg-primary-dark text-white font-medium rounded-xs shadow-xs border border-black/20"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isExporting ? 'Gerando PDF...' : 'Baixar Manual em PDF'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-9 border-black/20 hover:border-black/40 text-gray-800 rounded-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Imprimir
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/admin/julgamento')}
            className="text-xs h-9 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-xs shadow-xs"
          >
            <Scale className="w-3.5 h-3.5 mr-1.5 text-yellow-300" />
            Ir para Julgamento
          </Button>
        </div>
      </div>

      {/* Capa Oficial no Documento */}
      <section className="rounded-xs border border-black/20 bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white p-8 sm:p-12 shadow-sm text-center relative overflow-hidden print:border-none print:bg-white print:text-black">
        <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
          <img
            src="/logo-mppi.png"
            alt="Brasão MPPI"
            className="h-16 w-auto object-contain mb-4 filter drop-shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/favicon.ico';
            }}
          />

          <span className="text-xs font-bold tracking-widest text-yellow-400 uppercase mb-1">
            Ministério Público do Estado do Piauí
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            MANUAL OFICIAL DO JURADO
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-black/35 border border-white/20 text-yellow-300 text-xs font-semibold my-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>10ª EDIÇÃO COMEMORATIVA • 10 ANOS DE BOAS PRÁTICAS</span>
          </div>

          <p className="text-sm sm:text-base text-yellow-100/90 font-normal mt-2 leading-relaxed max-w-2xl">
            Guia técnico de diretrizes, avaliação criteriosa e julgamento das iniciativas inscritas no certame, conforme as normas do Edital nº 88/2026 — PGJ/PI.
          </p>

          <div className="mt-6 pt-5 border-t border-white/15 w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-yellow-200/80 gap-2">
            <span>Comissão Julgadora Oficial • ASSESPPLAGES</span>
            <span>Período de Julgamento: <strong>29/10 a 09/11/2026</strong></span>
            <span>Teresina - PI, 2026</span>
          </div>
        </div>
      </section>

      {/* Sumário Clicável Interativo */}
      <section className="bg-white border border-black/15 rounded-xs p-6 shadow-2xs space-y-4 print:hidden">
        <div className="border-b border-black/10 pb-3">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4 text-primary" />
            Navegação Rápida
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Sumário Clicável do Manual
          </h2>
          <p className="text-xs text-muted-foreground">
            Clique em qualquer tópico para deslizar diretamente para a seção correspondente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {MANUAL_SECTIONS.map((sec) => {
            const Icon = sectionIcons[sec.id] || BookOpen;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className="flex items-start gap-2.5 p-3 rounded-xs border border-black/10 hover:border-black/30 hover:bg-slate-50 transition-all text-left group bg-white shadow-3xs"
              >
                <div className="p-1.5 rounded-xs bg-primary/10 text-primary border border-black/10 shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-gray-500">
                      SEÇÃO {sec.numero}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 leading-snug truncate">
                    {sec.titulo}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Conteúdo Completo das Seções */}
      <div className="space-y-6">
        {MANUAL_SECTIONS.map((sec) => {
          const Icon = sectionIcons[sec.id] || BookOpen;

          return (
            <section
              key={sec.id}
              id={sec.id}
              className="bg-white border border-black/15 rounded-xs p-6 sm:p-8 shadow-2xs space-y-5 scroll-mt-32"
            >
              {/* Cabeçalho da Seção */}
              <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xs bg-primary text-white shrink-0 mt-0.5 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider block">
                      SEÇÃO {sec.numero}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                      {sec.titulo}
                    </h2>
                    {sec.resumo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {sec.resumo}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToTop}
                  className="text-gray-500 hover:text-gray-900 text-xs shrink-0 print:hidden"
                  title="Voltar ao Sumário"
                >
                  <ArrowUp className="w-3.5 h-3.5 mr-1" />
                  Topo
                </Button>
              </div>

              {/* Subseções e Parágrafos */}
              {sec.subsecoes && (
                <div className="space-y-4">
                  {sec.subsecoes.map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      <h3 className="text-sm font-bold text-gray-900">
                        {sub.titulo}
                      </h3>
                      <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                        {sub.conteudo.map((p, pIdx) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                      </div>

                      {/* Caixa de Destaque */}
                      {sub.destaque && (
                        <div className="bg-amber-50/80 border-l-4 border-amber-600 rounded-r-xs p-3.5 text-xs text-amber-950 my-3 space-y-0.5 shadow-3xs">
                          <span className="font-bold block uppercase tracking-wider text-[10px] text-amber-900">
                            Ponto de Atenção:
                          </span>
                          <p className="font-medium">{sub.destaque}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tabela de Dados (se houver) */}
              {sec.tabela && (
                <div className="border border-black/15 rounded-xs overflow-x-auto shadow-3xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-black/15 font-bold text-gray-900">
                      <tr>
                        {sec.tabela.cabecalhos.map((h, hIdx) => (
                          <th key={hIdx} className="p-2.5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {sec.tabela.linhas.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`p-2.5 text-gray-700 ${
                                cIdx === 0 ? 'font-semibold text-gray-900' : ''
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Rodapé do Manual */}
      <footer className="text-center text-xs text-gray-500 space-y-1.5 py-8 border-t border-black/15 bg-white rounded-xs">
        <p className="font-semibold text-gray-700">
          Comissão Julgadora Oficial • 10ª Edição do Prêmio Melhores Práticas do MPPI
        </p>
        <p className="text-[11px] text-gray-500">
          Assessoria de Planejamento e Gestão (ASSESPPLAGES) • Procuradoria-Geral de Justiça do Estado do Piauí
        </p>
        <p className="text-[11px] text-gray-400">
          Edital nº 88/2026 — Documento atualizado em Outubro de 2026
        </p>
      </footer>
    </div>
  );
};

export default ManualJuradoViewer;
