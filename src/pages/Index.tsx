import InscricaoForm from '@/components/InscricaoForm';
import InscricoesEncerradas from '@/components/InscricoesEncerradas';
import VotoPopular from '@/pages/VotoPopular';

const INICIO_VOTACAO_OFICIAL = new Date('2026-11-12T00:00:00-03:00');
const FIM_VOTACAO_OFICIAL = new Date('2026-11-23T23:59:59-03:00');

const Index = ({ isAdminBypass = false }: { isAdminBypass?: boolean }) => {
  if (isAdminBypass) {
    return <InscricaoForm isAdminBypass={true} />;
  }

  const agora = new Date();
  if (agora >= INICIO_VOTACAO_OFICIAL && agora <= FIM_VOTACAO_OFICIAL) {
    return <VotoPopular />;
  }

  return <InscricoesEncerradas />;
};

export default Index;

