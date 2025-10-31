import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getInscricoesStats } from '@/lib/adminService';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { currentUserMustChangePassword, isUserRole } from '@/lib/userAuth';
import { Key } from 'lucide-react';
import { Users } from 'lucide-react';

type CategoriaKey = 'finalistica-projeto' | 'estruturante-projeto' | 'finalistica-pratica' | 'estruturante-pratica' | 'categoria-especial-ia';

const categorias: { key: CategoriaKey; lines: [string, string] }[] = [
  { key: 'finalistica-projeto', lines: ['Projetos', 'Finalísticos'] },
  { key: 'estruturante-projeto', lines: ['Projetos', 'Estruturantes'] },
  { key: 'finalistica-pratica', lines: ['Práticas', 'Finalísticas'] },
  { key: 'estruturante-pratica', lines: ['Práticas', 'Estruturantes'] },
  { key: 'categoria-especial-ia', lines: ['Categoria Especial', '(Inteligência Artificial)'] },
];

const AdminCategorias = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getInscricoesStats();
        if (res.success && res.data) {
          const map: Record<string, number> = {};
          res.data.por_area.forEach((item) => {
            map[item.area] = item.count;
          });
          setCounts(map);
        } else {
          setError(res.error || 'Erro ao obter estatísticas');
        }
      } catch (e) {
        setError('Erro inesperado ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const header = (() => {
    const isAdmin = isAdminAuthenticated();
    const isJurado = isUserRole('jurado');
    const mustChange = currentUserMustChangePassword();
    return (
    <div className="text-center mb-8">
      <div className="mb-4 flex items-center justify-center gap-2">
        <img src="/favicon.ico" alt="Ícone" className="h-6 w-6 opacity-80" />
        <h1 className="text-xl font-bold text-gray-900">
          Sistema de Julgamento e Gestão de Inscrições
        </h1>
      </div>
      <div className="flex items-center justify-center gap-4">
        <p className="text-gray-600">Selecione uma categoria para visualizar as inscrições</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/regulamento')}>
            Regulamento
          </Button>
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin/jurados')}
              className="text-gray-500 hover:text-gray-700"
              title="Gestão de Jurados"
            >
              <Users className="h-4 w-4" />
            </Button>
          )}
          {isJurado && mustChange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/jurado/senha')}
              className="text-gray-500 hover:text-gray-700"
              title="Trocar senha temporária"
            >
              <Key className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
  })();

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {header}

        {error && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <Card className="shadow-xl border border-gray-200 bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Categorias de Premiação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {categorias.map(({ key, lines }) => (
                <Button
                  key={key}
                  variant="default"
                  className="relative flex flex-col items-center justify-center h-28 px-4 text-center bg-white shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-200 rounded-xl"
                  disabled={loading}
                  onClick={() => navigate(`/admin/categoria/${encodeURIComponent(key)}`)}
                >
                  <span className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md bg-blue-100 text-blue-700 text-sm px-2 py-1 shadow">
                    {counts[key] ?? 0}
                  </span>
                  <span className="font-semibold text-gray-900 leading-tight whitespace-normal break-words">
                    {lines[0]}<br />{lines[1]}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCategorias;