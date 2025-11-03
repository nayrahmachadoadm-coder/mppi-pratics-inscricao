import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminPremiacao = () => {
  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="min-h-[72vh] flex items-center justify-center">
          <main className="w-full max-w-3xl">
            <Card className="shadow-lg border rounded-xl">
              <CardHeader className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] text-[hsl(var(--primary-foreground))] rounded-t-xl">
                <CardTitle className="text-sm">Premiação</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    Conforme cronograma, a premiação ocorrerá em <strong>dezembro</strong>, na semana em comemoração ao <strong>Dia Nacional do Ministério Público</strong>.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Em breve divulgaremos detalhes sobre a cerimônia e os finalistas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPremiacao;