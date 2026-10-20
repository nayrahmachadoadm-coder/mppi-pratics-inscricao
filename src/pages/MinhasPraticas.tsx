import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  LogOut, 
  Eye, 
  Download, 
  Lock, 
  Scale, 
  CalendarClock, 
  Home, 
  Building2, 
  User, 
  CheckCircle2 
} from 'lucide-react';
import { getSession, logoutUser } from '@/lib/auth';
import { generatePDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const MinhasPraticas = () => {
  const [praticas, setPraticas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedPratica, setSelectedPratica] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const session = await getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }
    
    setUserName(session.user.user_metadata?.nome_completo || session.user.email);
    
    const { data, error } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setPraticas(data);
    }
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const handleViewDetails = (pratica: any) => {
    setSelectedPratica(pratica);
    setIsDetailsOpen(true);
  };

  const handleDownloadPDF = async (pratica: any) => {
    try {
      toast({
        title: 'Gerando PDF...',
        description: 'Preparando o comprovante da sua inscrição.',
      });
      await generatePDF(pratica);
      toast({
        title: 'Sucesso',
        description: 'Download do comprovante iniciado.',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o comprovante em PDF.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6 text-foreground">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Barra Superior */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl shadow-sm border border-border gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary tracking-wider uppercase">
                Área do Proponente • MPPI
              </span>
              <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-800 border-yellow-400 font-semibold">
                10ª Edição
              </Badge>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Minhas Inscrições</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Conectado como: <strong>{userName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="flex-1 sm:flex-initial text-xs h-9 border-gray-300"
            >
              <Home className="w-3.5 h-3.5 mr-1.5" /> Página Inicial
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="text-xs h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sair
            </Button>
          </div>
        </div>

        {/* Aviso Oficial de Encerramento e Julgamento */}
        <Alert className="bg-amber-500/10 border-amber-300/80 text-amber-950 rounded-2xl shadow-xs">
          <CalendarClock className="h-5 w-5 text-amber-700 mt-0.5" />
          <AlertTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
            Inscrições Encerradas em 18/10/2026 • Etapa de Julgamento Técnico em Andamento
          </AlertTitle>
          <AlertDescription className="text-xs text-amber-900/90 leading-relaxed mt-1">
            O prazo para novas inscrições e edição de trabalhos encerrou-se no dia <strong>18 de outubro de 2026</strong>. 
            O certame segue com a divulgação da relação provisória (21/10), prazo para pedidos de reconsideração (22 a 26/10), relação definitiva (29/10) e julgamento técnico pela Comissão Julgadora (<strong>29/10 a 09/11/2026</strong>). 
            A divulgação dos finalistas está prevista para o dia <strong>11/11/2026</strong>.
          </AlertDescription>
        </Alert>

        {/* Lista de Práticas */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-500 text-sm">Carregando suas práticas...</div>
        ) : praticas.length === 0 ? (
          <Card className="text-center py-16 bg-white border-dashed border-2">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <CardTitle className="text-lg text-gray-800 mb-1">Nenhuma inscrição vinculada a este login</CardTitle>
              <CardDescription className="text-xs text-gray-500 max-w-md mx-auto">
                O período de inscrições para a 10ª Edição do Prêmio Melhores Práticas encerrou-se em 18/10/2026. 
                Caso tenha submetido sua prática anonimamente ou via protocolo direto, consulte a Comissão Organizadora.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
                Iniciativas Registradas ({praticas.length})
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Dados selados para avaliação</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {praticas.map(pratica => (
                <Card key={pratica.id} className="hover:shadow-md transition-shadow bg-white border-gray-200 flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20">
                        {pratica.area_atuacao ? pratica.area_atuacao.replace('-', ' ').toUpperCase() : 'GERAL'}
                      </Badge>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {pratica.status_inscricao || 'Inscrita'}
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold text-gray-900 leading-snug">
                      {pratica.titulo_iniciativa}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      Inscrita em: {new Date(pratica.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2 border-t border-gray-100 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-xs h-9 text-gray-700 hover:text-primary" 
                      onClick={() => handleViewDetails(pratica)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> Visualizar Dados
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs h-9 text-emerald-700 border-emerald-200 hover:bg-emerald-50" 
                      onClick={() => handleDownloadPDF(pratica)}
                      title="Baixar Comprovante em PDF"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Visualização da Inscrição */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedPratica && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                  <FileText className="w-4 h-4" />
                  Comprovante de Inscrição • 10ª Edição
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {selectedPratica.titulo_iniciativa}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Área: {selectedPratica.area_atuacao} • Protocolo: {selectedPratica.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs text-gray-700">
                {/* Dados do Proponente */}
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Identificação do Proponente
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 block text-[11px]">Nome Completo:</span>
                      <span className="font-semibold">{selectedPratica.nome_completo || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Lotação / Setor:</span>
                      <span className="font-semibold">{selectedPratica.lotacao || 'Não informada'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Cargo / Função:</span>
                      <span>{selectedPratica.cargo_funcao || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Matrícula:</span>
                      <span>{selectedPratica.matricula || 'Não informada'}</span>
                    </div>
                  </div>
                </div>

                {/* Resumo da Prática */}
                {selectedPratica.descricao_iniciativa && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs mb-1">Resumo Executivo</h4>
                    <p className="bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap leading-relaxed text-justify">
                      {selectedPratica.descricao_iniciativa}
                    </p>
                  </div>
                )}

                {/* Objetivos */}
                {selectedPratica.objetivos && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs mb-1">Objetivos</h4>
                    <p className="bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap leading-relaxed text-justify">
                      {selectedPratica.objetivos}
                    </p>
                  </div>
                )}

                {/* Metodologia */}
                {selectedPratica.metodologia && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs mb-1">Metodologia e Etapas</h4>
                    <p className="bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap leading-relaxed text-justify">
                      {selectedPratica.metodologia}
                    </p>
                  </div>
                )}

                {/* Principais Resultados */}
                {selectedPratica.principais_resultados && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs mb-1">Resultados Alcançados</h4>
                    <p className="bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap leading-relaxed text-justify">
                      {selectedPratica.principais_resultados}
                    </p>
                  </div>
                )}

                {/* Botões do Rodapé do Modal */}
                <div className="pt-3 flex justify-between items-center border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownloadPDF(selectedPratica)}
                    className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Baixar PDF
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => setIsDetailsOpen(false)}
                    className="text-xs"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinhasPraticas;
