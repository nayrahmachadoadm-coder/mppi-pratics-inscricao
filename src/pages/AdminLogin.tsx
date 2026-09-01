import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
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

  // Confetti setup
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);

  // Auto-hide confetti after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Confetti effect for the 10th anniversary */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
          colors={['#D4AF37', '#B8860B', '#FFD700', '#800020', '#4A0404']}
        />
      )}
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-yellow-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl glass-gold border-yellow-500/20">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white rounded-t-xl relative overflow-hidden">
            {/* Subtle star pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #FFD700 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="flex justify-center mb-4 relative z-10 animate-sparkle">
              <div className="bg-white/10 p-2 rounded-full ring-2 ring-yellow-400/50 shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                <Crown className="w-10 h-10 text-yellow-400" />
              </div>
            </div>
            
            <h1 className="text-xl font-bold tracking-tight mb-1 text-yellow-50 relative z-10">
              Prêmio Melhores Práticas MPPI
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
              <span className="text-sm text-yellow-200/90 font-medium">
                10ª Edição - 2026 | Ficha de Inscrição
              </span>
              <span className="bg-yellow-500 text-primary-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(212,175,55,0.4)] animate-pulse">
                10 Anos
              </span>
            </div>
            <CardDescription className="text-yellow-100 mt-2 relative z-10">
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
                className="w-full bg-gradient-gold hover:bg-yellow-500 hover:text-primary-dark text-white border-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 text-primary-dark">
                    <div className="w-4 h-4 border-2 border-primary-dark border-t-transparent rounded-full animate-spin" />
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

