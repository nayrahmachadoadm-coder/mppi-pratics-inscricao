import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Target,
  FileText,
  Users,
  Award,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { isAuthenticated, hasRole } from '@/lib/auth';
import { getInscricaoById, AdminInscricaoData } from '@/lib/adminService';
import { generatePDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { formatObjetivoEstrategico } from '@/utils/objetivosEstrategicos';

// Utilitário para transformar URLs em links clicáveis com estilo
const renderTextWithLinks = (text?: string) => {
  if (!text) return '';
  // Captura URLs comuns; depois removemos pontuação final anexada (parênteses, vírgulas, pontos, etc.)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(urlRegex);
  regex.lastIndex = 0;
  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const raw = match[0];
    // Remove pontuação final comum anexada ao link
    const visible = raw.replace(/[)\]\}.,;:!?'"”’]+$/, '');
    const endVisible = start + visible.length;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    const href = /^https?:\/\//i.test(visible) ? visible : `http://${visible}`;
    parts.push(
      <a
        key={`link-${start}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-all"
      >
        {visible}
      </a>
    );

    // Avança apenas até o fim do URL visível; a pontuação permanece no texto seguinte
    lastIndex = endVisible;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

const AdminInscricaoDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [inscricao, setInscricao] = useState<AdminInscricaoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewerIsAdmin, setViewerIsAdmin] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar autenticação (admin OU jurado). A rota já protege,
  // mas mantemos proteção defensiva aqui para acessos diretos.
  useEffect(() => {
    const checkAuth = async () => {
      const authed = await isAuthenticated();
      if (!authed) {
        navigate('/admin/login');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (id) {
      loadInscricao(id);
    }
  }, [id]);

  // Carregar dados da inscrição
  useEffect(() => {
    if (id) {
      loadInscricao(id);
    }
  }, [id]);

  const loadInscricao = async (inscricaoId: string) => {
    try {
      setLoading(true);
      setError('');
      
      
      const result = await getInscricaoById(inscricaoId);
      
      if (result.success && result.data && result.data.length > 0) {
          const inscricaoData = result.data[0];
          
          setInscricao(inscricaoData);
        } else {
        setError(result.error || 'Inscrição não encontrada');
      }
    } catch (err) {
      console.error('Erro ao carregar inscrição:', err);
      setError('Erro ao carregar dados da inscrição');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!inscricao) return;
    
    try {
      toast({
        title: "Gerando PDF...",
        description: "Por favor, aguarde enquanto o PDF é gerado",
      });
      
      await generatePDF(inscricao, { maskSensitive: !viewerIsAdmin });
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O download foi iniciado automaticamente",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF da inscrição",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDataInicio = (dateString: string) => {
    // Se a string contém apenas 4 dígitos (ano), retorna apenas o ano
    if (/^\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    // Se é uma data completa, extrai apenas o ano
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.getFullYear().toString();
    }
    
    // Fallback: retorna a string original
    return dateString;
  };

  const formatCargoFuncao = (cargo: string) => {
    // Mapeamento dos valores com hífen para formato legível
    const cargoMap: { [key: string]: string } = {
      'promotor-de-justica': 'Promotor de Justiça',
      'procurador-de-justica': 'Procurador de Justiça',
      'servidor': 'Servidor'
    };
    
    // Retorna o valor formatado ou o valor original se não estiver no mapeamento
    return cargoMap[cargo] || cargo;
  };

  const formatAreaAtuacao = (area: string) => {
    const areaMap: { [key: string]: string } = {
      'finalistica-pratica': 'Prática Finalística',
      'finalistica-projeto': 'Projeto Finalístico',
      'estruturante-pratica': 'Prática Estruturante',
      'estruturante-projeto': 'Projeto Estruturante',
      'categoria-especial-ia': 'Categoria Especial – Inteligência Artificial'
    };
    
    return areaMap[area] || area;
  };

  // Mascarar telefone para jurados (2 primeiros e 2 últimos dígitos visíveis)
  const maskPhone = (phone: string | null | undefined) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) {
      return '*'.repeat(Math.max(digits.length, 0));
    }
    const start = digits.slice(0, 2);
    const end = digits.slice(-2);
    const middleLen = digits.length - 4;
    return `${start}${'•'.repeat(middleLen)}${end}`;
  };

  const formatBooleanResponse = (value: boolean | string) => {
    // Conversão correta de string para boolean
    const boolValue = value === true || value === 'true';
    
    return boolValue ? (
      <>
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-green-600 font-medium">Sim</span>
      </>
    ) : (
      <>
        <XCircle className="w-4 h-4 text-red-600" />
        <span className="text-red-600 font-medium">Não</span>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando detalhes da inscrição...</p>
        </div>
      </div>
    );
  }

  if (error || !inscricao) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erro ao carregar inscrição
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/admin')}>
              Voltar à Página Inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/inscritos?categoria=${inscricao.area_atuacao}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Detalhes da Inscrição
                </h1>
                <p className="text-xs text-gray-500">
                  ID: {inscricao.id}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Conteúdo principal sem barra lateral */}
        <div className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Nome Completo</label>
                    <p className="text-gray-900">{inscricao.nome_completo}</p>
                  </div>
                  <div>
                     <label className="text-xs font-medium text-gray-600">Cargo/Função</label>
                     <p className="text-gray-900">{formatCargoFuncao(inscricao.cargo_funcao)}</p>
                   </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Email Institucional</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {inscricao.email_institucional}
                    </p>
                  </div>
                  <div>
                   <label className="text-xs font-medium text-gray-600">Telefone</label>
                   <p className="text-gray-900 flex items-center gap-2">
                     <Phone className="w-4 h-4" />
                      {viewerIsAdmin ? inscricao.telefone : maskPhone(inscricao.telefone)}
                   </p>
                 </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Lotação</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {inscricao.lotacao}
                    </p>
                  </div>
                  {inscricao.matricula && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Matrícula</label>
                      <p className="text-gray-900">{inscricao.matricula}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dados da Iniciativa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Target className="w-4 h-4" />
                  Dados da Iniciativa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <label className="text-xs font-medium text-gray-600">Título da Iniciativa</label>
                  <p className="text-gray-900 font-medium">{inscricao.titulo_iniciativa}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Área de Atuação</label>
                    <Badge variant="outline" className="mt-1">
                      {formatAreaAtuacao(inscricao.area_atuacao)}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Ano de Início</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDataInicio(inscricao.data_inicio)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Público Alvo / Equipe Envolvida</label>
                  <p className="text-gray-900 whitespace-pre-wrap text-justify">{renderTextWithLinks(inscricao.publico_alvo)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Descrição da Prática */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Descrição da Prática
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div>
                  <label className="text-xs font-medium text-gray-600">Resumo Executivo</label>
                  <p className="text-gray-900 whitespace-pre-wrap text-justify mt-2">{renderTextWithLinks(inscricao.descricao_iniciativa)}</p>
                </div>
                
                {inscricao.problema_necessidade && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Problema ou Necessidade</label>
                    <p className="text-gray-900 whitespace-pre-wrap text-justify mt-2">{renderTextWithLinks(inscricao.problema_necessidade)}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-medium text-gray-600">Objetivo Estratégico</label>
                  <p className="text-gray-900 whitespace-pre-wrap text-justify mt-2">{renderTextWithLinks(formatObjetivoEstrategico(inscricao.objetivos))}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600">Metodologia</label>
                  <p className="text-gray-900 whitespace-pre-wrap text-justify mt-2">{renderTextWithLinks(inscricao.metodologia)}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600">Principais Resultados</label>
                  <p className="text-gray-900 whitespace-pre-wrap text-justify mt-2">{renderTextWithLinks(inscricao.principais_resultados)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Critérios de Avaliação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Award className="w-4 h-4" />
                  Critérios de Avaliação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Cooperação</label>
                    <p className="text-gray-900 whitespace-pre-wrap text-justify">{renderTextWithLinks(inscricao.cooperacao)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Inovação</label>
                    <p className="text-gray-900 whitespace-pre-wrap text-justify">{renderTextWithLinks(inscricao.inovacao)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Resolutividade</label>
                    <p className="text-gray-900 whitespace-pre-wrap text-justify">{renderTextWithLinks(inscricao.resolutividade)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Impacto Social</label>
                    <p className="text-gray-900 whitespace-pre-wrap text-justify">{renderTextWithLinks(inscricao.impacto_social)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Alinhamento ODS</label>
                    <p className="text-gray-900 whitespace-pre-wrap text-justify">{renderTextWithLinks(inscricao.alinhamento_ods)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Replicabilidade</label>
                    <p className="text-gray-900 whitespace-pre-wrap text-justify">{renderTextWithLinks(inscricao.replicabilidade)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminInscricaoDetails;