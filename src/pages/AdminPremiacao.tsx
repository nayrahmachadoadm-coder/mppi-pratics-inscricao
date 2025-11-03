import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminPremiacao = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Premiação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-700">
              <p>Seção limpa para futura criação de conteúdo da Premiação.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPremiacao;