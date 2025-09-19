import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, FileText, Globe } from 'lucide-react';

interface FormData {
  nomeCompleto: string;
  cargoFuncao: string;
  matricula: string;
  unidadeSetor: string;
  telefoneInstitucional: string;
  emailInstitucional: string;
  [key: string]: any;
}

interface Step1Props {
  formData: FormData;
  handleInputChange: (field: string, value: string | boolean) => void;
}

const Step1: React.FC<Step1Props> = React.memo(({ formData, handleInputChange }) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="nomeCompleto" className="text-sm sm:text-base font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          Nome completo *
        </Label>
        <Input
          id="nomeCompleto"
          value={formData.nomeCompleto}
          onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
          placeholder="Digite seu nome completo"
          className="text-sm sm:text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cargoFuncao" className="text-sm sm:text-base font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          Cargo/Função *
        </Label>
        <Select value={formData.cargoFuncao} onValueChange={(value) => handleInputChange('cargoFuncao', value)}>
          <SelectTrigger id="cargoFuncao">
            <SelectValue placeholder="Selecione seu cargo" />
          </SelectTrigger>
          <SelectContent position="popper" className="z-50">
            <SelectItem value="procurador-de-justica">Procurador de Justiça</SelectItem>
            <SelectItem value="promotor-de-justica">Promotor de Justiça</SelectItem>
            <SelectItem value="servidor">Servidor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="matricula" className="text-sm sm:text-base font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Matrícula *
        </Label>
        <Input
          id="matricula"
          value={formData.matricula}
          onChange={(e) => handleInputChange('matricula', e.target.value)}
          placeholder="Digite sua matrícula"
          className="text-sm sm:text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="unidadeSetor" className="text-sm sm:text-base font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Unidade/Setor de lotação *
        </Label>
        <Input
          id="unidadeSetor"
          value={formData.unidadeSetor}
          onChange={(e) => handleInputChange('unidadeSetor', e.target.value)}
          placeholder="Digite sua unidade ou setor"
          className="text-sm sm:text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="telefoneInstitucional" className="text-sm sm:text-base font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Telefone institucional *
        </Label>
        <Input
          id="telefoneInstitucional"
          value={formData.telefoneInstitucional}
          onChange={(e) => handleInputChange('telefoneInstitucional', e.target.value)}
          placeholder="(00) 0000-0000"
          className="text-sm sm:text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="emailInstitucional" className="text-sm sm:text-base font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          E-mail institucional *
        </Label>
        <Input
          id="emailInstitucional"
          type="email"
          value={formData.emailInstitucional}
          onChange={(e) => handleInputChange('emailInstitucional', e.target.value)}
          placeholder="seuemail@mppi.mp.br"
          className="text-sm sm:text-base"
        />
      </div>
    </div>
  </div>
));

Step1.displayName = 'Step1';

export default Step1;