import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  LogOut, 
  Eye,
  Calendar,
  BarChart3,
  Clock,
  RefreshCw
} from 'lucide-react';
import { 
  isAdminAuthenticated, 
  logoutAdmin, 
  getAdminSession,
  getSessionTimeRemaining 
} from '@/lib/adminAuth';
import { 
  getAllInscricoes, 
  getInscricoesStats, 
  getAreasAtuacao,
  AdminInscricaoData,
  InscricaoFilters 
} from '@/lib/adminService';
import { generatePDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [inscricoes, setInscricoes] = useState<AdminInscricaoData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInscricoes, setTotalInscricoes] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const itemsPerPage = 10;

  // Verificar autenticação
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    // Atualizar tempo de sessão a cada minuto
    const updateSessionTime = () => {
      setSessionTime(getSessionTimeRemaining());
    };
    
    updateSessionTime();
    const interval = setInterval(updateSessionTime, 60000); // 1 minuto
    
    return () => clearInterval(interval);
  }, [navigate]);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Ler parâmetro de área da URL para filtro inicial
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const area = params.get('area');
    if (area) {
      setSelectedArea(area);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar inscrições quando filtros mudarem
  useEffect(() => {
    loadInscricoes();
  }, [currentPage, searchTerm, selectedArea]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const statsResult = await getInscricoesStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      }
      
      // Carregar áreas de atuação
      const areasResult = await getAreasAtuacao();
      if (areasResult.success) {
        setAreas(areasResult.data || []);
      }
      
      // Carregar inscrições
      await loadInscricoes();
      
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInscricoes = async () => {
    try {
      setLoading(true);
      const filters: InscricaoFilters = {};
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (selectedArea && selectedArea !== 'todas') {
        filters.area_atuacao = selectedArea;
      }
      
      
      const result = await getAllInscricoes(currentPage, itemsPerPage, filters);
      
      if (result.success) {
        setInscricoes(result.data || []);
        setTotalInscricoes(result.total || 0);
        setTotalPages(Math.ceil((result.total || 0) / itemsPerPage));
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao carregar inscrições",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar inscrições",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    navigate('/admin/login');
  };

  const handleViewDetails = (inscricao: AdminInscricaoData) => {
    navigate(`/admin/inscricao/${inscricao.id}`);
  };

  const handleDownloadPDF = async (inscricao: AdminInscricaoData) => {
    try {
      toast({
        title: "Gerando PDF...",
        description: "Por favor, aguarde enquanto o PDF é gerado",
      });
      
      await generatePDF(inscricao);
      
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedArea('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-gray-500">
                  Gestão de Inscrições - Melhores Práticas MPPI
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Tempo de sessão */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Sessão: {sessionTime}min</span>
              </div>
              
              {/* Botão de logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Filtros e Busca */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-4 h-4" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Busca por texto */}
              <div className="md:col-span-2">
                <Label htmlFor="search" className="text-sm font-medium">Buscar</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome, email ou título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </div>
              
              {/* Filtro por área */}
              <div>
                <Label className="text-sm font-medium">Área de Atuação</Label>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="h-9 mt-1">
                    <SelectValue placeholder="Todas as áreas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as áreas</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Botões de ação */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2 h-9"
                  size="sm"
                >
                  <RefreshCw className="w-3 h-3" />
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Inscrições */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-4 h-4" />
                Inscrições ({totalInscricoes})
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                Página {currentPage} de {totalPages}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {inscricoes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma inscrição encontrada</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead className="w-[180px] text-xs font-semibold">Nome</TableHead>
                        <TableHead className="w-[200px] text-xs font-semibold">Email</TableHead>
                        <TableHead className="w-[250px] text-xs font-semibold">Título da Iniciativa</TableHead>
                        <TableHead className="w-[140px] text-xs font-semibold">Área</TableHead>
                        <TableHead className="w-[100px] text-xs font-semibold">Data</TableHead>
                        <TableHead className="w-[60px] text-center text-xs font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inscricoes.map((inscricao) => (
                        <TableRow key={inscricao.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-sm py-2 truncate">
                            {inscricao.nome_completo}
                          </TableCell>
                          <TableCell className="text-sm py-2 truncate">
                            {inscricao.email_institucional}
                          </TableCell>
                          <TableCell className="text-sm py-2 truncate" title={inscricao.titulo_iniciativa}>
                            {inscricao.titulo_iniciativa}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {formatAreaAtuacao(inscricao.area_atuacao)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 py-2">
                            {formatDate(inscricao.created_at)}
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex flex-col gap-1 items-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(inscricao)}
                                className="h-7 w-7 p-0 hover:bg-blue-100"
                                title="Ver detalhes"
                              >
                                <Eye className="w-3 h-3 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadPDF(inscricao)}
                                className="h-7 w-7 p-0 hover:bg-red-100"
                                title="Baixar PDF"
                              >
                                <Download className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;