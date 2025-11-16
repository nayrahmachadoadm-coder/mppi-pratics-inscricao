import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Crown } from 'lucide-react';
import { authenticateUser, isAuthenticated, hasRole, currentUserMustChangePassword } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Verificar se já está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      if (await isAuthenticated()) {
        navigate('/admin');
      }
    };
    checkAuth();
  }, [navigate]);

  // Aviso discreto quando redirecionado de páginas públicas antigas
  useEffect(() => {
    const checkNotice = async () => {
      const params = new URLSearchParams(location.search);
      const notice = params.get('notice');
      const from = params.get('from');
      const authenticated = await isAuthenticated();
      
      if (!authenticated && notice === 'encerradas') {
        toast({
          title: 'Inscrições encerradas',
          description: from
            ? `Página "${from}" não está mais disponível. Faça login para análise das inscrições.`
            : 'Página pública não disponível. Faça login para análise das inscrições.',
        });
      }
    };
    checkNotice();
  }, [location.search, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validação básica
      if (!username.trim() || !password.trim()) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      // Autenticar via Supabase
      const authResult = await authenticateUser(username.trim(), password);
      
      if (!authResult.success) {
        setError(authResult.error || 'Credenciais inválidas');
        toast({
          title: "Erro no login",
          description: authResult.error || 'Credenciais inválidas',
          variant: "destructive",
        });
        return;
      }

      // Verificar se precisa trocar senha
      if (authResult.mustChangePassword) {
        toast({
          title: "Troca de senha obrigatória",
          description: "Você precisa alterar sua senha temporária",
        });
        setTimeout(() => {
          navigate('/jurado/senha');
        }, 1000);
        return;
      }

      // Login bem-sucedido
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      });
      
      setTimeout(() => {
        navigate('/admin');
      }, 1000);

    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro interno. Tente novamente.');
      toast({
        title: "Erro no sistema",
        description: "Ocorreu um erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex items-center justify-center">
            <img src="/logo-mppi.png" alt="Logo MPPI" className="h-16 w-auto" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Prêmio Melhores Práticas do MPPI - 9ª Edição
          </h1>
          <p className="text-gray-600">
            Sistema de Julgamento e Gestão de Inscrições
          </p>
        </div>

        {/* Aviso removido */}

        {/* Formulário de Login */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <Crown className="w-7 h-7 text-yellow-500 drop-shadow-sm" />
              Login do Sistema
            </CardTitle>
            <CardDescription className="text-center">
              Acesse o sistema de avaliação das inscrições
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo E-mail */}
              <div className="space-y-2">
                <Label htmlFor="username">E-mail</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu e-mail"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Botão de Login */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Informações de Segurança */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Acesso Restrito</p>
                  <p className="text-xs">
                    Área destinada exclusivamente aos administradores do sistema e jurados. Todas as ações são registradas e monitoradas.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};

export default AdminLogin;
