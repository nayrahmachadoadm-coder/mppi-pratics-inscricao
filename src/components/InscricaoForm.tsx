import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { FileText, User, Target, CheckCircle } from 'lucide-react';

interface FormData {
  // Dados do proponente
  nomeCompleto: string;
  cargoFuncao: string;
  matricula: string;
  unidadeSetor: string;
  telefoneInstitucional: string;
  emailInstitucional: string;
  
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

const InscricaoForm = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    cargoFuncao: '',
    matricula: '',
    unidadeSetor: '',
    telefoneInstitucional: '',
    emailInstitucional: '',
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

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    const requiredFields = [
      'nomeCompleto', 'cargoFuncao', 'matricula', 'unidadeSetor', 
      'telefoneInstitucional', 'emailInstitucional', 'area', 
      'tituloIniciativa', 'anoInicioExecucao', 'situacaoAtual'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0 || !formData.concordaTermos) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios e aceite os termos.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Inscrição enviada com sucesso!",
      description: "Sua inscrição foi registrada e será avaliada pela Comissão Julgadora.",
    });
  };

  const steps = [
    { id: 1, title: "Dados do Proponente", icon: User },
    { id: 2, title: "Informações da Inscrição", icon: FileText },
    { id: 3, title: "Descrição", icon: Target },
    { id: 4, title: "Critérios & Finalização", icon: CheckCircle },
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nomeCompleto">Nome completo *</Label>
          <Input
            id="nomeCompleto"
            value={formData.nomeCompleto}
            onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
            placeholder="Digite seu nome completo"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cargoFuncao">Cargo/Função *</Label>
          <Input
            id="cargoFuncao"
            value={formData.cargoFuncao}
            onChange={(e) => handleInputChange('cargoFuncao', e.target.value)}
            placeholder="Digite seu cargo ou função"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="matricula">Matrícula *</Label>
          <Input
            id="matricula"
            value={formData.matricula}
            onChange={(e) => handleInputChange('matricula', e.target.value)}
            placeholder="Digite sua matrícula"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unidadeSetor">Unidade/Setor de lotação *</Label>
          <Input
            id="unidadeSetor"
            value={formData.unidadeSetor}
            onChange={(e) => handleInputChange('unidadeSetor', e.target.value)}
            placeholder="Digite sua unidade ou setor"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefoneInstitucional">Telefone institucional *</Label>
          <Input
            id="telefoneInstitucional"
            value={formData.telefoneInstitucional}
            onChange={(e) => handleInputChange('telefoneInstitucional', e.target.value)}
            placeholder="(00) 0000-0000"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="emailInstitucional">E-mail institucional *</Label>
          <Input
            id="emailInstitucional"
            type="email"
            value={formData.emailInstitucional}
            onChange={(e) => handleInputChange('emailInstitucional', e.target.value)}
            placeholder="seuemail@mppi.mp.br"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium">Área *</Label>
        <RadioGroup
          value={formData.area}
          onValueChange={(value) => handleInputChange('area', value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="finalistica-pratica" id="finalistica-pratica" />
            <Label htmlFor="finalistica-pratica">Finalística – Prática</Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="finalistica-projeto" id="finalistica-projeto" />
            <Label htmlFor="finalistica-projeto">Finalística – Projeto</Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="estruturante-pratica" id="estruturante-pratica" />
            <Label htmlFor="estruturante-pratica">Estruturante – Prática</Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="estruturante-projeto" id="estruturante-projeto" />
            <Label htmlFor="estruturante-projeto">Estruturante – Projeto</Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg md:col-span-2">
            <RadioGroupItem value="categoria-especial-ia" id="categoria-especial-ia" />
            <Label htmlFor="categoria-especial-ia">Categoria Especial – Inteligência Artificial</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tituloIniciativa">Título da prática/projeto *</Label>
          <Input
            id="tituloIniciativa"
            value={formData.tituloIniciativa}
            onChange={(e) => handleInputChange('tituloIniciativa', e.target.value)}
            placeholder="Digite o título da sua iniciativa"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="anoInicioExecucao">Ano de início da execução *</Label>
          <Input
            id="anoInicioExecucao"
            type="number"
            min="2000"
            max="2025"
            value={formData.anoInicioExecucao}
            onChange={(e) => handleInputChange('anoInicioExecucao', e.target.value)}
            placeholder="2024"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <Label className="text-base font-medium">Situação atual *</Label>
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
            <Label htmlFor="dataConclusao">Data de conclusão</Label>
            <Input
              id="dataConclusao"
              type="date"
              value={formData.dataConclusao || ''}
              onChange={(e) => handleInputChange('dataConclusao', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="resumoExecutivo">Resumo executivo (até 15 linhas)</Label>
        <Textarea
          id="resumoExecutivo"
          value={formData.resumoExecutivo}
          onChange={(e) => handleInputChange('resumoExecutivo', e.target.value)}
          placeholder="Descreva resumidamente sua iniciativa..."
          rows={6}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="problemaNecessidade">Problema ou necessidade que motivou a iniciativa</Label>
        <Textarea
          id="problemaNecessidade"
          value={formData.problemaNecessidade}
          onChange={(e) => handleInputChange('problemaNecessidade', e.target.value)}
          placeholder="Descreva o problema ou necessidade..."
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="objetivosEstrategicos">Objetivo(s) Estratégico(s)</Label>
        <Textarea
          id="objetivosEstrategicos"
          value={formData.objetivosEstrategicos}
          onChange={(e) => handleInputChange('objetivosEstrategicos', e.target.value)}
          placeholder="Liste os objetivos estratégicos..."
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="etapasMetodologia">Etapas/metodologia da execução</Label>
        <Textarea
          id="etapasMetodologia"
          value={formData.etapasMetodologia}
          onChange={(e) => handleInputChange('etapasMetodologia', e.target.value)}
          placeholder="Descreva as etapas e metodologia..."
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="resultadosAlcancados">Resultados alcançados (mensuráveis, indicadores, números)</Label>
        <Textarea
          id="resultadosAlcancados"
          value={formData.resultadosAlcancados}
          onChange={(e) => handleInputChange('resultadosAlcancados', e.target.value)}
          placeholder="Apresente os resultados com dados quantitativos..."
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Critérios de Avaliação</h3>
        
        <div className="space-y-2">
          <Label htmlFor="cooperacao">Cooperação (parcerias internas/externas envolvidas)</Label>
          <Textarea
            id="cooperacao"
            value={formData.cooperacao}
            onChange={(e) => handleInputChange('cooperacao', e.target.value)}
            placeholder="Descreva as parcerias e cooperações..."
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="inovacao">Inovação (o que a iniciativa traz de novo e diferenciado)</Label>
          <Textarea
            id="inovacao"
            value={formData.inovacao}
            onChange={(e) => handleInputChange('inovacao', e.target.value)}
            placeholder="Destaque os aspectos inovadores..."
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="resolutividade">Resolutividade (como a iniciativa solucionou de forma efetiva o problema)</Label>
          <Textarea
            id="resolutividade"
            value={formData.resolutividade}
            onChange={(e) => handleInputChange('resolutividade', e.target.value)}
            placeholder="Explique como o problema foi resolvido..."
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="impactoSocial">Impacto social (volume de pessoas beneficiadas, abrangência e efeitos positivos)</Label>
          <Textarea
            id="impactoSocial"
            value={formData.impactoSocial}
            onChange={(e) => handleInputChange('impactoSocial', e.target.value)}
            placeholder="Quantifique o impacto social..."
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="alinhamentoODS">Alinhamento aos ODS da ONU (indicar quais ODS foram contemplados e como)</Label>
          <Textarea
            id="alinhamentoODS"
            value={formData.alinhamentoODS}
            onChange={(e) => handleInputChange('alinhamentoODS', e.target.value)}
            placeholder="Indique os ODS contemplados..."
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="replicabilidade">Replicabilidade (potencial de ser aplicada em outras áreas, unidades ou contextos)</Label>
          <Textarea
            id="replicabilidade"
            value={formData.replicabilidade}
            onChange={(e) => handleInputChange('replicabilidade', e.target.value)}
            placeholder="Explique o potencial de replicação..."
            rows={3}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações Adicionais</h3>
        
        <div className="space-y-4">
          <Label className="text-base">Já participou de edições anteriores do Prêmio Melhores Práticas?</Label>
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
              <Label htmlFor="especificarEdicoesAnteriores">Especifique</Label>
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
          <Label className="text-base">A prática/projeto já foi vencedor em edição anterior do Prêmio Melhores Práticas?</Label>
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
            Declaro estar ciente e de acordo com as normas do Edital nº XX/2025 – 9ª Edição do Prêmio Melhores Práticas do MPPI, 
            autorizando a divulgação das informações, imagens e resultados relativos a esta inscrição, em qualquer meio institucional ou de imprensa.
          </p>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="concordaTermos"
              checked={formData.concordaTermos}
              onCheckedChange={(checked) => handleInputChange('concordaTermos', checked as boolean)}
            />
            <Label htmlFor="concordaTermos" className="text-sm font-medium">
              Concordo com os termos da declaração *
            </Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="localData">Local e data</Label>
          <Input
            id="localData"
            value={formData.localData}
            onChange={(e) => handleInputChange('localData', e.target.value)}
            placeholder="Ex: Teresina-PI, 15 de janeiro de 2025"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Prêmio Melhores Práticas MPPI
          </h1>
          <p className="text-muted-foreground">
            9ª Edição - 2025 | Ficha de Inscrição
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 px-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  isCompleted ? 'bg-success text-white' : 
                  isActive ? 'bg-primary text-white' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs text-center ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`h-px flex-1 mt-5 ${
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              Preencha todas as informações obrigatórias marcadas com *
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Anterior
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-success to-success text-white hover:opacity-90"
                  >
                    Enviar Inscrição
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InscricaoForm;