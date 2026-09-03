import InscricaoForm from '@/components/InscricaoForm';

const Index = ({ isAdminBypass = false }: { isAdminBypass?: boolean }) => {
  return <InscricaoForm isAdminBypass={isAdminBypass} />;
};

export default Index;

