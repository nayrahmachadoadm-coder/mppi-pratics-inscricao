import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { generateRegulamentoPDF } from '@/lib/pdfGenerator';

const AdminRegulamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    try {
      toast({
        title: 'Gerando PDF...',
        description: 'Por favor, aguarde enquanto o PDF é gerado',
      });

      await generateRegulamentoPDF('regulamento-content');

      toast({
        title: 'PDF gerado com sucesso!',
        description: 'O download foi iniciado automaticamente',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF do regulamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar PDF do regulamento',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Ícone" className="h-6 w-6 opacity-80" />
            <div>
              <h1 className="text-base font-semibold text-gray-900">Regulamento – 9ª Edição do Prêmio Melhores Práticas</h1>
              <p className="text-xs text-gray-600">Sistema de Julgamento e Gestão de Inscrições</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">Edital nº 107/2025</CardTitle>
          </CardHeader>
          <CardContent id="regulamento-content" className="max-w-none text-justify text-xs">
            <p className="text-gray-700">Regulamenta a 9ª Edição do Prêmio Melhores Práticas do Ministério Público do Estado do Piauí.</p>

            <h3 id="sec-1" className="font-semibold mt-4 scroll-mt-24 text-sm">1. DA APRESENTAÇÃO</h3>
            <p className="text-gray-700">1.1 O Prêmio Melhores Práticas do Ministério Público do Estado do Piauí visa a estimular, reconhecer e a premiar boas experiências relacionadas à atuação institucional, finalística ou estruturante, que promovam práticas e projetos em prol da sociedade e do aprimoramento da atividade ministerial.</p>
            <p className="text-gray-700">1.2 A organização do Prêmio Melhores Práticas é de responsabilidade da Assessoria de Planejamento e Gestão, que coordenará todas as etapas do certame.</p>

            <h3 id="sec-2" className="font-semibold mt-4 scroll-mt-24 text-sm">2. DO OBJETIVO</h3>
            <p className="text-gray-700">2.1 Valorizar e difundir iniciativas inovadoras que gerem impacto positivo para a sociedade e para a gestão do MPPI, além de incentivar a replicabilidade das experiências de sucesso.</p>
            <p className="text-gray-700">2.2 Estimular práticas alinhadas aos Objetivos de Desenvolvimento Sustentável (ODS) da Agenda 2030 da ONU, fortalecendo o compromisso institucional com a sustentabilidade e os direitos fundamentais.</p>

            <h3 id="sec-3" className="font-semibold mt-4 scroll-mt-24 text-sm">3. DAS CATEGORIAS E CRITÉRIOS</h3>
            <p className="text-gray-700">3.1 A 9ª Edição contemplará as seguintes áreas e categorias:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I - Área Finalística: Categoria Práticas; Categoria Projetos</li>
              <li>II - Área Estruturante: Categoria Práticas; Categoria Projetos</li>
              <li>III - Categoria Especial: Práticas com Uso de Inteligência Artificial na otimização do ambiente de trabalho e/ou aprimoramento da atividade finalística ou meio.</li>
            </ul>
            <p className="text-gray-700">3.2 Cada área do Prêmio Melhores Práticas do Ministério Público do Estado do Piauí contemplará 01 (uma) categoria: I - categoria Prática.</p>
            <p className="text-gray-700">3.3 As melhores práticas serão escolhidas e julgadas mediante avaliação dos seguintes critérios: Projetos e Práticas Finalísticas.</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I - cooperação: atuação colaborativa intra e interinstitucional ou em parceria com a sociedade civil.</li>
              <li>II - inovação: introdução de novidade que resulte em produtos, serviços ou agregação de funcionalidades, com ganho de qualidade ou desempenho.</li>
              <li>III - resolutividade: solução efetiva e concreta de um problema (eficácia da ação).</li>
              <li>IV - impacto social: dimensão e profundidade da mudança gerada, com foco no número de pessoas beneficiadas e no efeito transformador para comunidade/instituição.</li>
              <li>V - Alinhamento aos Objetivos de Desenvolvimento Sustentável (ODS) da Organização das Nações Unidas (ONU): contribuição mensurável para um ou mais dos Objetivos de Desenvolvimento Sustentável.</li>
              <li>VI - Replicabilidade: capacidade de a iniciativa ser reaplicada ou adaptada em outras unidades, áreas ou contextos institucionais, com viabilidade prática e potencial de gerar resultados semelhantes ou superiores.</li>
            </ul>

            <h3 id="sec-4" className="font-semibold mt-4 scroll-mt-24 text-sm">4. DOS REQUISITOS DE PARTICIPAÇÃO</h3>
            <p className="text-gray-700">4.1 Poderão participar da 9ª Edição do Prêmio Melhores Práticas do Ministério Público do Estado do Piauí membros e servidores do MPPI, com atuação nas áreas fim e meio.</p>
            <p className="text-gray-700">4.2 Não poderão concorrer projetos ou práticas que já tenham sido vencedores em edições anteriores do Prêmio Melhores Práticas do MPPI, sendo tais inscrições automaticamente indeferidas.</p>

            <h3 id="sec-5" className="font-semibold mt-4 scroll-mt-24 text-sm">5. DA INSCRIÇÃO</h3>
            <p className="text-gray-700">5.1 As inscrições da 9ª Edição do Prêmio Melhores Práticas do Ministério Público do Estado do Piauí serão realizadas, no período de 20 de setembro a 30 de outubro de 2025, devendo o candidato preencher, pelo link <a href="https://mppi-pratics-inscricao.lovable.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://mppi-pratics-inscricao.lovable.app/</a> a ficha de inscrição.</p>
            <p className="text-gray-700">5.2 Cada participante poderá inscrever até 03 (três) iniciativas, sendo: 01 (uma) prática; 01 (um) projeto; e, adicionalmente, 01 (uma) inscrição na Categoria Especial de Inteligência Artificial.</p>
            <p className="text-gray-700">5.3 Poderão ser inscritas práticas e projetos que tenham sido efetivamente executadas pelo membro e/ou servidor e que sejam de sua autoria.</p>
            <p className="text-gray-700">5.4 Havendo mais de uma inscrição na mesma categoria, será considerada a que primeira foi enviada.</p>
            <p className="text-gray-700">5.5 Somente projetos institucionalizados, ou seja, elaborados de acordo com o Ato PGJ/PI Nº 1254/2022, que dispõe sobre a Metodologia de Gerenciamento de Projetos no âmbito do Ministério Público do Estado do Piauí e sobre práticas inscritas no Banco de Práticas do MPPI, concorrerão ao Prêmio Melhores Práticas.</p>
            <p className="text-gray-700">5.6 As Práticas e Projetos inscritos podem ter sido concluídos ou estar em execução, desde que seja possível mensurar os resultados nos últimos 03 anos.</p>
            <p className="text-gray-700">5.7 As inscrições da 9ª Edição do Prêmio Melhores Práticas do Ministério Público do Estado do Piauí são gratuitas.</p>
            <p className="text-gray-700">5.8 As inscrições serão analisadas pelo Presidente da Comissão Julgadora designada pela Procuradora-Geral de Justiça para deferimento ou não.</p>
            <p className="text-gray-700">5.9 Serão indeferidas as inscrições que não atenderem ao disposto neste regulamento, incluindo aquelas cuja respectiva ficha de inscrição esteja preenchida incorretamente.</p>
            <p className="text-gray-700">5.10 No caso do indeferimento da inscrição, o interessado poderá interpor um pedido de reconsideração ao Presidente da Comissão Julgadora, no prazo contido no Anexo Único, que decidirá, de forma fundamentada.</p>
            <p className="text-gray-700">5.11 A inscrição na 9ª Edição do Prêmio Melhores Práticas do Ministério Público do Estado do Piauí implica aceitação tácita de eventual publicação, divulgação e utilização das práticas inscritas, independentemente de premiação, assim como a autorização do uso de imagens, textos, vozes e nomes, em qualquer meio de divulgação e promoção (interno, externo e/ou de imprensa), sem ônus ou termo de retribuição.</p>
            <p className="text-gray-700">5.12 Os membros e servidores autores das práticas e projetos que concorrerem ao Prêmio Melhores Práticas, ao realizarem a mera inscrição neste certame, declaram e reconhecem expressamente que as ações que resultaram nas práticas e projetos inscritos foram executadas em nome do Ministério Público do Estado do Piauí, pelo que os direitos autorais das mesmas a este pertencem, sendo permitido à referida instituição dispor, usar e gozar destas obras intelectuais como bem lhe dispuser.</p>

            <h3 id="sec-6" className="font-semibold mt-6 scroll-mt-24 text-sm">6. DA COMISSÃO JULGADORA</h3>
            <p className="text-gray-700">6.1 A Comissão Julgadora terá 09 (nove) integrantes, assim distribuídos:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I – 02 (dois) membros escolhidos pelo Procurador-Geral de Justiça, e, dentre eles, designado o Presidente da Comissão, o qual escolherá o secretário dos trabalhos;</li>
              <li>II – 01 (um) membro indicado pela Associação Piauiense do Ministério Público;</li>
              <li>III – 01 (um) servidor indicado pelo Sindicato dos Servidores do MPPI;</li>
              <li>IV – 01 (um) representante indicado pela Universidade Federal do Piauí;</li>
              <li>V – 01 (um) representante indicado pela Universidade Estadual do Piauí;</li>
              <li>VI – 01 (um) representante indicado pelo Poder Judiciário do Estado do Piauí;</li>
              <li>VII – 01 (um) representante indicado pela OAB-PI; e</li>
              <li>VIII – 01 (um) representante indicado pela Defensoria Pública.</li>
            </ul>
            <p className="mt-4 text-gray-700">6.2 A Comissão Julgadora atribuirá pontuação para cada critério com valor representado por um número inteiro compreendido entre 0 (zero) e 5 (cinco) pontos, observadas as seguintes condições:</p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>I – a pontuação final obtida por cada prática ou projeto inscrito será a soma aritmética da pontuação de todos os critérios, constantes no item 3.3 deste regulamento, atribuída por cada jurado;</li>
              <li>II – as práticas e projetos vencedores serão aquelas que atingirem a maior pontuação final; e</li>
              <li>III – em caso de empate, vencerá a Prática e Projeto com maior pontuação no critério resolutividade, e, caso persistindo o empate, vencerá aquela com maior pontuação no critério replicabilidade.</li>
            </ul>

            <h3 id="sec-7" className="font-semibold mt-6 scroll-mt-24 text-sm">7. DA SELEÇÃO E PREMIAÇÃO</h3>
            <p className="text-gray-700">7.1 O processo de seleção e premiação será realizado nas seguintes etapas:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>
                I - 1ª etapa - Triagem: os trabalhos inscritos passarão por verificação por parte do Presidente da Comissão Julgadora quanto ao cumprimento dos requisitos básicos para inscrição e participação, com publicação em Diário Oficial Eletrônico das práticas inscritas e projetos inscritos.
              </li>
              <li>
                II - 2ª etapa - Julgamento: as práticas e projetos triados serão submetidos à avaliação da Comissão Julgadora.
              </li>
              <li>
                III - 3ª etapa - Divulgação dos finalistas: a Comissão Julgadora divulgará no Diário Oficial Eletrônico do Ministério Público do Estado do Piauí, sem indicar a ordem de classificação, os três trabalhos mais bem avaliados em cada categoria, que serão convocados para a cerimônia de premiação.
              </li>
              <li>
                IV - 4ª etapa - Voto Popular:
                <ul className="list-none pl-6 mt-2 text-gray-700 space-y-1">
                  <li>a) As práticas e projetos finalistas de cada categoria serão divulgados no site institucional do MPPI e em suas redes sociais oficiais, em seção específica do "Prêmio Melhores Práticas".</li>
                  <li>b) O público poderá votar eletronicamente em sua iniciativa preferida, no prazo estabelecido no cronograma (Anexo Único).</li>
                  <li>c) O trabalho mais votado receberá o Prêmio de Destaque pelo Voto Popular, com entrega de troféu especial e certificado, independentemente da classificação final atribuída pela Comissão Julgadora.</li>
                  <li>d) O voto popular terá caráter exclusivamente honorífico e não interferirá na ordem de classificação técnica definida pela Comissão Julgadora.</li>
                </ul>
              </li>
              <div id="premiacao" className="scroll-mt-24"></div>
              <li>
                V - 5ª etapa – Premiação: realizada em cerimônia de premiação (a se realizar conforme cronograma - Anexo Único), com os seguintes prêmios:
                <ul className="list-none pl-6 mt-2 text-gray-700 space-y-1">
                  <li>a) 1º colocado de cada categoria: 01 (um) troféu e R$ 1.200,00 (um mil e duzentos reais).</li>
                  <li>b) 2º colocado de cada categoria: 01 (um) troféu e R$ 500,00 (quinhentos reais).</li>
                  <li>c) 3º colocado de cada categoria: 01 (um) troféu e R$ 300,00 (trezentos reais).</li>
                </ul>
              </li>
              <li>
                VI - 6ª Etapa – Homologação: divulgação do resultado final em ordem de premiação no Diário Oficial Eletrônico e no site do Ministério Público do Estado do Piauí.
              </li>
            </ul>
            <p className="text-gray-700">7.2. Será concedido 01 (um) troféu para cada projeto classificado na forma do inciso IV do item</p>
            <p className="text-gray-700">7.3. Durante o período compreendido entre o início das inscrições e a data da premiação, a Comissão Julgadora poderá, a seu critério, averiguar a veracidade e consistência das informações apresentadas pelos candidatos, bem como solicitar aos mesmos informações e documentação comprobatória complementar acerca da prática inscrita.</p>
            <div id="voto-popular" className="scroll-mt-24"></div>
            <p className="text-gray-700">7.4 Voto Popular:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I - As práticas e projetos finalísticos finalistas de cada categoria serão divulgados no site institucional do MPPI e em suas redes sociais oficiais.</li>
              <li>II - O público poderá votar eletronicamente em sua iniciativa preferida, no prazo estabelecido no cronograma (Anexo Único).</li>
            </ul>
            <p className="text-gray-700">7.5 O não atendimento das solicitações, bem como qualquer outro óbice à atuação da Comissão Julgadora, ensejará a desclassificação da prática ou projeto inscrito no Prêmio.</p>
            <p className="text-gray-700">7.6 A Procuradoria Geral de Justiça, por meio da Assessoria de Planejamento e Gestão e da Coordenadoria de Comunicação Social, organizará a confecção e divulgação de um e-book digital contendo os finalistas do Prêmio, com o objetivo de registrar e difundir as iniciativas premiadas e de destaque, incentivando sua replicação.</p>

            <h3 id="sec-8" className="font-semibold mt-6 scroll-mt-24 text-sm">8. DAS DISPOSIÇÕES GERAIS</h3>
            <p className="text-gray-700">8.1 A Coordenadoria de Comunicação Social - CCS deverá fornecer apoio técnico aos projetos e práticas, que tenham por veículo as redes sociais (como medir o alcance) e todas as informações e documentos requisitados pela Comissão.</p>
            <p className="text-gray-700">8.2. Quaisquer dúvidas sobre a 9ª Edição do Prêmio Melhores Práticas do Ministério Público do Estado do Piauí poderão ser esclarecidas por meio dos telefones (86) 2222-8000 - Ramal 8015 (Assessoria de Planejamento e Gestão) ou por meio da instauração de procedimento de gestão administrativa no sistema SEI, o qual deverá ser encaminhado à ASSESPPLAGES.</p>
            <p className="text-gray-700">8.3. A premiação de natureza pecuniária será custeada com recursos da Associação de Membros do Ministério Público do Estado do Piauí (APMP) e do Sindicato dos Servidores do Ministério Público do Estado do Piauí (SINDSEMP/PI).</p>
            <p className="text-gray-700">8.4. Os casos omissos serão resolvidos pela Presidente da Comissão Julgadora.</p>
            <p className="text-gray-700 mt-2">Teresina (PI), 17 de setembro de 2025.</p>
            <div className="mt-10 text-center">
              <p className="text-gray-700 font-semibold">Cláudia Pessoa Marques da Rocha Seabra – Procuradora-Geral de Justiça</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle id="anexo" className="text-xl font-semibold text-center">Anexo Único – Cronograma</CardTitle>
          </CardHeader>
          <CardContent className="max-w-none text-xs">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2">Etapa</th>
                  <th className="text-left p-2">Período</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Lançamento do edital</td>
                  <td className="p-2">19/09/2025</td>
                </tr>
                <tr>
                  <td className="p-2">Período de inscrição</td>
                  <td className="p-2">20/09 a 30/10/2025</td>
                </tr>
                <tr>
                  <td className="p-2">Divulgação das práticas inscritas deferidas</td>
                  <td className="p-2">07/11/2025</td>
                </tr>
                <tr>
                  <td className="p-2">Prazo de pedido de reconsideração</td>
                  <td className="p-2">05 dias úteis, contados a partir da divulgação.</td>
                </tr>
                <tr>
                  <td className="p-2">Divulgação da lista definitiva dos inscritos</td>
                  <td className="p-2">17/11/2025</td>
                </tr>
                <tr>
                  <td className="p-2">Divulgação dos finalistas</td>
                  <td className="p-2">28/11/2025</td>
                </tr>
                <tr>
                  <td className="p-2">Voto Popular</td>
                  <td className="p-2">28/11/2025 a 08/12/2025</td>
                </tr>
                <tr>
                  <td className="p-2">Cerimônia de premiação</td>
                  <td className="p-2">Dezembro de 2025 – comemoração do Dia Nacional do Ministério Público</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminRegulamento;