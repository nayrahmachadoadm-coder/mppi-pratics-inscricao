import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import PublicRedirect from "./pages/PublicRedirect";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInscricaoDetails from "./pages/AdminInscricaoDetails";
import AdminCategorias from "./pages/AdminCategorias";
import AdminCategoriaList from "./pages/AdminCategoriaList";
import AdminRegulamento from "./pages/AdminRegulamento";
import AdminAvaliacao from "./pages/AdminAvaliacao";
import AdminRelatorioCategoria from "./pages/AdminRelatorioCategoria";
import JuryManagement from "./components/JuryManagement";
import UserPasswordChange from "./pages/UserPasswordChange";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import EitherProtectedRoute from "./components/EitherProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
           <Route path="/admin/regulamento" element={
             <ProtectedRoute>
               <AdminRegulamento />
             </ProtectedRoute>
           } />
           <Route path="/admin/jurados" element={
             <ProtectedRoute>
               <JuryManagement />
             </ProtectedRoute>
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
           <Route path="/admin/dashboard" element={
             <ProtectedRoute>
               <AdminDashboard />
             </ProtectedRoute>
           } />
           <Route path="/admin/inscricao/:id" element={
             <ProtectedRoute>
               <AdminInscricaoDetails />
             </ProtectedRoute>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
