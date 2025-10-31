import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminRegulamento = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Ícone" className="h-6 w-6 opacity-80" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Regulamento – Comissão Julgadora</h1>
              <p className="text-sm text-gray-600">Sistema de Julgamento e Gestão de Inscrições</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/categorias')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar às categorias
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">DA COMISSÃO JULGADORA</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-gray-700">
              6.1 A Comissão Julgadora terá 09 (nove) integrantes, assim distribuídos:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>
                I – 02 (dois) membros escolhidos pelo Procurador-Geral de Justiça, e, dentre eles, designado o Presidente da Comissão, o qual escolherá o secretário dos trabalhos;
              </li>
              <li>II – 01 (um) membro indicado pela Associação Piauiense do Ministério Público;</li>
              <li>III – 01 (um) servidor indicado pelo Sindicato dos Servidores do MPPI;</li>
              <li>IV – 01 (um) representante indicado pela Universidade Federal do Piauí;</li>
              <li>V – 01 (um) representante indicado pela Universidade Estadual do Piauí;</li>
              <li>VI – 01 (um) representante indicado pelo Poder Judiciário do Estado do Piauí;</li>
              <li>VII – 01 (um) representante indicado pela OAB-PI; e</li>
              <li>VIII – 01 (um) representante indicado pela Defensoria Pública.</li>
            </ul>

            <p className="mt-4 text-gray-700">
              6.2 A Comissão Julgadora atribuirá pontuação para cada critério com valor representado por um número inteiro compreendido entre 0 (zero) e 5 (cinco) pontos, observadas as seguintes condições:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>
                I – a pontuação final obtida por cada prática ou projeto inscrito será a soma aritmética da pontuação de todos os critérios, constantes no item 3.3 deste regulamento, atribuída por cada jurado;
              </li>
              <li>II – as práticas e projetos vencedores serão aquelas que atingirem a maior pontuação final; e</li>
              <li>
                III – em caso de empate, vencerá a Prática e Projeto com maior pontuação no critério resolutividade, e, caso persistindo o empate, vencerá aquela com maior pontuação no critério replicabilidade.
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminRegulamento;