import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, User, Target, CheckCircle, Users, Lightbulb, CheckSquare, Heart, Globe, Copy, Trophy, AlertCircle, CalendarClock } from 'lucide-react';
import { saveInscricao, verificarDuplicidadeInscricao, getPeriodoInscricao } from '@/lib/supabaseService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Step1 from '@/components/FormSteps/Step1';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

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
  cadastroBancoPraticas: string;
  identificacaoBancoPraticas?: string;
  institucionalizadoAto: string;
  identificacaoProjetoMetodologia?: string;
  
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

const InscricaoForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
    cadastroBancoPraticas: '',
    identificacaoBancoPraticas: '',
    institucionalizadoAto: '',
    identificacaoProjetoMetodologia: '',
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

  });

  const [duplicidadeAviso, setDuplicidadeAviso] = useState('');
  const [periodoInscricaoStatus, setPeriodoInscricaoStatus] = useState<'loading' | 'aberto' | 'fechado_antes' | 'fechado_depois'>('loading');
  const [datasPeriodo, setDatasPeriodo] = useState<{ inicio: Date | null, fim: Date | null }>({ inicio: null, fim: null });

  useEffect(() => {
    const fetchPeriodo = async () => {
      const periodo = await getPeriodoInscricao();
      setDatasPeriodo(periodo);
      if (!periodo.inicio || !periodo.fim) {
        setPeriodoInscricaoStatus('aberto'); // Fallback if no timeline defined
        return;
      }
      
      const now = new Date();
      if (now < periodo.inicio) {
        setPeriodoInscricaoStatus('fechado_antes');
      } else if (now > periodo.fim) {
        setPeriodoInscricaoStatus('fechado_depois');
      } else {
        setPeriodoInscricaoStatus('aberto');
      }
    };
    fetchPeriodo();
  }, []);

  useEffect(() => {
    if (!formData.matricula || !formData.area) {
      setDuplicidadeAviso('');
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const isPratica = formData.area.includes('pratica');
        const tipoIniciativa = isPratica ? 'pratica' : 'projeto';
        const isDuplicata = await verificarDuplicidadeInscricao(formData.matricula, tipoIniciativa);
        if (isDuplicata) {
          setDuplicidadeAviso(`Você já possui uma inscrição de ${tipoIniciativa} nesta edição; nos termos do item 6.3, apenas a primeira enviada será considerada válida.`);
        } else {
          setDuplicidadeAviso('');
        }
      } catch {
        setDuplicidadeAviso('');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.matricula, formData.area]);

  const handleInputChange = useCallback((field: keyof FormData, value: string | string[] | boolean) => {
    console.log(`💾 DEBUG: handleInputChange - campo: '${field}', valor: '${value}', tipo: ${typeof value}`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log(`📝 DEBUG: FormData atualizado para campo '${field}':`, newData[field]);
      return newData;
    });
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

  const validateStep = useCallback((step: number, isForSubmit: boolean = false): boolean => {
    console.log(`🔍 DEBUG: validateStep chamado - Step: ${step}, isForSubmit: ${isForSubmit}`);
    console.log(`📊 DEBUG: currentStep atual: ${currentStep}`);
    
    let requiredFields: string[] = [];
    let missingFields: string[] = [];

    switch (step) {
      case 1:
        requiredFields = ['nomeCompleto', 'cargoFuncao', 'matricula', 'unidadeSetor', 'telefoneInstitucional', 'emailInstitucional'];
        break;
      case 2:
        requiredFields = ['area', 'tituloIniciativa', 'anoInicioExecucao', 'situacaoAtual', 'equipeEnvolvida'];
        if (formData.area.includes('pratica')) {
          requiredFields.push('cadastroBancoPraticas');
          if (formData.cadastroBancoPraticas === 'sim') {
            requiredFields.push('identificacaoBancoPraticas');
          }
        } else if (formData.area.includes('projeto')) {
          requiredFields.push('institucionalizadoAto');
        }
        break;
      case 3:
        requiredFields = ['resumoExecutivo', 'problemaNecessidade', 'objetivosEstrategicos', 'etapasMetodologia', 'resultadosAlcancados'];
        break;
      case 4:
        // Step 4 - Critérios de Avaliação (obrigatórios)
        requiredFields = ['cooperacao', 'inovacao', 'resolutividade', 'impactoSocial', 'replicabilidade'];
        // ODS is only required for Projetos
        if (formData.area === 'finalistica-projeto' || formData.area === 'estruturante-projeto') {
          requiredFields.push('alinhamentoODS');
        }
        break;
      case 5:
        requiredFields = ['participouEdicoesAnteriores', 'foiVencedorAnterior'];
        
        // Verificação especial: vencedores anteriores não podem concorrer
        if (formData.foiVencedorAnterior === 'sim') {
          console.log(`❌ DEBUG: Vencedor anterior tentando prosseguir`);
          toast({
            title: "Inscrição não permitida",
            description: "Conforme o edital, práticas e projetos vencedores em edições anteriores não podem concorrer novamente.",
            variant: "destructive",
          });
          return false;
        }
        
        // Verificação especial para concordaTermos (boolean) - APENAS no submit final
        if (isForSubmit && !formData.concordaTermos) {
          console.log(`❌ DEBUG: concordaTermos não aceito no submit final`);
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, aceite os termos da declaração antes de continuar.",
            variant: "destructive",
          });
          return false;
        }
        break;
    }

    console.log(`📋 DEBUG: Campos obrigatórios para Step ${step}:`, requiredFields);
    console.log(`📊 DEBUG: FormData completo:`, formData);
    console.log(`📊 DEBUG: Valores dos campos:`, requiredFields.map(field => ({
      field,
      value: formData[field as keyof FormData],
      type: typeof formData[field as keyof FormData],
      length: typeof formData[field as keyof FormData] === 'string' ? (formData[field as keyof FormData] as string).length : 'N/A',
      trimmed: typeof formData[field as keyof FormData] === 'string' ? (formData[field as keyof FormData] as string).trim() : 'N/A',
      trimmedLength: typeof formData[field as keyof FormData] === 'string' ? (formData[field as keyof FormData] as string).trim().length : 'N/A'
    })));

    missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof FormData];
      const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
      console.log(`🔍 DEBUG: Verificando campo '${field}': valor='${value}', isEmpty=${isEmpty}`);
      return isEmpty;
    });

    console.log(`❌ DEBUG: Campos faltando para Step ${step}:`, missingFields);

    if (missingFields.length > 0) {
      console.log(`🚨 DEBUG: Validação FALHOU - mostrando toast de erro`);
      toast({
        title: "Campos obrigatórios",
        description: `Por favor, preencha todos os campos obrigatórios antes de continuar. Campos faltando: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    console.log(`✅ DEBUG: Validação PASSOU para Step ${step}`);
    return true;

    return true;
  }, [formData, toast, currentStep]);

  // Confetti setup
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);

  // Auto-hide confetti after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleNextStep = useCallback(() => {
    console.log(`🚀 DEBUG: handleNextStep chamado - currentStep: ${currentStep}`);
    
    // Para todos os steps (1, 2, 3, 4), usa a validação normal
    // Step 5 é o último, então não há "próximo" step
    if (currentStep < 5) {
      console.log(`🔄 DEBUG: Chamando validateStep(${currentStep})`);
      const isValid = validateStep(currentStep);
      console.log(`📊 DEBUG: Resultado da validação: ${isValid}`);
      
      if (isValid) {
        console.log(`✅ DEBUG: Avançando para step ${currentStep + 1}`);
        setCurrentStep(currentStep + 1);
      } else {
        console.log(`❌ DEBUG: Validação falhou, permanecendo no step ${currentStep}`);
      }
    } else {
      console.log(`🛑 DEBUG: Já está no último step (${currentStep}), não pode avançar`);
    }
  }, [currentStep, validateStep]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(Math.max(1, currentStep - 1));
  }, [currentStep]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    console.log(`🚨 DEBUG: handleSubmit chamado! currentStep: ${currentStep}`);
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // IMPORTANTE: handleSubmit só deve ser executado quando estiver no Step 5 (último step)
    // Se não estiver no Step 5, não deve processar o submit
    if (currentStep !== 5) {
      console.log(`⚠️ DEBUG: handleSubmit chamado fora do Step 5 (currentStep: ${currentStep}). Ignorando.`);
      return;
    }
    
    // Validação final do Step 5 usando a função validateStep
    console.log(`🔄 DEBUG: Validando Step 5 antes do envio final`);
    const isStep5Valid = validateStep(5, true); // isForSubmit = true
    
    if (!isStep5Valid) {
      console.log(`❌ DEBUG: Validação do Step 5 falhou`);
      return;
    }
    
    // Validação completa para envio final - todos os campos obrigatórios
    const allRequiredFields = [
      'nomeCompleto', 'cargoFuncao', 'unidadeSetor', 
      'telefoneInstitucional', 'emailInstitucional', 'equipeEnvolvida', 'area', 
      'tituloIniciativa', 'anoInicioExecucao', 'situacaoAtual',
      'resumoExecutivo', 'problemaNecessidade', 'objetivosEstrategicos',
      'etapasMetodologia', 'resultadosAlcancados',
      'cooperacao', 'inovacao', 'resolutividade', 'impactoSocial', 'replicabilidade',
      'participouEdicoesAnteriores', 'foiVencedorAnterior'
    ];
    
    // ODS is only required for Projetos
    if (formData.area === 'finalistica-projeto' || formData.area === 'estruturante-projeto') {
      allRequiredFields.push('alinhamentoODS');
    }
    
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
       
       // 1. SALVAR NO SUPABASE
       console.log('💾 Salvando dados no banco de dados...');
       const supabaseResult = await saveInscricao(formData);
       
       if (supabaseResult.success) {
         const inscricaoId = supabaseResult.data?.id || '';
         console.log('✅ Dados salvos no Supabase com sucesso! ID:', inscricaoId);
         
         // 2. PREPARAR DADOS PARA A PÁGINA DE CONFIRMAÇÃO
         const inscricaoData = {
           nome_completo: formData.nomeCompleto,
           email_institucional: formData.emailInstitucional,
           telefone: formData.telefoneInstitucional,
           lotacao: formData.unidadeSetor,
           cargo_funcao: formData.cargoFuncao,
           matricula: formData.matricula || null, // Campo opcional
           titulo_iniciativa: formData.tituloIniciativa,
           descricao_iniciativa: formData.resumoExecutivo,
           area_atuacao: formData.area,
           situacao_atual: formData.situacaoAtual || null, // Campo para situação atual
           data_conclusao: formData.dataConclusao || null, // Campo para data de conclusão
           publico_alvo: formData.equipeEnvolvida || null, // Campo para relação da equipe
           problema_necessidade: formData.problemaNecessidade || null, // Campo para problema ou necessidade
           objetivos: formData.objetivosEstrategicos,
           metodologia: formData.etapasMetodologia,
           principais_resultados: formData.resultadosAlcancados,
           inovacao: formData.inovacao,
           impacto_social: formData.impactoSocial,
           replicabilidade: formData.replicabilidade,
           participou_edicoes_anteriores: formData.participouEdicoesAnteriores === 'sim',
           foi_vencedor_anterior: formData.foiVencedorAnterior === 'sim',
           declaracao: formData.concordaTermos,
           cooperacao: formData.cooperacao || '',
           resolutividade: formData.resolutividade || '',
           alinhamento_ods: formData.alinhamentoODS || '',
           observacoes: formData.especificarEdicoesAnteriores || null,
           created_at: new Date().toISOString()
         };
         
         // 3. REDIRECIONAR PARA PÁGINA DE CONFIRMAÇÃO
         console.log('🔄 Redirecionando para página de confirmação...');
         navigate('/confirmacao', { 
           state: { inscricaoData },
           replace: true 
         });
         
       } else {
         console.error('❌ Erro ao salvar no Supabase:', supabaseResult.error);
         toast({
           title: "Erro ao processar inscrição",
           description: "Houve um problema ao salvar sua inscrição. Tente novamente ou entre em contato conosco.",
           variant: "destructive",
         });
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
      
      {formData.area.includes('pratica') && (
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            A prática está regularmente inscrita no Banco de Práticas do MPPI (Ato PGJ/PI nº 1.335/2023)? *
          </Label>
          <RadioGroup
            value={formData.cadastroBancoPraticas}
            onValueChange={(value) => handleInputChange('cadastroBancoPraticas', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id="banco-sim" />
              <Label htmlFor="banco-sim">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="banco-nao" />
              <Label htmlFor="banco-nao">Não</Label>
            </div>
          </RadioGroup>
          {formData.cadastroBancoPraticas === 'sim' && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="identificacaoBancoPraticas" className="text-sm">Número ou identificação do registro *</Label>
              <Input
                id="identificacaoBancoPraticas"
                value={formData.identificacaoBancoPraticas || ''}
                onChange={(e) => handleInputChange('identificacaoBancoPraticas', e.target.value)}
                placeholder="Ex: Registro nº 12345"
              />
            </div>
          )}
          {formData.cadastroBancoPraticas === 'nao' && (
            <Alert className="mt-2" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Sua inscrição poderá ser indeferida na triagem, nos termos do item 6.4 do Edital.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {formData.area.includes('projeto') && (
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            O projeto está institucionalizado conforme a Metodologia de Gerenciamento de Projetos do MPPI (Ato PGJ/PI nº 1.254/2022, alterado pelo Ato nº 1.595/2025)? *
          </Label>
          <RadioGroup
            value={formData.institucionalizadoAto}
            onValueChange={(value) => handleInputChange('institucionalizadoAto', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id="inst-sim" />
              <Label htmlFor="inst-sim">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="inst-nao" />
              <Label htmlFor="inst-nao">Não</Label>
            </div>
          </RadioGroup>
          <div className="space-y-2 mt-2">
            <Label htmlFor="identificacaoProjetoMetodologia" className="text-sm">Identificação do projeto na metodologia (Opcional)</Label>
            <Input
              id="identificacaoProjetoMetodologia"
              value={formData.identificacaoProjetoMetodologia || ''}
              onChange={(e) => handleInputChange('identificacaoProjetoMetodologia', e.target.value)}
              placeholder="Ex: Portaria nº 456, ou Número do Projeto"
            />
          </div>
          {formData.institucionalizadoAto === 'nao' && (
            <Alert className="mt-2" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Sua inscrição poderá ser indeferida na triagem, nos termos do item 6.4 do Edital.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
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
          Descrição dos Resultados Alcançados (mensuráveis obtidos nos últimos 3 anos - até 2.000 caracteres). *
        </Label>
        <Textarea
          id="resultadosAlcancados"
          value={formData.resultadosAlcancados}
          onChange={(e) => handleInputChange('resultadosAlcancados', e.target.value)}
          placeholder="Informe os resultados obtidos nos últimos 3 anos de forma objetiva, utilizando números ou indicadores mensuráveis. Evite descrições genéricas e priorize dados que evidenciem o impacto alcançado (item 6.5 do Edital)."
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
            Cooperação *
          </Label>
          <p className="text-xs text-muted-foreground">Grau de articulação e de colaboração entre unidades do MPPI, instituições parceiras ou organizações da sociedade civil.</p>
          <Textarea
            id="cooperacao"
            value={formData.cooperacao}
            onChange={(e) => handleInputChange('cooperacao', e.target.value)}
            placeholder="Descreva as formas de atuação colaborativa estabelecidas..."
            rows={3}
            maxLength={2000}
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.cooperacao.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="inovacao" className="text-base font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            Inovação *
          </Label>
          <p className="text-xs text-muted-foreground">Adoção de solução, método, processo, ferramenta ou forma de atuação nova ou significativamente aperfeiçoada, capaz de produzir ganho de qualidade, eficiência ou desempenho.</p>
          <Textarea
            id="inovacao"
            value={formData.inovacao}
            onChange={(e) => handleInputChange('inovacao', e.target.value)}
            placeholder="Relate os aspectos inovadores da iniciativa..."
            rows={3}
            maxLength={2000}
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.inovacao.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="resolutividade" className="text-base font-medium flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-green-600" />
            Resolutividade *
          </Label>
          <p className="text-xs text-muted-foreground">Capacidade da iniciativa de solucionar, prevenir, reduzir ou enfrentar de maneira concreta o problema que motivou sua implementação.</p>
          <Textarea
            id="resolutividade"
            value={formData.resolutividade}
            onChange={(e) => handleInputChange('resolutividade', e.target.value)}
            placeholder="Explique de que forma a iniciativa solucionou de maneira efetiva o problema..."
            rows={3}
            maxLength={2000}
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.resolutividade.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="impactoSocial" className="text-base font-medium flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-600" />
            Impacto Social ou Institucional *
          </Label>
          <p className="text-xs text-muted-foreground">Dimensão, relevância e profundidade das mudanças produzidas para a sociedade, para o público beneficiado ou para o funcionamento da Instituição.</p>
          <Textarea
            id="impactoSocial"
            value={formData.impactoSocial}
            onChange={(e) => handleInputChange('impactoSocial', e.target.value)}
            placeholder="Quantifique o impacto gerado pela iniciativa..."
            rows={3}
            maxLength={2000}
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.impactoSocial.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="alinhamentoODS" className="text-base font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Alinhamento aos ODS {formData.area.includes('projeto') ? '*' : '(Opcional para Práticas)'}
          </Label>
          <p className="text-xs text-muted-foreground">Contribuição demonstrável para um ou mais objetivos da Agenda 2030 da ONU.</p>
          <Textarea
            id="alinhamentoODS"
            value={formData.alinhamentoODS}
            onChange={(e) => handleInputChange('alinhamentoODS', e.target.value)}
            placeholder="Indique qual Objetivo de Desenvolvimento Sustentável (ODS) foi contemplado..."
            rows={3}
            maxLength={2000}
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {formData.alinhamentoODS.length}/2000 caracteres
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="replicabilidade" className="text-base font-medium flex items-center gap-2">
            <Copy className="h-4 w-4 text-purple-600" />
            Replicabilidade *
          </Label>
          <p className="text-xs text-muted-foreground">Possibilidade de a iniciativa ser reaplicada ou adaptada em outras unidades, áreas ou contextos institucionais, considerando sua viabilidade prática e seu potencial de produzir resultados semelhantes.</p>
          <Textarea
            id="replicabilidade"
            value={formData.replicabilidade}
            onChange={(e) => handleInputChange('replicabilidade', e.target.value)}
            placeholder="Descreva o potencial da iniciativa de ser aplicada ou adaptada em outras áreas..."
            rows={3}
            maxLength={2000}
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Inscrição não permitida
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Conforme o <strong>Edital PGJ nº 107/2025</strong>, práticas e projetos <strong>vencedores em edições anteriores não podem concorrer novamente</strong>. 
                      Você não poderá prosseguir com esta inscrição.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Declaração do Proponente</h3>
        
        <div className="p-4 bg-institutional-light border border-primary/20 rounded-lg">
          <p className="text-sm mb-4">
            Declaro estar ciente e de acordo com as normas do Edital PGJ nº 107/2025 – 10ª Edição do Prêmio Melhores Práticas do MPPI, 
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Confetti effect for the 10th anniversary */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
          colors={['#D4AF37', '#B8860B', '#FFD700', '#800020', '#4A0404']}
        />
      )}
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-yellow-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      
      <Card className="w-full max-w-4xl shadow-2xl relative z-10 glass-gold border-yellow-500/20">
        <CardHeader className="text-center pb-2 bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white rounded-t-xl relative overflow-hidden">
          {/* Subtle star pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #FFD700 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="flex justify-center mb-4 relative z-10 animate-sparkle">
            <div className="bg-white/10 p-2 rounded-full ring-2 ring-yellow-400/50 shadow-[0_0_15px_rgba(212,175,55,0.5)]">
              <Trophy className="h-10 w-10 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-yellow-50 relative z-10">
            Prêmio Melhores Práticas MPPI
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
            <span className="text-sm sm:text-base text-yellow-200/90 font-medium">
              10ª Edição - 2026 | Ficha de Inscrição
            </span>
            <span className="bg-yellow-500 text-primary-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(212,175,55,0.4)] animate-pulse">
              10 Anos
            </span>
          </div>
        </CardHeader>

        {periodoInscricaoStatus === 'loading' ? (
          <div className="flex justify-center items-center py-20 text-white">Carregando cronograma...</div>
        ) : periodoInscricaoStatus === 'fechado_antes' ? (
          <Card className="shadow-lg relative z-10 p-8 text-center bg-white/95 border-yellow-500/30 backdrop-blur-md mt-6">
            <CalendarClock className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Inscrições em Breve</h2>
            <p className="text-gray-600">
              O período de inscrições para a 10ª Edição do Prêmio Melhores Práticas MPPI começa em{' '}
              <strong className="text-primary">{datasPeriodo.inicio?.toLocaleDateString('pt-BR')}</strong>.
              <br />
              Por favor, aguarde o início oficial do período conforme o Anexo Único do Edital.
            </p>
          </Card>
        ) : periodoInscricaoStatus === 'fechado_depois' ? (
          <Card className="shadow-lg relative z-10 p-8 text-center bg-white/95 border-red-500/30 backdrop-blur-md mt-6">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Inscrições Encerradas</h2>
            <p className="text-gray-600">
              O período de inscrições para a 10ª Edição do Prêmio Melhores Práticas MPPI encerrou em{' '}
              <strong className="text-primary">{datasPeriodo.fim?.toLocaleDateString('pt-BR')}</strong>.
              <br />
              Agradecemos o seu interesse! Acompanhe a publicação dos finalistas no Diário Oficial.
            </p>
          </Card>
        ) : (
        <>
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
            {duplicidadeAviso && (
              <Alert className="mb-4 border-yellow-200 bg-yellow-50 text-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-xs">{duplicidadeAviso}</AlertDescription>
              </Alert>
            )}
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
        </>
        )}
      </Card>
    </div>
  );
};

export default InscricaoForm;
