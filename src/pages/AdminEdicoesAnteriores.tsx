import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminEdicoesAnteriores = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Edições Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">Em breve: histórico das edições anteriores e vencedores.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminEdicoesAnteriores;