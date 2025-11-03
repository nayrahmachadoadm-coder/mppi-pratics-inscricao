import React from 'react';

const AdminHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <div className="mb-6">
          <img src="/favicon.ico" alt="Ícone" className="h-8 w-8 mx-auto opacity-80" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Bem-vindo</h1>
        <p className="text-gray-600">
          Selecione uma opção no menu acima para acessar os dados do sistema.
        </p>
      </div>
    </div>
  );
};

export default AdminHome;