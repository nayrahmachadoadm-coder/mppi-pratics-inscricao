import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, User, Target, CheckCircle, Users, Lightbulb, CheckSquare, Heart, Globe, Copy } from 'lucide-react';
import { generatePDF } from '@/lib/pdfGenerator';
import { sendEmailWithPDF } from '@/lib/emailService';
import { saveInscricao } from '@/lib/supabaseService';
import Step1 from '@/components/FormSteps/Step1';

interface FormData {
  // Dados do proponente
  nomeCompleto: string;
  cargoFuncao: string;
  matricula: string;
  unidadeSetor: string;
  telefoneInstitucional: string;
  emailInstitucional: string;
  equipeEnvolvida: string;
  
  // Informações sobre a inscrição
  area: string;
  tituloIniciativa: string;
  anoInicioExecucao: string;
  situacaoAtual: string;
  dataConclusao?: string;
  
  // Descrição da prática/projeto
  resumoExecutivo: string;
  problemaNecessidade: string;
  objetivosEstrategicos: string;
  etapasMetodologia: string;
  resultadosAlcancados: string;
  
  // Critérios de avaliação
  cooperacao: string;
  inovacao: string;
  resolutividade: string;
  impactoSocial: string;
  alinhamentoODS: string;
  replicabilidade: string;
  
  // Informações adicionais
  participouEdicoesAnteriores: string;
  especificarEdicoesAnteriores?: string;
  foiVencedorAnterior: string;
  
  // Declaração
  concordaTermos: boolean;
  localData: string;
}

const InscricaoForm = React.memo(() => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    cargoFuncao: '',
    matricula: '',
    unidadeSetor: '',
    telefoneInstitucional: '',
    emailInstitucional: '',
    equipeEnvolvida: '',
    area: '',
    tituloIniciativa: '',
    anoInicioExecucao: '',
    situacaoAtual: '',
    resumoExecutivo: '',
    problemaNecessidade: '',
    objetivosEstrategicos: '',
    etapasMetodologia: '',
    resultadosAlcancados: '',
    cooperacao: '',
    inovacao: '',
    resolutividade: '',
    impactoSocial: '',
    alinhamentoODS: '',
    replicabilidade: '',
    participouEdicoesAnteriores: '',
    foiVencedorAnterior: '',
    concordaTermos: false,
    localData: '',
  });

  const handleInputChange = useCallback((field: keyof FormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleDateChange = useCallback((value: string) => {
    // Remove todos os caracteres que não são números
    const numbersOnly = value.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/YYYY
    let formattedDate = numbersOnly;
    if (numbersOnly.length >= 3) {
      formattedDate = numbersOnly.slice(0, 2) + '/' + numbersOnly.slice(2);
    }
    if (numbersOnly.length >= 5) {
      formattedDate = numbersOnly.slice(0, 2) + '/' + numbersOnly.slice(2, 4) + '/' + numbersOnly.slice(4, 8);
    }
    
    handleInputChange('dataConclusao', formattedDate);
  }, [handleInputChange]);

  const validateStep = useCallback((step: number): boolean => {
    let requiredFields: string[] = [];
    let missingFields: string[] = [];

    switch (step) {
      case 1:
        requiredFields = ['nomeCompleto', 'cargoFuncao', 'matricula', 'unidadeSetor', 'telefoneInstitucional', 'emailInstitucional'];
        break;
      case 2:
        requiredFields = ['area', 'tituloIniciativa', 'anoInicioExecucao', 'situacaoAtual', 'equipeEnvolvida'];
        break;
      case 3:
        requiredFields = ['resumoExecutivo', 'problemaNecessidade', 'objetivosEstrategicos', 'etapasMetodologia', 'resultadosAlcancados'];
        break;
      case 4:
        requiredFields = ['cooperacao', 'inovacao', 'resolutividade', 'impactoSocial', 'alinhamentoODS', 'replicabilidade'];
        break;
      case 5:
        requiredFields = ['participouEdicoesAnteriores', 'foiVencedorAnterior'];
        // Verificação especial para concordaTermos (boolean)
        if (!formData.concordaTermos) {
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, aceite os termos da declaração antes de continuar.",
            variant: "destructive",
          });
          return false;
        }
        break;
    }

    missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof FormData];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      console.log('Campos faltando no step', step, ':', missingFields);
      toast({
        title: "Campos obrigatórios",
        description: `Por favor, preencha todos os campos obrigatórios antes de continuar. Campos faltando: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [formData, toast]);

  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(5, currentStep + 1));
    }
  }, [currentStep, validateStep]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(Math.max(1, currentStep - 1));
  }, [currentStep]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validação completa para envio final
    const allRequiredFields = [
      'nomeCompleto', 'cargoFuncao', 'matricula', 'unidadeSetor', 
      'telefoneInstitucional', 'emailInstitucional', 'equipeEnvolvida', 'area', 
      'tituloIniciativa', 'anoInicioExecucao', 'situacaoAtual',
      'resumoExecutivo', 'problemaNecessidade', 'objetivosEstrategicos',
      'etapasMetodologia', 'resultadosAlcancados',
      'cooperacao', 'inovacao', 'resolutividade', 'impactoSocial', 
      'alinhamentoODS', 'replicabilidade', 'participouEdicoesAnteriores',
      'foiVencedorAnterior'
    ];
    
    const missingFields = allRequiredFields.filter(field => {
      const value = formData[field as keyof FormData];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0 || !formData.concordaTermos) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios e aceite os termos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
       console.log('🚀 Iniciando processo de inscrição...');
       
       // 1. SALVAR NO SUPABASE PRIMEIRO
       console.log('💾 Salvando dados no banco de dados...');
       const supabaseResult = await saveInscricao(formData);
       
       let inscricaoId = '';
       let supabaseSuccess = false;
       
       if (supabaseResult.success) {
         inscricaoId = supabaseResult.data?.id || '';
         supabaseSuccess = true;
         console.log('✅ Dados salvos no Supabase com sucesso! ID:', inscricaoId);
       } else {
         console.error('❌ Erro ao salvar no Supabase:', supabaseResult.error);
         // Continua o processo mesmo se falhar no Supabase (backup via email)
       }

       // 2. GERAR PDF COM OS DADOS DO FORMULÁRIO
       console.log('📄 Gerando PDF...');
       const pdfBlob = await generatePDF(formData);
       console.log('✅ PDF gerado com sucesso');
       
       // 3. ENVIAR EMAIL COM O PDF ANEXADO
       console.log('📧 Enviando emails...');
       const emailSuccess = await sendEmailWithPDF({
         nomeCompleto: formData.nomeCompleto,
         emailInstitucional: formData.emailInstitucional,
         tituloIniciativa: formData.tituloIniciativa,
         pdfBlob,
         inscricaoId: inscricaoId // Incluir ID da inscrição no email se disponível
       });

       // 4. FEEDBACK PARA O USUÁRIO BASEADO NO RESULTADO
       if (supabaseSuccess && emailSuccess) {
         console.log('🎉 Processo completo realizado com sucesso!');
         toast({
           title: "Inscrição enviada com sucesso!",
           description: `Sua inscrição foi registrada no sistema (ID: ${inscricaoId.substring(0, 8)}...) e será avaliada pela Comissão Julgadora. Emails de confirmação foram enviados.`,
         });
       } else if (supabaseSuccess && !emailSuccess) {
         console.log('⚠️ Dados salvos, mas problema no email');
         toast({
           title: "Inscrição registrada no sistema",
           description: `Sua inscrição foi salva no banco de dados (ID: ${inscricaoId.substring(0, 8)}...), mas houve problema no envio do email de confirmação.`,
           variant: "destructive",
         });
       } else if (!supabaseSuccess && emailSuccess) {
         console.log('⚠️ Email enviado, mas problema no banco');
         toast({
           title: "Inscrição enviada por email",
           description: "Sua inscrição foi enviada por email, mas houve problema ao salvar no banco de dados. Sua inscrição será processada manualmente.",
           variant: "destructive",
         });
       } else {
         console.log('❌ Falha em ambos os processos');
         toast({
           title: "Erro ao processar inscrição",
           description: "Houve problemas tanto no salvamento quanto no envio de email. Tente novamente ou entre em contato conosco.",
           variant: "destructive",
         });
       }
       
       // Se pelo menos um processo foi bem-sucedido, limpar o formulário
       if (supabaseSuccess || emailSuccess) {
         console.log('🔄 Limpando formulário...');
         // Resetar formulário após sucesso
         setFormData({
           nomeCompleto: '',
           cargoFuncao: '',
           matricula: '',
           unidadeSetor: '',
           telefoneInstitucional: '',
           emailInstitucional: '',
           equipeEnvolvida: '',
           area: '',
           tituloIniciativa: '',
           anoInicioExecucao: '',
           situacaoAtual: '',
           resumoExecutivo: '',
           problemaNecessidade: '',
           objetivosEstrategicos: '',
           etapasMetodologia: '',
           resultadosAlcancados: '',
           cooperacao: '',
           inovacao: '',
           resolutividade: '',
           impactoSocial: '',
           alinhamentoODS: '',
           replicabilidade: '',
           participouEdicoesAnteriores: '',
           foiVencedorAnterior: '',
           concordaTermos: false,
           localData: '',
         });
         setCurrentStep(1);
       }
       
     } catch (error) {
       console.error('💥 Erro inesperado ao processar inscrição:', error);
       toast({
         title: "Erro inesperado",
         description: "Ocorreu um erro inesperado ao processar sua inscrição. Tente novamente.",
         variant: "destructive",
       });
     } finally {
       setIsSubmitting(false);
       console.log('🏁 Processo de inscrição finalizado');
     }
  }, [formData, isSubmitting, toast]);

  const steps = useMemo(() => [
    { id: 1, title: "Dados do Proponente", icon: User },
    { id: 2, title: "Informações da Inscrição", icon: FileText },
    { id: 3, title: "Descrição", icon: Target },
    { id: 4, title: "Critérios", icon: CheckCircle },
    { id: 5, title: "Finalização", icon: CheckCircle },
  ], []);

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tituloIniciativa" className="text-base font-medium flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Título da prática/projeto *
        </Label>
        <Textarea
          id="tituloIniciativa"
          value={formData.tituloIniciativa}
          onChange={(e) => handleInputChange('tituloIniciativa', e.target.value)}
          placeholder="Informe o nome da iniciativa de forma clara e objetiva,\nrefletindo o conteúdo e o foco principal da prática ou projeto.\nDeve ser um título breve, direto e permitir fácil identificação da iniciativa"
          rows={3}
        />
      </div>
      
      <div className="space-y-4">
        <Label htmlFor="area" className="text-base font-medium flex items-center gap-2">
          <Target className="w-4 h-4" />
          Área/Categoria *
        </Label>
        <RadioGroup
          value={formData.area}
          onValueChange={(value) => handleInputChange('area', value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="finalistica-pratica" id="finalistica-pratica" />
            <Label htmlFor="finalistica-pratica">Prática Finalística</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="finalistica-projeto" id="finalistica-projeto" />
            <Label htmlFor="finalistica-projeto">Projeto Finalístico</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="estruturante-pratica" id="estruturante-pratica" />
            <Label htmlFor="estruturante-pratica">Prática Estruturante</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="estruturante-projeto" id="estruturante-projeto" />
            <Label htmlFor="estruturante-projeto">Projeto Estruturante</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="categoria-especial-ia" id="categoria-especial-ia" />
            <Label htmlFor="categoria-especial-ia">Categoria Especial – Inteligência Artificial</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="anoInicioExecucao" className="text-base font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Ano de início da execução *
        </Label>
        <Input
          id="anoInicioExecucao"
          type="number"
          min="2000"
          max="2025"
          value={formData.anoInicioExecucao}
          onChange={(e) => handleInputChange('anoInicioExecucao', e.target.value)}
          placeholder="Informe o ano de início da execução"
        />
      </div>
      
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Situação atual *
        </Label>
        <RadioGroup
          value={formData.situacaoAtual}
          onValueChange={(value) => handleInputChange('situacaoAtual', value)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="concluido" id="concluido" />
            <Label htmlFor="concluido">Concluído</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="em-execucao" id="em-execucao" />
            <Label htmlFor="em-execucao">Em execução</Label>
          </div>
        </RadioGroup>
        
        {formData.situacaoAtual === 'concluido' && (
          <div className="space-y-2">
            <Label htmlFor="dataConclusao" className="text-base font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Data de conclusão
            </Label>
            <Input
                id="dataConclusao"
                type="text"
                value={formData.dataConclusao || ''}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder="informe da data de conclusão"
                maxLength={10}
              />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="equipeEnvolvida" className="text-base font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Relação da equipe de membros e servidores envolvidos *
        </Label>
        <Textarea
          id="equipeEnvolvida"
          value={formData.equipeEnvolvida}
          onChange={(e) => handleInputChange('equipeEnvolvida', e.target.value)}
          placeholder="Liste os nomes, cargos e funções dos membros e servidores que participaram da execução do trabalho inscrito. Ex: João Silva - Promotor de Justiça - Coordenador; Maria Santos - Servidora - Analista; etc."
          rows={4}
          maxLength={1000}
        />
        <div className="text-xs text-muted-foreground text-right mt-1">
          {formData.equipeEnvolvida.length}/1000 caracteres
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="resumoExecutivo" className="text-base font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Resumo Executivo (até 2.000 caracteres).
        </Label>
        <Textarea
          id="resumoExecutivo"
          value={formData.resumoExecutivo}
          onChange={(e) => handleInputChange('resumoExecutivo', e.target.value)}
          placeholder="Apresente uma síntese da iniciativa, destacando de forma breve o contexto, o objetivo principal, as ações desenvolvidas e os resultados alcançados. O texto deve ser conciso, permitindo uma visão geral rápida e completa da iniciativa."
          rows={6}
          maxLength={2000}
        />
        <div className="text-xs text-muted-foreground text-right mt-1">
          {formData.resumoExecutivo.length}/2000 caracteres
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="problemaNecessidade" className="text-base font-medium flex items-center gap-2">
          <Target className="w-4 h-4" />
          Problema ou Necessidade que Motivou a Iniciativa (até 1.000 caracteres).
        </Label>
        <Textarea
          id="problemaNecessidade"
          value={formData.problemaNecessidade}
          onChange={(e) => handleInputChange('problemaNecessidade', e.target.value)}
          placeholder="Relate de forma clara qual foi o problema identificado ou a necessidade existente que levou à criação da iniciativa. Descreva o contexto, os fatores que evidenciaram essa demanda e os impactos que justificaram a adoção das ações propostas."
          rows={4}
          maxLength={1000}
        />
        <div className="text-xs text-muted-foreground text-right mt-1">
          {formData.problemaNecessidade.length}/1000 caracteres
        </div>
      </div>
      
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Target className="w-4 h-4" />
          Objetivo Estratégico do MPPI (selecione 1 opção) *
        </Label>
        <RadioGroup
          value={formData.objetivosEstrategicos}
          onValueChange={(value) => handleInputChange('objetivosEstrategicos', value)}
          className="space-y-3"
        >
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj1" id="obj1" className="mt-1" />
            <Label htmlFor="obj1" className="text-sm leading-relaxed cursor-pointer">
              Aperfeiçoar a atividade investigativa e de inteligência do MPPI
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj2" id="obj2" className="mt-1" />
            <Label htmlFor="obj2" className="text-sm leading-relaxed cursor-pointer">
              Aprimorar a efetividade da persecução cível e penal, assegurando ainda direitos e garantias a acusados e vítimas
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj3" id="obj3" className="mt-1" />
            <Label htmlFor="obj3" className="text-sm leading-relaxed cursor-pointer">
              Consolidar a atuação ministerial integrada e estimular a articulação interinstitucional
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj4" id="obj4" className="mt-1" />
            <Label htmlFor="obj4" className="text-sm leading-relaxed cursor-pointer">
              Garantir a transversalidade dos direitos fundamentais em toda a atividade ministerial
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj5" id="obj5" className="mt-1" />
            <Label htmlFor="obj5" className="text-sm leading-relaxed cursor-pointer">
              Impulsionar a fiscalização do emprego de recursos públicos, a implementação de políticas públicas e o controle social
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj6" id="obj6" className="mt-1" />
            <Label htmlFor="obj6" className="text-sm leading-relaxed cursor-pointer">
              Intensificar o diálogo com a sociedade e fomentar a solução pacífica de conflitos
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj7" id="obj7" className="mt-1" />
            <Label htmlFor="obj7" className="text-sm leading-relaxed cursor-pointer">
              Disseminar práticas de governança e gestão, em todos os níveis, orientadas para resultados
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj8" id="obj8" className="mt-1" />
            <Label htmlFor="obj8" className="text-sm leading-relaxed cursor-pointer">
              Zelar pela sustentabilidade em toda forma de atuação
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj9" id="obj9" className="mt-1" />
            <Label htmlFor="obj9" className="text-sm leading-relaxed cursor-pointer">
              Assegurar a disponibilidade e a aplicação eficiente dos recursos orçamentários
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj10" id="obj10" className="mt-1" />
            <Label htmlFor="obj10" className="text-sm leading-relaxed cursor-pointer">
              Estabelecer gestão administrativa compartilhada e padronizada
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj11" id="obj11" className="mt-1" />
            <Label htmlFor="obj11" className="text-sm leading-relaxed cursor-pointer">
              Fortalecer os processos de comunicação e a imagem institucional
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj12" id="obj12" className="mt-1" />
            <Label htmlFor="obj12" className="text-sm leading-relaxed cursor-pointer">
              Promover a gestão por competências e a qualidade de vida no trabalho
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="obj13" id="obj13" className="mt-1" />
            <Label htmlFor="obj13" className="text-sm leading-relaxed cursor-pointer">
              Prover soluções tecnológicas integradas e inovadoras
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="etapasMetodologia" className="text-base font-medium flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Etapas / Metodologia da Execução (até 2.000 caracteres).
        </Label>
        <Textarea
          id="etapasMetodologia"
          value={formData.etapasMetodologia}
          onChange={(e) => handleInputChange('etapasMetodologia', e.target.value)}
          placeholder="Descreva as principais etapas realizadas na execução da iniciativa, apresentando a metodologia adotada, os procedimentos utilizados e a sequência das ações desenvolvidas. Explique como cada fase contribuiu para o alcance dos resultados, destacando estratégias, recursos aplicados e formas de acompanhamento."
          rows={4}
          maxLength={2000}
        />
        <div className="text-xs text-muted-foreground text-right mt-1">
          {formData.etapasMetodologia.length}/2000 caracteres
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="resultadosAlcancados" className="text-base font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Descrição dos Resultados Alcançados (até 2.000 caracteres).
        </Label>
        <Textarea
          id="resultadosAlcancados"
          value={formData.resultadosAlcancados}
          onChange={(e) => handleInputChange('resultadosAlcancados', e.target.value)}
          placeholder="Informe os resultados obtidos com a iniciativa de forma objetiva, utilizando números ou indicadores mensuráveis (ex.: pessoas atendidas, percentual de aumento/redução, recursos mobilizados). Evite descrições genéricas e priorize dados que evidenciem o impacto alcançado."
          rows={4}
          maxLength={2000}
        />
        <div className="text-xs text-muted-foreground text-right mt-1">
          {formData.resultadosAlcancados.length}/2000 caracteres
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Critérios de Avaliação</h3>
        
        <div className="space-y-2">
          <Label htmlFor="cooperacao" className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Cooperação (parcerias internas/externas envolvidas) *
          </Label>
          <Textarea
            id="cooperacao"
            value={formData.cooperacao}
            onChange={(e) => handleInputChange('cooperacao', e.target.value)}
            placeholder="Descreva as formas de atuação colaborativa estabelecidas durante a iniciativa, indicando a cooperação intra e interinstitucional, bem como eventuais parcerias com a sociedade civil. Informe como essas articulações contribuíram para fortalecer as ações, otimizar recursos e ampliar os resultados alcançados."
            rows={3}
            maxLength={2000}
            required
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.cooperacao.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="inovacao" className="text-base font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            Inovação (o que a iniciativa traz de novo e diferenciado) *
          </Label>
          <Textarea
            id="inovacao"
            value={formData.inovacao}
            onChange={(e) => handleInputChange('inovacao', e.target.value)}
            placeholder="Relate os aspectos inovadores da iniciativa, destacando o que ela traz de novo e diferenciado em relação a práticas já existentes. Explique como as ações se distinguem por soluções criativas, uso de novas metodologias, tecnologias ou formas de atuação que contribuíram para maior eficiência, impacto ou alcance dos resultados."
            rows={3}
            maxLength={2000}
            required
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.inovacao.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="resolutividade" className="text-base font-medium flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-green-600" />
            Resolutividade (como a iniciativa solucionou de forma efetiva o problema) *
          </Label>
          <Textarea
            id="resolutividade"
            value={formData.resolutividade}
            onChange={(e) => handleInputChange('resolutividade', e.target.value)}
            placeholder="Explique de que forma a iniciativa solucionou de maneira efetiva o problema ou necessidade identificada. Descreva os resultados práticos alcançados, evidenciando a efetividade das ações, a redução ou eliminação dos obstáculos enfrentados e o impacto concreto gerado para o público-alvo ou para a instituição."
            rows={3}
            maxLength={2000}
            required
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.resolutividade.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="impactoSocial" className="text-base font-medium flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-600" />
            Impacto social (volume de pessoas beneficiadas, abrangência e efeitos positivos) *
          </Label>
          <Textarea
            id="impactoSocial"
            value={formData.impactoSocial}
            onChange={(e) => handleInputChange('impactoSocial', e.target.value)}
            placeholder="Quantifique o impacto gerado pela iniciativa, informando o número de pessoas beneficiadas, a abrangência territorial das ações e os principais efeitos positivos observados. Sempre que possível, utilize dados concretos e indicadores que evidenciem a relevância social dos resultados alcançados."
            rows={3}
            maxLength={2000}
            required
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.impactoSocial.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="alinhamentoODS" className="text-base font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Alinhamento aos ODS da Agenda 2030 da ONU (indicar qual objetivo foi contemplado e de que forma) *
          </Label>
          <Textarea
            id="alinhamentoODS"
            value={formData.alinhamentoODS}
            onChange={(e) => handleInputChange('alinhamentoODS', e.target.value)}
            placeholder="Indique qual Objetivo de Desenvolvimento Sustentável (ODS) foi contemplado pela iniciativa e explique de que forma suas ações contribuíram para alcançá-lo. Relacione as atividades realizadas ao ODS selecionado, destacando impactos e resultados concretos."
            rows={3}
            maxLength={2000}
            required
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.alinhamentoODS.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="replicabilidade" className="text-base font-medium flex items-center gap-2">
            <Copy className="h-4 w-4 text-purple-600" />
            Replicabilidade (potencial de ser aplicada em outras áreas, unidades ou contextos) *
          </Label>
          <Textarea
            id="replicabilidade"
            value={formData.replicabilidade}
            onChange={(e) => handleInputChange('replicabilidade', e.target.value)}
            placeholder="Descreva o potencial da iniciativa de ser aplicada ou adaptada em outras áreas, unidades ou contextos. Explique de que forma a experiência pode servir como modelo, destacando elementos que favoreçam sua reprodução, como simplicidade da metodologia, baixo custo, facilidade de implementação ou resultados comprovados."
            rows={3}
            maxLength={2000}
            required
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.replicabilidade.length}/2000 caracteres
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações Adicionais</h3>
        
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Já participou de edições anteriores do Prêmio Melhores Práticas? *
          </Label>
          <RadioGroup
            value={formData.participouEdicoesAnteriores}
            onValueChange={(value) => handleInputChange('participouEdicoesAnteriores', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id="participou-sim" />
              <Label htmlFor="participou-sim">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="participou-nao" />
              <Label htmlFor="participou-nao">Não</Label>
            </div>
          </RadioGroup>
          
          {formData.participouEdicoesAnteriores === 'sim' && (
            <div className="space-y-2">
              <Label htmlFor="especificarEdicoesAnteriores" className="text-base font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Especifique
              </Label>
              <Input
                id="especificarEdicoesAnteriores"
                value={formData.especificarEdicoesAnteriores || ''}
                onChange={(e) => handleInputChange('especificarEdicoesAnteriores', e.target.value)}
                placeholder="Especifique as edições anteriores..."
              />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            A prática/projeto já foi vencedor em edição anterior do Prêmio Melhores Práticas? *
          </Label>
          <RadioGroup
            value={formData.foiVencedorAnterior}
            onValueChange={(value) => handleInputChange('foiVencedorAnterior', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id="vencedor-sim" />
              <Label htmlFor="vencedor-sim">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="vencedor-nao" />
              <Label htmlFor="vencedor-nao">Não</Label>
            </div>
          </RadioGroup>
          {formData.foiVencedorAnterior === 'sim' && (
            <p className="text-sm text-warning bg-warning-light p-3 rounded-lg">
              <strong>Atenção:</strong> Conforme o edital, práticas e projetos vencedores em edições anteriores não poderão concorrer.
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Declaração do Proponente</h3>
        
        <div className="p-4 bg-institutional-light border border-primary/20 rounded-lg">
          <p className="text-sm mb-4">
            Declaro estar ciente e de acordo com as normas do Edital PGJ nº 107/2025 – 9ª Edição do Prêmio Melhores Práticas do MPPI, 
            autorizando a divulgação das informações, imagens e resultados relacionados a esta inscrição, em quaisquer meios institucionais ou de imprensa.
          </p>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="concordaTermos"
              checked={formData.concordaTermos}
              onCheckedChange={(checked) => handleInputChange('concordaTermos', checked as boolean)}
            />
            <Label htmlFor="concordaTermos" className="text-sm font-medium">
              Concordo com os termos desta declaração *
            </Label>
          </div>
        </div>
        

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 border border-gray-200 rounded-lg shadow-md p-4 sm:p-6 bg-white">
          <img 
            src="https://i.postimg.cc/pT3rRnwr/logo-mppi.png" 
            alt="MPPI Logo" 
            className="w-48 h-24 sm:w-64 sm:h-32 object-contain mb-4 sm:mb-6 mx-auto block" 
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Prêmio Melhores Práticas MPPI
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            9ª Edição - 2025 | Ficha de Inscrição
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 px-2 sm:px-4 overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1 min-w-0">
                <button 
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-colors ${
                    isCompleted ? 'bg-success text-white' : 
                    isActive ? 'bg-primary text-white' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className={`text-xs text-center px-1 leading-tight ${
                    isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}>
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{step.title.split(' ')[0]}</span>
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`h-px flex-1 mt-3 sm:mt-5 ${
                    isCompleted ? 'bg-success' : 'bg-border'
                  }`} style={{ 
                    position: 'absolute',
                    left: `${((index + 1) / steps.length) * 100}%`,
                    width: `${(1 / steps.length) * 100}%`,
                    transform: 'translateY(-50%)',
                    zIndex: -1
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
              <span className="hidden sm:inline">{steps[currentStep - 1].title}</span>
              <span className="sm:hidden">{steps[currentStep - 1].title.split(' ')[0]}</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Preencha todas as informações obrigatórias marcadas com *
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} />}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1 || isSubmitting}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Anterior
                </Button>
                
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-success to-success text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      'Enviar Inscrição'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default InscricaoForm;