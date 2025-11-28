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
              <CardContent className="p-6 space-y-6 text-sm text-gray-800">
                <section>
                  <h2 className="font-semibold text-gray-900 mb-2">Local e Data da Cerimônia</h2>
                  <p>
                    A cerimônia de premiação será realizada na <strong>Sede Leste do Ministério Público do Estado do Piauí</strong>,
                    no dia <strong>18 de dezembro de 2025</strong>, dentro das comemorações pelo <strong>Dia Nacional do Ministério Público</strong>.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-gray-900 mb-2">Categorias Premiadas</h2>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Projetos Finalísticos</li>
                    <li>Projetos Estruturantes</li>
                    <li>Práticas Finalísticas</li>
                    <li>Práticas Estruturantes</li>
                    <li>Categoria Especial – Inteligência Artificial</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-semibold text-gray-900 mb-2">Valores da Premiação</h2>
                  <p>
                    Os valores destinados às premiações seguem o previsto no edital vigente e nas normas administrativas.
                    A divulgação dos montantes por colocação será realizada juntamente com o comunicado oficial dos resultados.
                  </p>
                  <div className="mt-2 rounded border bg-gray-50 p-3 text-xs text-gray-700">
                    <p className="mb-1">Estrutura indicativa (conforme edital):</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>1º lugar: premiação financeira e certificado</li>
                      <li>2º lugar: premiação financeira e certificado</li>
                      <li>3º lugar: premiação financeira e certificado</li>
                      <li>Menções honrosas: conforme critérios do edital</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="font-semibold text-gray-900 mb-2">Regras de Divulgação e Homologação</h2>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Os resultados são submetidos à homologação da Comissão Organizadora e à autoridade competente.</li>
                    <li>Após a homologação, a divulgação oficial é realizada nos canais institucionais do MPPI.</li>
                    <li>Qualquer comunicação prévia ao comunicado oficial tem caráter meramente informativo.</li>
                    <li>Eventuais ajustes de categorias, prazos ou resultados seguem o regulamento e atos administrativos correlatos.</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-600">Para detalhes, consulte o regulamento vigente e os comunicados oficiais.</p>
                </section>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPremiacao;
