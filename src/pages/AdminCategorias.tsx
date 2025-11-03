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
import { Award } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-amber-50 flex items-center justify-center p-10">
      <div className="w-full max-w-6xl">

        {error && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <Card className="shadow-2xl bg-white/95 backdrop-blur-sm min-h-[280px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Categorias de Premiação
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {categorias.map(({ key, lines }) => (
                <Button
                  key={key}
                  variant="default"
                  className="group relative flex flex-col items-center justify-center h-36 px-5 text-center bg-white shadow-xl hover:shadow-2xl transition-all duration-200 border border-gray-200 rounded-2xl hover:bg-primary"
                  disabled={loading}
                  onClick={() => navigate(`/admin/categoria/${encodeURIComponent(key)}`)}
                >
                  <span className="font-semibold text-gray-900 leading-tight whitespace-normal break-words group-hover:text-white">
                    {lines[0]}<br />{lines[1]}
                  </span>
                  <span className="mt-2 text-sm text-gray-500 group-hover:text-primary-foreground">
                    Inscrições: {counts[key] ?? 0}
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