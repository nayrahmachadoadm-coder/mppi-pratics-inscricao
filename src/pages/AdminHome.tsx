import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Scale,
  Calendar,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import { exportManualJuradoPdf } from '@/lib/pdfManualJurado';
import { ManualJuradoViewer } from '@/components/ManualJuradoViewer';
import { useToast } from '@/hooks/use-toast';

const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>('');
  const [isJurado, setIsJurado] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getCurrentProfile();
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
        const jurado = await hasRole('jurado');
        setIsJurado(jurado);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      }
    };
    loadProfile();
  }, []);

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
        description: 'Não foi possível gerar o arquivo. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const scrollToManual = () => {
    const el = document.getElementById('manual-jurado-conteudo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Seção Superior de Boas-Vindas — Visual Limpo, Sóbrio e Institucional */}
      <section className="bg-gradient-to-b from-white via-slate-50/70 to-slate-100/60 border-b border-black/10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header e Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="bg-[#70151E] hover:bg-[#581018] text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs">
              10ª Edição • Prêmio Melhores Práticas MPPI
            </Badge>
            <Badge variant="outline" className="border-amber-600/40 text-amber-900 bg-amber-50/70 text-[11px] font-semibold px-3 py-1 rounded-full">
              Comissão Julgadora Oficial
            </Badge>
            <Badge variant="outline" className="border-black/15 text-slate-600 bg-white text-[11px] font-medium px-2.5 py-1 rounded-full">
              Edital nº 88/2026 — PGJ/PI
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {userName
                ? `Prezado(a) ${userName}, seja bem-vindo(a)!`
                : 'Bem-vindo(a) à Área da Comissão Julgadora'}
            </h1>

            {/* Mensagem Curta e Objetiva */}
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Sua atuação criteriosa, técnica e imparcial é fundamental para o reconhecimento das iniciativas mais inovadoras e transformadoras do Ministério Público do Estado do Piauí. Disponibilizamos abaixo o <strong className="text-slate-900 font-semibold">Manual Oficial do Jurado</strong>, contendo todas as orientações metodológicas, critérios e prazos regulamentares para o exercício da sua nobre função.
            </p>
          </div>

          {/* Destaques Rápidos e Sóbrios do Certame */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
            <div className="bg-white border border-black/10 rounded-xs p-4 shadow-3xs flex items-start gap-3">
              <div className="p-2 rounded-xs bg-amber-50 text-amber-800 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Período de Julgamento
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                  29/10/2026 a 09/11/2026
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Encerramento às 23h59min
                </span>
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-xs p-4 shadow-3xs flex items-start gap-3">
              <div className="p-2 rounded-xs bg-emerald-50 text-emerald-800 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Critérios Oficiais (Item 4)
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                  5 Critérios de Pesos Iguais
                </span>
                <span className="text-[11px] text-slate-500 block">
                  0 a 5 pontos por critério (até 25 pts)
                </span>
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-xs p-4 shadow-3xs flex items-start gap-3">
              <div className="p-2 rounded-xs bg-[#70151E]/10 text-[#70151E] shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Composição da Nota
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                  80% Júri + 20% Voto Popular
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Top 3 por categoria seguem à final
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Ações Diretas */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="bg-[#70151E] hover:bg-[#581018] text-white shadow-xs font-semibold text-xs sm:text-sm h-10 px-4 rounded-xs"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Diagramando PDF...' : 'Baixar Manual do Jurado (PDF)'}
            </Button>

            <Button
              variant="outline"
              onClick={scrollToManual}
              className="border-black/20 hover:border-black/40 text-slate-800 bg-white shadow-3xs font-medium text-xs sm:text-sm h-10 px-4 rounded-xs"
            >
              <BookOpen className="w-4 h-4 mr-2 text-slate-600" />
              Ler Manual Online
            </Button>

            <Button
              onClick={() => navigate('/admin/julgamento')}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold text-xs sm:text-sm h-10 px-4 rounded-xs ml-auto"
            >
              <Scale className="w-4 h-4 mr-2" />
              Acessar Painel de Julgamento
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Conteúdo Completo do Manual do Jurado */}
      <main id="manual-jurado-conteudo" className="pb-16 pt-4">
        <ManualJuradoViewer showBackHomeButton={false} />
      </main>
    </div>
  );
};

export default AdminHome;