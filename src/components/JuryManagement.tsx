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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
  listJuryMembers, 
  registerJuryMember, 
  removeJuryMember, 
  resetJuryPassword,
  JuryMember 
} from '@/lib/juryManagement';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { isUserRole } from '@/lib/userAuth';
import { getAllInscricoes } from '@/lib/adminService';
import { getAvaliacoesByJurado } from '@/lib/evaluationService';

// Vagas conforme item 6 do edital
const SEATS = [
  { code: 'PGJ1', label: 'Membro escolhido pelo PGJ (1 de 2)' },
  { code: 'PGJ2', label: 'Membro escolhido pelo PGJ (2 de 2)' },
  { code: 'APMP', label: 'Associação Piauiense do Ministério Público' },
  { code: 'SINDICATO', label: 'Sindicato dos Servidores do MPPI' },
  { code: 'UFPI', label: 'Universidade Federal do Piauí' },
  { code: 'UESPI', label: 'Universidade Estadual do Piauí' },
  { code: 'TJPI', label: 'Poder Judiciário do Estado do Piauí' },
  { code: 'OABPI', label: 'Ordem dos Advogados do Brasil (OAB-PI)' },
  { code: 'DEFENSORIA', label: 'Defensoria Pública' },
];

const JuryManagement = () => {
  const [juryMembers, setJuryMembers] = useState<JuryMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newJury, setNewJury] = useState({
    username: '',
    name: '',
    seatCode: '',
    seatLabel: '',
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [totalInscricoes, setTotalInscricoes] = useState<number>(0);
  const [juryPercents, setJuryPercents] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const isAdmin = isAdminAuthenticated() || isUserRole('admin');

  // Carregar lista de jurados e estatísticas
  useEffect(() => {
    const init = async () => {
      const members = loadJuryMembers();
      try {
        const res = await getAllInscricoes(1, 1);
        if (res.success) {
          setTotalInscricoes(res.total || 0);
        } else {
          setTotalInscricoes(0);
        }
      } catch {
        setTotalInscricoes(0);
      }
      await computePercents(members);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computePercents = async (membersOverride?: JuryMember[]) => {
    const denom = totalInscricoes > 0 ? totalInscricoes : 0;
    const list = membersOverride || juryMembers;
    const totals: Record<string, number> = {};
    for (const j of list) {
      try {
        const av = await getAvaliacoesByJurado(j.username);
        const count = av.success && av.data ? av.data.length : 0;
        totals[j.username] = denom > 0 ? Math.round((count / denom) * 100) : 0;
      } catch {
        totals[j.username] = 0;
      }
    }
    setJuryPercents(totals);
  };

  const loadJuryMembers = () => {
    const members = listJuryMembers();
    setJuryMembers(members);
    return members;
  };

  const handleAddJury = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!newJury.username.trim() || !newJury.name.trim() || !newJury.seatCode.trim()) {
        toast({
          title: "Erro",
          description: "Todos os campos são obrigatórios (incluindo a vaga)",
          variant: "destructive",
        });
        return;
      }

      const result = await registerJuryMember(
        newJury.username,
        newJury.name,
        'admin', // Criado pelo administrador
        newJury.seatCode,
        newJury.seatLabel
      );

      if (result.success) {
        setGeneratedPassword(result.temporaryPassword || '');
        setNewJury({ username: '', name: '', seatCode: '', seatLabel: '' });
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

  // Códigos de vagas já ocupadas, para desabilitar no select
  const occupiedSeatCodes = new Set(juryMembers.map(j => j.seatCode).filter(Boolean));

  return (
    <Card className="w-full">
      <CardHeader className="bg-transparent rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[hsl(var(--primary))]" />
            Comissão Julgadora
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {totalInscricoes > 0 ? `Total de inscritos: ${totalInscricoes}` : 'Total de inscritos: —'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Botão para adicionar jurado */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total de jurados: <Badge variant="secondary">{juryMembers.length}</Badge>
          </div>
          
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Cadastrar Jurado
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-sm overflow-hidden pt-0">
                <DialogHeader className="sticky top-0 z-20 -mx-4 px-4 pt-2 pb-3 bg-primary text-primary-foreground border-b border-primary-dark sm:rounded-t-lg">
                  <DialogTitle className="text-base text-primary-foreground">Cadastrar Novo Jurado</DialogTitle>
                  <DialogDescription className="text-xs text-primary-foreground/90">
                    Informe o e-mail do jurado e dados da vaga. Uma senha temporária será gerada automaticamente.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddJury} className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs">E-mail do jurado (login)</Label>
                    <Input
                      id="username"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={newJury.username}
                      onChange={(e) => setNewJury({ ...newJury, username: e.target.value })}
                      placeholder="Ex: joao.silva@exemplo.com"
                      disabled={isLoading}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs">Nome completo</Label>
                    <Input
                      id="name"
                      value={newJury.name}
                      onChange={(e) => setNewJury({ ...newJury, name: e.target.value })}
                      placeholder="Ex: João Silva"
                      disabled={isLoading}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Vaga (Item 6 do Edital)</Label>
                    <Select
                      value={newJury.seatCode}
                      onValueChange={(val) => {
                        const seat = SEATS.find(s => s.code === val);
                        setNewJury({
                          ...newJury,
                          seatCode: val,
                          seatLabel: seat ? seat.label : '',
                        });
                      }}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Selecione a vaga" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] max-h-72 p-0 bg-white shadow-lg">
                        {SEATS.map((s) => (
                          <SelectItem key={s.code} value={s.code} disabled={occupiedSeatCodes.has(s.code)} className="py-1 text-xs">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newJury.seatCode && occupiedSeatCodes.has(newJury.seatCode) && (
                      <p className="text-[11px] text-muted-foreground">Esta vaga já está ocupada.</p>
                    )}
                  </div>
                  
                  {/* Campo de e-mail removido conforme nova política de cadastro */}

                  {generatedPassword && (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription className="flex items-center justify-between text-xs">
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
                    <Button type="submit" disabled={isLoading} size="sm" className="flex-1 h-9">
                      {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" size="sm" className="h-9"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setGeneratedPassword('');
                        setNewJury({ username: '', name: '', seatCode: '', seatLabel: '' });
                    }}
                  >
                    Fechar
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Lista de jurados */}
        {juryMembers.length === 0 ? (
          <Alert>
            <AlertDescription>
              {isAdmin
                ? 'Nenhum jurado cadastrado. Use o botão "Cadastrar Jurado" para adicionar membros.'
                : 'Nenhum jurado cadastrado.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[hsl(var(--primary))] text-white">
                <TableRow>
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Usuário</TableHead>
                  <TableHead className="text-white">Vaga</TableHead>
                  <TableHead className="text-white">Avaliações (%)</TableHead>
                  <TableHead className="text-white">Cadastrado em</TableHead>
                  {isAdmin && <TableHead className="text-right text-white">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {juryMembers.map((jury) => (
                  <TableRow key={jury.username}>
                    <TableCell className="font-medium">{jury.name}</TableCell>
                    <TableCell>{jury.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{(jury as any).seatLabel || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      {typeof juryPercents[jury.username] === 'number' ? `${juryPercents[jury.username]}%` : '—'}
                    </TableCell>
                    <TableCell>
                      {new Date(jury.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    {isAdmin && (
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
                    )}
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