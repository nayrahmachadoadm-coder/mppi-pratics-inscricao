import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import PublicRedirect from "./pages/PublicRedirect";
import AdminHome from "./pages/AdminHome";
import AdminInscricaoDetails from "./pages/AdminInscricaoDetails";
import AdminCategorias from "./pages/AdminCategorias";
import AdminCategoriaList from "./pages/AdminCategoriaList";
import AdminRegulamento from "./pages/AdminRegulamento";
import AdminVotoPopular from "./pages/AdminVotoPopular";
import VotoPopular from "./pages/VotoPopular";
import AdminPremiacao from "./pages/AdminPremiacao";
import AdminAvaliacao from "./pages/AdminAvaliacao";
import AdminJulgamento from "./pages/AdminJulgamento";
import AdminRelatorioCategoria from "./pages/AdminRelatorioCategoria";
import AdminRelatorioJurados from "./pages/AdminRelatorioJurados";
import AdminCronograma from "./pages/AdminCronograma";
import AdminEdicoesAnteriores from "./pages/AdminEdicoesAnteriores";
import JuryManagement from "./components/JuryManagement";
import UserPasswordChange from "./pages/UserPasswordChange";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import EitherProtectedRoute from "./components/EitherProtectedRoute";
import TopNav from "./components/TopNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TopNav />
        <Routes>
          {/* Página principal passa a ser o login do sistema de gestão */}
          <Route path="/" element={<AdminLogin />} />
          {/* Redirecionamento de páginas públicas antigas para o login */}
          <Route path="/confirmacao" element={<PublicRedirect />} />
          <Route path="/index" element={<PublicRedirect />} />
          <Route path="/inscricao" element={<PublicRedirect />} />
          <Route path="/admin/login" element={<AdminLogin />} />
           <Route path="/admin/categorias" element={
             <EitherProtectedRoute>
               <AdminCategorias />
             </EitherProtectedRoute>
           } />
           <Route path="/admin/inscritos" element={
             <EitherProtectedRoute>
               <AdminCategorias />
             </EitherProtectedRoute>
           } />
           <Route path="/admin/regulamento" element={
            <EitherProtectedRoute>
              <AdminRegulamento />
            </EitherProtectedRoute>
           } />
           <Route path="/admin/jurados" element={
             <EitherProtectedRoute>
               <JuryManagement />
             </EitherProtectedRoute>
            } />
            <Route path="/jurado/senha" element={
              <RoleProtectedRoute role="jurado">
                <UserPasswordChange />
              </RoleProtectedRoute>
            } />
           <Route path="/admin/categoria/:area" element={
             <EitherProtectedRoute>
               <AdminCategoriaList />
             </EitherProtectedRoute>
           } />
           {/* Página de Julgamento: permitir acesso a jurados e admins para testes */}
           <Route path="/admin/julgamento" element={
             <EitherProtectedRoute>
               <AdminJulgamento />
             </EitherProtectedRoute>
           } />
           <Route path="/admin" element={
             <EitherProtectedRoute>
               <AdminHome />
             </EitherProtectedRoute>
           } />
           <Route path="/admin/inscricao/:id" element={
             <EitherProtectedRoute>
               <AdminInscricaoDetails />
             </EitherProtectedRoute>
           } />
           {/* Avaliação pode ser realizada por administrador ou jurado */}
           <Route path="/admin/avaliacao/:id" element={
             <EitherProtectedRoute>
               <AdminAvaliacao />
             </EitherProtectedRoute>
           } />
           <Route path="/admin/relatorio/:area" element={
             <ProtectedRoute>
               <AdminRelatorioCategoria />
             </ProtectedRoute>
           } />
           <Route path="/admin/relatorio-jurados/:area" element={
             <ProtectedRoute>
               <AdminRelatorioJurados />
             </ProtectedRoute>
           } />
           <Route path="/admin/cronograma" element={
            <EitherProtectedRoute>
              <AdminCronograma />
            </EitherProtectedRoute>
           } />
           <Route path="/admin/edicoes-anteriores" element={
            <EitherProtectedRoute>
              <AdminEdicoesAnteriores />
            </EitherProtectedRoute>
           } />
           <Route path="/admin/voto-popular" element={
             <ProtectedRoute>
               <AdminVotoPopular />
             </ProtectedRoute>
           } />
           {/* Rota pública para Voto Popular (divulgação e votação aberta) */}
           <Route path="/voto-popular" element={<VotoPopular />} />
           <Route path="/admin/premiacao" element={
            <EitherProtectedRoute>
              <AdminPremiacao />
            </EitherProtectedRoute>
           } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
