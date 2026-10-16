import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, FileText, Settings, LogOut } from 'lucide-react';
import { getSession, logoutUser } from '@/lib/auth';

const MinhasPraticas = () => {
  const [praticas, setPraticas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  const navigate = useNavigate();

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
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Minhas Práticas</h1>
            <p className="text-sm text-gray-500">Bem-vindo, {userName}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/inscricao')} className="flex gap-2 bg-blue-700 hover:bg-blue-800">
              <PlusCircle className="w-4 h-4" /> Nova Prática
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex gap-2 text-red-600 hover:text-red-700">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Carregando suas práticas...</div>
        ) : praticas.length === 0 ? (
          <Card className="text-center py-12 bg-white">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <CardTitle className="mb-2">Nenhuma prática cadastrada</CardTitle>
              <CardDescription className="mb-6">Você ainda não submeteu nenhuma prática no Banco de Práticas.</CardDescription>
              <Button onClick={() => navigate('/inscricao')}>
                Cadastrar Primeira Prática
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {praticas.map(pratica => (
              <Card key={pratica.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-blue-900">{pratica.titulo_iniciativa}</CardTitle>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {pratica.status_inscricao || 'Rascunho'}
                    </span>
                  </div>
                  <CardDescription>
                    Criada em: {new Date(pratica.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => navigate(`/inscricao?id=${pratica.id}`)}>
                    <Settings className="w-4 h-4 mr-2" /> Editar Dados
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MinhasPraticas;
