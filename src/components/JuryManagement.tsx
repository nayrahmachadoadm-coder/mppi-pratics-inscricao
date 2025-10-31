import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Key, Trash2, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  listJuryMembers, 
  registerJuryMember, 
  removeJuryMember, 
  resetJuryPassword,
  JuryMember 
} from '@/lib/juryManagement';

const JuryManagement = () => {
  const [juryMembers, setJuryMembers] = useState<JuryMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newJury, setNewJury] = useState({
    username: '',
    name: ''
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const { toast } = useToast();

  // Carregar lista de jurados
  useEffect(() => {
    loadJuryMembers();
  }, []);

  const loadJuryMembers = () => {
    const members = listJuryMembers();
    setJuryMembers(members);
  };

  const handleAddJury = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!newJury.username.trim() || !newJury.name.trim()) {
        toast({
          title: "Erro",
          description: "Todos os campos são obrigatórios",
          variant: "destructive",
        });
        return;
      }

      const result = registerJuryMember(
        newJury.username,
        newJury.name,
        'admin' // Criado pelo administrador
      );

      if (result.success) {
        setGeneratedPassword(result.temporaryPassword || '');
        setNewJury({ username: '', name: '' });
        loadJuryMembers();
        
        toast({
          title: "Jurado cadastrado com sucesso!",
          description: `Senha temporária gerada: ${result.temporaryPassword}`,
        });
      } else {
        toast({
          title: "Erro ao cadastrar jurado",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno ao cadastrar jurado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (username: string) => {
    const result = resetJuryPassword(username);
    
    if (result.success) {
      loadJuryMembers();
      toast({
        title: "Senha resetada",
        description: `Nova senha temporária: ${result.temporaryPassword}`,
      });
    } else {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleRemoveJury = async (username: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover o jurado "${name}"?`)) {
      return;
    }

    const result = removeJuryMember(username);
    
    if (result.success) {
      loadJuryMembers();
      toast({
        title: "Jurado removido",
        description: `${name} foi removido do sistema`,
      });
    } else {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gestão de Jurados
        </CardTitle>
        <CardDescription>
          Gerencie os jurados do sistema. Cadastre novos membros e gere senhas temporárias.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Botão para adicionar jurado */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total de jurados: <Badge variant="secondary">{juryMembers.length}</Badge>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Cadastrar Jurado
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Jurado</DialogTitle>
                <DialogDescription>
                  Preencha os dados do jurado. Uma senha temporária será gerada automaticamente.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddJury} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input
                    id="username"
                    value={newJury.username}
                    onChange={(e) => setNewJury({ ...newJury, username: e.target.value })}
                    placeholder="Ex: joao.silva"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={newJury.name}
                    onChange={(e) => setNewJury({ ...newJury, name: e.target.value })}
                    placeholder="Ex: João Silva"
                    disabled={isLoading}
                  />
                </div>
                
                {/* Campo de e-mail removido conforme nova política de cadastro */}

                {generatedPassword && (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Senha gerada: <strong>{generatedPassword}</strong></span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedPassword)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setGeneratedPassword('');
                      setNewJury({ username: '', name: '' });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>

        {/* Lista de jurados */}
        {juryMembers.length === 0 ? (
          <Alert>
            <AlertDescription>
              Nenhum jurado cadastrado. Use o botão "Cadastrar Jurado" para adicionar membros.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {juryMembers.map((jury) => (
                  <TableRow key={jury.username}>
                    <TableCell className="font-medium">{jury.name}</TableCell>
                    <TableCell>{jury.username}</TableCell>
                    <TableCell>
                      {new Date(jury.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(jury.username)}
                          title="Resetar senha"
                        >
                          <Key className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveJury(jury.username, jury.name)}
                          title="Remover jurado"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JuryManagement;