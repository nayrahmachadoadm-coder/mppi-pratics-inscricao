import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { getUserSession, updateUserPassword } from '@/lib/userAuth';

const UserPasswordChange: React.FC = () => {
  const navigate = useNavigate();
  const session = getUserSession();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const pattern = /^[A-Za-z0-9]{6}$/;
    if (!pattern.test(newPassword)) {
      setError('A nova senha deve ter exatamente 6 caracteres alfanuméricos');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      if (!session) {
        setError('Sessão inválida. Faça login novamente.');
        return;
      }
      const res = updateUserPassword(session.username, newPassword, true);
      if (!res.success) {
        setError(res.error || 'Erro ao atualizar senha');
        return;
      }
      navigate('/admin/categorias');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Definir nova senha</CardTitle>
          <CardDescription>
            Defina sua senha permanente (6 caracteres alfanuméricos) para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newpass">Nova senha</Label>
              <Input id="newpass" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmpass">Confirmar nova senha</Label>
              <Input id="confirmpass" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPasswordChange;