import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { deleteInscricao } from '@/lib/adminService';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  FileText,
  User,
  Building
} from 'lucide-react';

export interface InscricaoDeleteTarget {
  id: string;
  titulo_iniciativa: string;
  nome_completo?: string;
  lotacao?: string;
  area_atuacao?: string;
}

interface DeleteInscricaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  inscricao: InscricaoDeleteTarget | null;
  onSuccess: (deletedId: string) => void;
}

const areaLabelMap: Record<string, string> = {
  'finalistica-projeto': 'Projetos Finalísticos',
  'estruturante-projeto': 'Projetos Estruturantes',
  'finalistica-pratica': 'Práticas Finalísticas',
  'estruturante-pratica': 'Práticas Estruturantes',
};

export const DeleteInscricaoModal: React.FC<DeleteInscricaoModalProps> = ({
  isOpen,
  onClose,
  inscricao,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmWord, setConfirmWord] = useState('');
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  // Resetar estados ao abrir/fechar ou trocar de inscrição
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmWord('');
      setConfirmCheck(false);
      setIsDeleting(false);
      setErrorMessage('');
    }
  }, [isOpen, inscricao?.id]);

  if (!inscricao) return null;

  const handleNextStep = () => {
    setErrorMessage('');
    setStep(2);
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setStep(1);
  };

  const isStep2Valid =
    confirmWord.trim().toUpperCase() === 'EXCLUIR' && confirmCheck && !isDeleting;

  const handleDelete = async () => {
    if (!isStep2Valid) return;

    try {
      setIsDeleting(true);
      setErrorMessage('');

      const result = await deleteInscricao(inscricao.id);

      if (result.success) {
        toast({
          title: 'Trabalho excluído com sucesso',
          description: `O trabalho "${inscricao.titulo_iniciativa}" foi eliminado do banco de dados.`,
        });
        onSuccess(inscricao.id);
        onClose();
      } else {
        setErrorMessage(result.error || 'Não foi possível excluir o trabalho. Tente novamente.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro inesperado ao tentar excluir o trabalho.');
    } finally {
      setIsDeleting(false);
    }
  };

  const categoriaFormatada = inscricao.area_atuacao
    ? areaLabelMap[inscricao.area_atuacao] || inscricao.area_atuacao
    : 'Não informada';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 border-b pb-3">
            <div className="flex items-center gap-2">
              {step === 1 ? (
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center animate-pulse">
                  <AlertOctagon className="w-5 h-5" />
                </div>
              )}
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  {step === 1 ? 'Excluir Trabalho Inscrito' : 'Confirmação Final de Exclusão'}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  {step === 1
                    ? 'Etapa 1 de 2: Revisão das informações do trabalho'
                    : 'Etapa 2 de 2: Confirmação de segurança definitiva'}
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant={step === 1 ? 'outline' : 'destructive'}
              className={`text-xs uppercase font-semibold ${
                step === 1 ? 'border-amber-400 text-amber-700 bg-amber-50' : ''
              }`}
            >
              Etapa {step}/2
            </Badge>
          </div>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive" className="my-2">
            <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* ── ETAPA 1: Apresentação dos dados e aviso de impacto ── */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <Alert className="border-amber-200 bg-amber-50/70 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-xs leading-relaxed">
                Utilize esta opção para remover inscrições realizadas em <strong>duplicidade</strong> ou{' '}
                <strong>categoria incorreta</strong> por equívoco do proponente.
              </AlertDescription>
            </Alert>

            {/* Cartão de Identificação do Trabalho */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-3.5 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-gray-500 block text-[11px] uppercase">
                    Título da Iniciativa
                  </span>
                  <span className="font-bold text-gray-900 text-sm block">
                    {inscricao.titulo_iniciativa}
                  </span>
                </div>
              </div>

              {inscricao.nome_completo && (
                <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    <strong className="text-gray-700">Proponente:</strong> {inscricao.nome_completo}
                  </span>
                </div>
              )}

              {inscricao.lotacao && (
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    <strong className="text-gray-700">Lotação:</strong> {inscricao.lotacao}
                  </span>
                </div>
              )}

              <div className="pt-1 border-t border-gray-200/60">
                <span className="inline-block px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700 font-medium text-[11px]">
                  Categoria: {categoriaFormatada}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Ao avançar, este trabalho e todos os registros associados (avaliações de jurados, votos populares e histórico) serão marcados para eliminação definitiva.
            </p>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button variant="outline" onClick={onClose} type="button">
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleNextStep}
                type="button"
                className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"
              >
                Prosseguir para Etapa 2
                <ArrowRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ── ETAPA 2: Confirmação de Segurança com digitação e checkbox ── */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-900">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <AlertTitle className="font-bold text-xs uppercase text-red-800">
                Ação Irreversível
              </AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1">
                Esta ação <strong>NÃO</strong> poderá ser desfeita. O trabalho será{' '}
                <strong>completamente eliminado do banco de dados</strong>.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label htmlFor="confirm-input" className="block text-xs font-semibold text-gray-700">
                Para confirmar a exclusão de <span className="text-red-700 font-bold">"{inscricao.titulo_iniciativa}"</span>, digite a palavra{' '}
                <span className="font-mono bg-red-100 text-red-800 px-1 py-0.5 rounded font-bold">
                  EXCLUIR
                </span>{' '}
                no campo abaixo:
              </label>
              <Input
                id="confirm-input"
                type="text"
                value={confirmWord}
                onChange={(e) => setConfirmWord(e.target.value)}
                placeholder="Digite EXCLUIR"
                autoFocus
                disabled={isDeleting}
                className="font-mono uppercase tracking-widest text-center border-red-300 focus-visible:ring-red-500 font-bold text-sm"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <Checkbox
                id="confirm-checkbox"
                checked={confirmCheck}
                onCheckedChange={(checked) => setConfirmCheck(Boolean(checked))}
                disabled={isDeleting}
                className="mt-0.5 border-red-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <label
                htmlFor="confirm-checkbox"
                className="text-xs text-gray-700 leading-tight cursor-pointer select-none"
              >
                Confirmo que verifiquei este trabalho e estou ciente de que ele será apagado
                definitivamente de forma imediata.
              </label>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={isDeleting}
                type="button"
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!isStep2Valid}
                type="button"
                className="gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Excluindo do banco...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirmar e Excluir Definitivamente
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteInscricaoModal;
