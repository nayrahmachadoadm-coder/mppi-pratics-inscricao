import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { authenticateAdmin, isAdminAuthenticated } from '@/lib/adminAuth';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar se já está autenticado
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

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

      // Tentar autenticar
      const isAuthenticated = authenticateAdmin(username.trim(), password);

      if (isAuthenticated) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o painel administrativo...",
        });
        
        // Pequeno delay para mostrar o toast
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        setError('Credenciais inválidas. Verifique seu usuário e senha.');
        toast({
          title: "Erro no login",
          description: "Credenciais inválidas",
          variant: "destructive",
        });
      }
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Área Administrativa
          </h1>
          <p className="text-gray-600">
            Sistema de Gestão de Inscrições - Melhores Práticas MPPI
          </p>
        </div>

        {/* Formulário de Login */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Login Administrativo
            </CardTitle>
            <CardDescription className="text-center">
              Acesse o painel de controle das inscrições
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Usuário */}
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
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
                    Esta área é destinada exclusivamente aos administradores do sistema. 
                    Todas as ações são registradas e monitoradas.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Link para voltar */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Voltar ao site principal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;