import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Key, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
  getJuryMembers, 
  addJuryMember, 
  removeJuryMember, 
  resetJuryPassword,
  JuryMember 
} from '@/lib/juryManagement';
import { hasRole, getCurrentProfile } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [newJury, setNewJury] = useState({
    username: '',
    name: '',
    seatCode: '',
    seatLabel: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadJuryMembers();
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      const admin = await hasRole('admin');
      if (admin) {
        setIsAdmin(true);
        return;
      }
      // Fallback: considerar usuário planejamento como admin
      const profile = await getCurrentProfile();
      const isPlanejamento = (
        profile?.username?.toLowerCase() === 'planejamento' ||
        profile?.email?.toLowerCase() === 'planejamento@mppi.mp.br'
      );
      if (isPlanejamento) {
        setIsAdmin(true);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email?.toLowerCase();
      setIsAdmin(email === 'planejamento@mppi.mp.br');
    };
    checkRole();
  }, []);

  const loadJuryMembers = async () => {
    setIsLoading(true);
    try {
      const members = await getJuryMembers();
      const order = (label: string) => {
        const s = (label || '').toLowerCase();
        if (s.includes('pgj') || s.includes('procurador-geral')) return 1;
        if (s.includes('associação piauiense') || s.includes('apm')) return 2;
        if (s.includes('sindicato')) return 3;
        if (s.includes('universidade federal') || s.includes('ufpi')) return 4;
        if (s.includes('universidade estadual') || s.includes('uespi')) return 5;
        if (s.includes('poder judiciário')) return 6;
        if (s.includes('oab') || s.includes('advogados')) return 7;
        if (s.includes('defensoria')) return 8;
        return 9;
      };
      const sorted = [...members].sort((a, b) => {
        const oa = order(a.seatLabel || '');
        const ob = order(b.seatLabel || '');
        if (oa !== ob) return oa - ob;
        return (a.created_at || 0) - (b.created_at || 0);
      });
      setJuryMembers(sorted);
      try {
        const { count: totalInscricoes } = await supabase
          .from('inscricoes')
          .select('*', { count: 'exact', head: true });
        const total = totalInscricoes || 0;
        const { data: evalRows } = await supabase
          .from('avaliacoes')
          .select('jurado_username');
        const counts: Record<string, number> = {};
        for (const r of (evalRows || [])) {
          const u = (r as any).jurado_username || '';
          if (!u) continue;
          counts[u] = (counts[u] || 0) + 1;
        }
        const perc: Record<string, number> = {};
        for (const m of members) {
          const c = counts[m.username] || 0;
          const pct = total > 0 ? (c / total) * 100 : 0;
          perc[m.username] = Number(pct.toFixed(2));
        }
        setProgressMap(perc);
      } catch {}
    } catch (error) {
      console.error('Erro ao carregar jurados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de jurados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

      const result = await addJuryMember(
        newJury.name,
        newJury.username,
        'admin',
        newJury.seatCode,
        newJury.seatLabel
      );

      if (result.success) {
        setNewJury({ username: '', name: '', seatCode: '', seatLabel: '' });
        setIsAddDialogOpen(false);
        await loadJuryMembers();
        
        toast({
          title: "Jurado cadastrado com sucesso!",
          description: "O jurado foi cadastrado com a senha temporária Mppi#2025!",
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
    setIsLoading(true);
    try {
      const result = await resetJuryPassword(username);
      
      if (result.success) {
        await loadJuryMembers();
        toast({
          title: "Senha resetada",
          description: "O jurado deverá usar a senha temporária Mppi#2025! e será solicitado a alterá-la no primeiro login",
        });
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveJury = async (username: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover o jurado "${name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await removeJuryMember(username);
      
      if (result.success) {
        await loadJuryMembers();
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
    } finally {
      setIsLoading(false);
    }
  };

  const occupiedSeatCodes = new Set(juryMembers.map(j => j.seatCode).filter(Boolean));

  return (
    <Card className="w-full">
      <CardHeader className="bg-transparent rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[hsl(var(--primary))]" />
            Comissão Julgadora
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
              
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Jurado</DialogTitle>
                  <DialogDescription>
                    Informe o e-mail do jurado e dados da vaga. A senha temporária será Mppi#2025!
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddJury} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="username">E-mail do jurado (login)</Label>
                    <Input
                      id="username"
                      type="email"
                      required
                      value={newJury.username}
                      onChange={(e) => setNewJury({ ...newJury, username: e.target.value })}
                      placeholder="Ex: joao.silva@exemplo.com"
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

                  <div className="space-y-2">
                    <Label>Vaga (Item 6 do Edital)</Label>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a vaga" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEATS.map((s) => (
                          <SelectItem key={s.code} value={s.code} disabled={occupiedSeatCodes.has(s.code)}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setNewJury({ username: '', name: '', seatCode: '', seatLabel: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {juryMembers.length === 0 ? (
          <Alert>
            <AlertDescription>
              {isAdmin ? (
                <>Nenhum jurado cadastrado. Use o botão "Cadastrar Jurado" para adicionar membros.</>
              ) : (
                <>Nenhum jurado cadastrado.</>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2">Nome</TableHead>
                  <TableHead className="py-2">Usuário</TableHead>
                  <TableHead className="py-2">Vaga</TableHead>
                  <TableHead className="py-2">Julgamentos</TableHead>
                  <TableHead className="py-2">Cadastrado</TableHead>
                  {isAdmin && <TableHead className="text-right py-2">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {juryMembers.map((jury) => (
                  <TableRow key={jury.username}>
                    <TableCell className="font-medium py-2">{jury.name}</TableCell>
                    <TableCell className="py-2">{jury.username}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className="text-xs">{jury.seatLabel || '—'}</Badge>
                    </TableCell>
                    <TableCell className="py-2">{Number(progressMap[jury.username] ?? 0).toFixed(2)}%</TableCell>
                    <TableCell className="py-2">
                      {new Date(jury.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right py-2">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(jury.username)}
                            title="Resetar senha"
                            disabled={isLoading}
                          >
                            <Key className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveJury(jury.username, jury.name)}
                            title="Remover jurado"
                            disabled={isLoading}
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
