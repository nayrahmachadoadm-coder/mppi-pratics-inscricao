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
              <h1 className="text-base font-semibold text-gray-900">Regulamento – 10ª Edição do Prêmio Melhores Práticas</h1>
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
            <CardTitle className="text-xl font-semibold text-center">EDITAL Nº 88/2026</CardTitle>
          </CardHeader>
          <CardContent id="regulamento-content" className="max-w-none text-justify text-xs">
            <p className="text-gray-700">Regulamenta a 10ª Edição do Prêmio Melhores Práticas do Ministério Público do Estado do Piauí.</p>

            <h3 id="sec-1" className="font-semibold mt-4 scroll-mt-24 text-sm">1. DA APRESENTAÇÃO</h3>
            <p className="text-gray-700">1.1 O Prêmio Melhores Práticas do Ministério Público do Estado do Piauí tem por finalidade estimular, reconhecer, valorizar e premiar práticas e projetos relacionados à atuação institucional, finalística ou estruturante, que apresentem resultados relevantes para a sociedade ou contribuam para o aprimoramento da atividade ministerial.</p>
            <p className="text-gray-700">1.2 A organização do Prêmio Melhores Práticas será de responsabilidade da Assessoria de Planejamento e Gestão — ASSESPPLAGES, a quem competirá coordenar as etapas do certame e prestar o apoio técnico e administrativo necessário à Comissão Julgadora.</p>

            <h3 id="sec-2" className="font-semibold mt-4 scroll-mt-24 text-sm">2. DOS OBJETIVOS</h3>
            <p className="text-gray-700">2.1 São objetivos do Prêmio Melhores Práticas:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I — reconhecer e valorizar práticas e projetos que produzam resultados concretos e contribuam para o aperfeiçoamento da atuação do Ministério Público do Estado do Piauí;</li>
              <li>II — identificar e difundir iniciativas inovadoras, resolutivas e passíveis de replicação em outras unidades ou contextos institucionais;</li>
              <li>III — incentivar o compartilhamento de experiências, conhecimentos, métodos e soluções desenvolvidos no âmbito do MPPI;</li>
              <li>IV — estimular a atuação integrada entre unidades ministeriais e a cooperação com instituições públicas, privadas e organizações da sociedade civil.</li>
            </ul>

            <h3 id="sec-3" className="font-semibold mt-4 scroll-mt-24 text-sm">3. DAS ÁREAS, DAS CATEGORIAS E DOS CONCEITOS</h3>
            <p className="text-gray-700">3.1. A 10ª Edição do Prêmio Melhores Práticas contemplará iniciativas inscritas nas modalidades Práticas Institucionais e Projetos Institucionais, desenvolvidas nas áreas finalística ou estruturante, observadas as seguintes categorias:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I — Práticas Finalísticas;</li>
              <li>II — Projetos Finalísticos;</li>
              <li>III — Práticas Estruturantes;</li>
              <li>IV — Projetos Estruturantes;</li>
            </ul>
            <p className="text-gray-700">3.2 Para os fins deste Edital, consideram-se:</p>
            <p className="text-gray-700">3.2.1 Considera-se boa prática institucional, nos termos do Ato PGJ/PI nº 1.335/2023, o método, fluxo, técnica, experiência, procedimento ou forma de atuação, de caráter contínuo, executado por unidade ministerial e destinado à solução de problema específico, ao aperfeiçoamento da atuação institucional ou à melhoria dos serviços prestados pelo Ministério Público, que apresente resultados concretos e potencial de replicabilidade.</p>
            <p className="text-gray-700">3.2.2 Considera-se projeto institucional o esforço temporário e estruturado destinado à criação de produto, serviço ou resultado específico, com escopo definido, planejamento formal, cronograma, governança, monitoramento e submissão à Metodologia de Gerenciamento de Projetos do Ministério Público do Estado do Piauí, regulamentada pelo Ato PGJ/PI nº 1.254/2022 e suas alterações posteriores.</p>
            <p className="text-gray-700">3.3 A mesma iniciativa não poderá ser inscrita simultaneamente em mais de uma categoria.</p>
            <p className="text-gray-700">4. DOS CRITÉRIOS DE AVALIAÇÃO</p>
            <p className="text-gray-700">4.1 As práticas e os projetos serão avaliados de acordo com os seguintes critérios:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I — cooperação: grau de articulação e de colaboração entre unidades do MPPI, instituições parceiras ou organizações da sociedade civil;</li>
              <li>II — inovação: adoção de solução, método, processo, ferramenta ou forma de atuação nova ou significativamente aperfeiçoada, capaz de produzir ganho de qualidade, eficiência ou desempenho;</li>
              <li>III — resolutividade: capacidade da iniciativa de solucionar, prevenir, reduzir ou enfrentar de maneira concreta o problema que motivou sua implementação;</li>
              <li>IV — impacto social ou institucional: dimensão, relevância e profundidade das mudanças produzidas para a sociedade, para o público beneficiado ou para o funcionamento da Instituição; e</li>
              <li>V — replicabilidade: possibilidade de a iniciativa ser reaplicada ou adaptada em outras unidades, áreas ou contextos institucionais, considerando sua viabilidade prática e seu potencial de produzir resultados semelhantes.</li>
            </ul>
            <p className="text-gray-700">4.2 Cada critério receberá pontuação inteira de 0 (zero) a 5 (cinco), de acordo com a seguinte escala: 0 ponto: critério não demonstrado; 1 ponto: atendimento incipiente; 2 pontos: atendimento parcial ou pouco consistente; 3 pontos: atendimento satisfatório; 4 pontos: atendimento relevante e bem demonstrado; e 5 pontos: atendimento excelente, amplamente demonstrado por dados, resultados ou evidências.</p>
            <p className="text-gray-700">4.3 A pontuação máxima atribuível por integrante da Comissão Julgadora será de 25 (vinte e cinco) pontos.</p>

            <h3 id="sec-5" className="font-semibold mt-4 scroll-mt-24 text-sm">5. DOS REQUISITOS DE PARTICIPAÇÃO</h3>
            <p className="text-gray-700">5.1 Poderão participar da 10ª Edição do Prêmio Melhores Práticas membros, servidores e assessores do Ministério Público do Estado do Piauí, com atuação nas áreas finalística ou estruturante.</p>
            <p className="text-gray-700">5.2 As inscrições poderão ser individuais ou coletivas, devendo ser indicado, nas iniciativas desenvolvidas em equipe, um responsável pela inscrição e identificados os demais participantes.</p>
            <p className="text-gray-700">5.3 Somente poderão ser inscritas práticas e projetos que tenham contado com a participação efetiva do proponente em sua elaboração, implementação ou execução.</p>
            <p className="text-gray-700">5.4 Não poderão concorrer práticas ou projetos que já tenham sido vencedores em edições anteriores do Prêmio Melhores Práticas do MPPI, sendo a respectiva inscrição automaticamente indeferida.</p>

            <h3 id="sec-6" className="font-semibold mt-4 scroll-mt-24 text-sm">6. DAS INSCRIÇÕES</h3>
            <p className="text-gray-700">6.1 As inscrições serão realizadas gratuitamente no período de 08 de setembro a 08 de outubro de 2026, mediante preenchimento do formulário eletrônico disponível no endereço: <a href="https://mppi-praticas-inscricao.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://mppi-praticas-inscricao.vercel.app/</a></p>
            <p className="text-gray-700">6.2 Cada participante poderá inscrever até 2 (duas) iniciativas, observados os seguintes limites:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I — 1 (uma) prática, na área finalística ou estruturante;</li>
              <li>II — 1 (um) projeto, na área finalística ou estruturante; e</li>
            </ul>
            <p className="text-gray-700">6.3 Havendo mais de uma inscrição do mesmo participante em uma das modalidades previstas nos incisos do item 6.2, será considerada válida apenas a primeira inscrição encaminhada.</p>
            <p className="text-gray-700">6.4 Para concorrer ao Prêmio:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I — as práticas deverão estar regularmente inscritas no Banco de Práticas do MPPI, nos termos do Ato PGJ/PI nº 1.335/2023; e</li>
              <li>II — os projetos deverão estar institucionalizados de acordo com a Metodologia de Gerenciamento de Projetos do MPPI, regulamentada pelo Ato PGJ/PI nº 1.254/2022 e suas alterações posteriores (Ato PGJ/PI nº 1595/2025).</li>
            </ul>
            <p className="text-gray-700">6.5 Poderão ser inscritas iniciativas concluídas ou em execução, desde que apresentem resultados mensuráveis obtidos nos 3 (três) anos anteriores ao encerramento do período de inscrições.</p>
            <p className="text-gray-700">6.7 Encerrado o prazo de inscrição, caberá à Presidência da Comissão Julgadora realizar a triagem das iniciativas e verificar o atendimento aos requisitos deste Edital.</p>
            <p className="text-gray-700">6.7.1. Na triagem, a Assessoria de Planejamento e Gestão verificará, além dos demais requisitos deste Edital, a regular inscrição das práticas no Banco de Práticas do MPPI, a institucionalização dos projetos conforme a metodologia aplicável e a inexistência de premiação da mesma iniciativa em edições anteriores do Prêmio Melhores Práticas do MPPI.</p>
            <p className="text-gray-700">6.7.2. O registro, pelo sistema eletrônico, de declaração negativa, informação inconsistente, ausência de documento ou outra ocorrência relacionada aos requisitos de participação e habilitação não implica deferimento da inscrição, devendo a situação ser submetida à análise da Presidência da Comissão Julgadora durante a triagem.</p>

            <h3 id="sec-7" className="font-semibold mt-6 scroll-mt-24 text-sm">7. DA COMISSÃO JULGADORA</h3>
            <p className="text-gray-700">7.1 A Comissão Julgadora será composta por 9 (nove) integrantes, assim distribuídos: 2 (dois) membros escolhidos pelo Procurador-Geral, 1 (um) membro da APMP, 1 (um) servidor do SINDSEMP/PI, e representantes da UFPI, UESPI, Poder Judiciário, OAB/PI e Defensoria Pública.</p>
            <p className="text-gray-700">7.2 A Presidência da Comissão designará um de seus integrantes para exercer a função de secretário dos trabalhos.</p>
            <p className="text-gray-700">7.3 Cada integrante da Comissão atribuirá pontuação de 0 (zero) a 5 (cinco) para cada um dos critérios previstos no item 4.1.</p>
            <p className="text-gray-700">7.4 A nota atribuída por cada julgador à iniciativa corresponderá à soma das pontuações dos critérios de avaliação.</p>

            <h3 id="sec-8" className="font-semibold mt-6 scroll-mt-24 text-sm">8. DA PONTUAÇÃO E DA CLASSIFICAÇÃO FINAL</h3>
            <p className="text-gray-700">8.1 A classificação final das iniciativas em cada categoria será definida mediante a composição da Avaliação Técnica da Comissão Julgadora e do Voto Popular , observados os seguintes pesos:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I — Avaliação Técnica da Comissão Julgadora: 80% (oitenta por cento) da pontuação final; e</li>
              <li>II — Voto Popular: 20% (vinte por cento) da pontuação final.</li>
            </ul>
            <p className="text-gray-700">8.2 A nota da avaliação técnica corresponderá à média aritmética das notas válidas atribuídas pelos integrantes da Comissão Julgadora.</p>
            <p className="text-gray-700">8.2.1. A média aritmética da avaliação técnica será apurada exclusivamente com base nas notas válidas efetivamente registradas e finalizadas no sistema eletrônico do certame pelos integrantes da Comissão Julgadora, dentro do prazo estabelecido para o julgamento técnico.</p>
            <p className="text-gray-700">8.2.2. Para os fins deste Edital, considera-se nota válida aquela atribuída em conformidade com os critérios, a escala de pontuação e as regras de avaliação previstas neste Edital, regularmente registrada e finalizada pelo respectivo julgador no sistema eletrônico do certame.</p>
            <p className="text-gray-700">8.2.3. A ausência de registro de nota por integrante da Comissão Julgadora, por qualquer motivo, inclusive impedimento, suspeição, ausência, abstenção ou omissão, não será computada como nota zero nem integrará o divisor utilizado para o cálculo da média aritmética.</p>
            <p className="text-gray-700">8.3 Para fins de composição da pontuação final, a nota técnica será convertida para uma escala de 0 (zero) a 100 (cem) pontos, mediante a seguinte fórmula:<br/>Nota Técnica = (média das notas válidas atribuídas pela Comissão Julgadora / 25) x 100</p>
            <p className="text-gray-700">8.4 A pontuação referente ao Voto Popular será calculada separadamente em cada categoria, considerando-se a quantidade de votos válidos recebidos por cada iniciativa finalista.</p>
            <p className="text-gray-700">8.5 A iniciativa que obtiver o maior número de votos populares válidos em sua categoria receberá 100 (cem) pontos na Nota Popular, sendo a pontuação das demais iniciativas calculada proporcionalmente, mediante a seguinte fórmula:<br/>Nota Popular = (número de votos válidos da iniciativa ÷ maior número de votos válidos obtido na categoria) × 100</p>
            <p className="text-gray-700">8.6 A Pontuação Final de cada iniciativa será calculada de acordo com a seguinte fórmula:<br/>Pontuação Final = (Nota Técnica × 0,80) + (Nota Popular × 0,20)</p>
            <p className="text-gray-700">8.7 Após a aplicação da fórmula prevista no item anterior, as iniciativas serão classificadas, em cada categoria, em ordem decrescente de Pontuação Final, sendo consideradas vencedoras as 3 (três) iniciativas que obtiverem as maiores pontuações.</p>
            <p className="text-gray-700">8.8 A pontuação final será considerada com até 2 (duas) casas decimais.</p>
            <p className="text-gray-700">8.9 Em caso de empate na Pontuação Final, serão aplicados, sucessivamente, os seguintes critérios de desempate:</p>
            <ul className="list-none pl-6 text-gray-700 space-y-1">
              <li>I — maior Nota Técnica atribuída pela Comissão Julgadora;</li>
              <li>II — maior nota no critério cooperação;</li>
              <li>III — maior nota no critério resolutividade;</li>
              <li>IV — maior nota no critério impacto social ou institucional;</li>
              <li>V — maior nota no critério replicabilidade;</li>
              <li>VI — maior nota no critério inovação; e</li>
              <li>VII — persistindo o empate, decisão fundamentada da Comissão Julgadora.</li>
            </ul>

            <h3 id="sec-9" className="font-semibold mt-6 scroll-mt-24 text-sm">9. DO VOTO POPULAR</h3>
            <p className="text-gray-700">9.1 Concluído o julgamento técnico, serão selecionadas, em cada categoria, as 3 (três) iniciativas que obtiverem as maiores Notas Técnicas, as quais serão consideradas finalistas e participarão da etapa de Voto Popular.</p>
            <p className="text-gray-700">9.1.1. Havendo empate na Nota Técnica que impeça a definição das 3 (três) iniciativas finalistas, serão aplicados, sucessivamente, os critérios previstos no item 8.9, incisos II a VI.</p>
            <p className="text-gray-700">9.8 Após a composição da Nota Técnica e da Nota Popular, será calculada a Pontuação Final, que definirá, em cada categoria, o 1º, 2º e 3º lugares.</p>
            
            <h3 id="sec-10" className="font-semibold mt-6 scroll-mt-24 text-sm">10. DA SELEÇÃO E DA PREMIAÇÃO</h3>
            <p className="text-gray-700">10.1 O processo de seleção e premiação compreenderá as seguintes etapas: Triagem, Análise dos pedidos, Julgamento técnico, Divulgação dos finalistas, Voto Popular, Cerimônia de premiação, Homologação.</p>
            <p className="text-gray-700 mt-2">Teresina (PI), ___ de __________ de 2026.</p>
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
                  <td className="p-2">04/09/2026</td>
                </tr>
                <tr>
                  <td className="p-2">Período de inscrições</td>
                  <td className="p-2">08/09/2026 a 08/10/2026</td>
                </tr>
                <tr>
                  <td className="p-2">Divulgação da relação provisória das inscrições deferidas e indeferidas</td>
                  <td className="p-2">13/10/2026</td>
                </tr>
                <tr>
                  <td className="p-2">Prazo para pedido de reconsideração</td>
                  <td className="p-2">14/10/2026 a 16/10/2026</td>
                </tr>
                <tr>
                  <td className="p-2">Divulgação da relação definitiva das inscrições habilitadas</td>
                  <td className="p-2">20/10/2026</td>
                </tr>
                <tr>
                  <td className="p-2">Julgamento técnico pela Comissão Julgadora</td>
                  <td className="p-2">20/10/2026 a 30/10/2026</td>
                </tr>
                <tr>
                  <td className="p-2">Divulgação dos finalistas</td>
                  <td className="p-2">03/11/2026</td>
                </tr>
                <tr>
                  <td className="p-2">Votação popular</td>
                  <td className="p-2">04/11/2026 a 13/11/2026</td>
                </tr>
                <tr>
                  <td className="p-2">Cerimônia de premiação</td>
                  <td className="p-2">Dezembro de 2026, em data a ser divulgada, preferencialmente durante as comemorações do Dia Nacional do Ministério Público</td>
                </tr>
                <tr>
                  <td className="p-2 border-t text-gray-700">Publicação e homologação do resultado final</td>
                  <td className="p-2 border-t text-gray-700">Após a cerimônia de premiação, em data a ser divulgada</td>
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
