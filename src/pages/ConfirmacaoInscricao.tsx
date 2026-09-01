import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Home, FileText } from 'lucide-react';
import { generatePDF } from '@/lib/pdfGenerator';

interface InscricaoData {
  nome_completo: string;
  email_institucional: string;
  telefone: string;
  lotacao: string;
  cargo_funcao: string;
  matricula?: string; // Campo opcional - matrícula do proponente
  titulo_iniciativa: string;
  descricao_iniciativa: string;
  area_atuacao: string;
  situacao_atual?: string; // Campo para situação atual da prática
  data_conclusao?: string | null; // Campo para data de conclusão
  publico_alvo?: string; // Campo para relação da equipe
  problema_necessidade?: string; // Campo para problema ou necessidade
  objetivos: string;
  metodologia: string;
  principais_resultados: string;
  cooperacao: string;
  inovacao: string;
  resolutividade: string;
  impacto_social: string;
  alinhamento_ods: string;
  replicabilidade: string;
  participou_edicoes_anteriores: boolean;
  foi_vencedor_anterior: boolean;
  declaracao: boolean;
  observacoes?: string | null;
  created_at?: string;
}

const ConfirmacaoInscricao: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inscricaoData = location.state?.inscricaoData as InscricaoData;

  if (!inscricaoData) {
    navigate('/');
    return null;
  }

  const handleDownloadPDF = async () => {
    try {
      await generatePDF(inscricaoData);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Tente novamente.');
    }
  };

  const handleNovaInscricao = () => {
    navigate('/');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-700 mb-2">
            Inscrição Realizada com Sucesso!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Sua inscrição no Prêmio Melhores Práticas MPPI 2025 foi registrada
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações da Inscrição */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Dados da Inscrição
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Nome:</span>
                <p className="text-gray-800">{inscricaoData.nome_completo}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-800">{inscricaoData.email_institucional}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Órgão:</span>
                <p className="text-gray-800">{inscricaoData.lotacao}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Data da Inscrição:</span>
                <p className="text-gray-800">{inscricaoData.created_at ? formatDate(inscricaoData.created_at) : 'Não disponível'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Título da Prática:</span>
                <p className="text-gray-800">{inscricaoData.titulo_iniciativa}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Área de Atuação:</span>
                <p className="text-gray-800">{formatAreaAtuacao(inscricaoData.area_atuacao)}</p>
              </div>
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">📋 Próximos Passos</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Sua inscrição foi registrada em nosso sistema</li>
              <li>• Faça o download do comprovante em PDF para seus registros</li>
              <li>• Aguarde comunicações sobre o processo de avaliação</li>
              <li>• Em caso de dúvidas, entre em contato conosco</li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleDownloadPDF}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Baixar Comprovante (PDF)
            </Button>
            
            <Button 
              onClick={handleNovaInscricao}
              variant="outline"
              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Nova Inscrição
            </Button>
          </div>

          {/* Informações de Contato */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>Em caso de dúvidas, entre em contato:</p>
            <p className="font-medium">planejamento@mppi.mp.br</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmacaoInscricao;
