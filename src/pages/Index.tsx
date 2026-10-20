import InscricaoForm from '@/components/InscricaoForm';
import InscricoesEncerradas from '@/components/InscricoesEncerradas';

const Index = ({ isAdminBypass = false }: { isAdminBypass?: boolean }) => {
  if (isAdminBypass) {
    return <InscricaoForm isAdminBypass={true} />;
  }
  return <InscricoesEncerradas />;
};

export default Index;

