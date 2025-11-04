// Serviço de gerenciamento de jurados pelo administrador
// Permite cadastrar jurados com senhas temporárias

import { registerUser, listUsers, updateUserPassword } from './userAuth';
import { supabase } from '@/integrations/supabase/client';

export interface JuryMember {
  username: string;
  name: string;
  temporaryPassword: string;
  created_at: number;
  created_by: string;
  seatCode: string; // código da vaga (ex.: PGJ1, APMP, UFPI, etc.)
  seatLabel: string; // label amigável da vaga
}

const JURY_MEMBERS_KEY = 'mppi_jury_members';

/**
 * Gera uma senha temporária aleatória
 */
function generateTemporaryPassword(): string {
  // Senha temporária com 6 caracteres alfanuméricos
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  let password = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * charset.length);
    password += charset[idx];
  }
  return password;
}

/**
 * Lista todos os jurados cadastrados
 */
export function listJuryMembers(): JuryMember[] {
  try {
    const raw = localStorage.getItem(JURY_MEMBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Cadastra um novo jurado com senha temporária
 */
export async function registerJuryMember(
  username: string,
  name: string,
  createdBy: string,
  seatCode: string,
  seatLabel: string
): Promise<{ success: boolean; error?: string; temporaryPassword?: string }> {
  try {
    // Validar dados
    const normalizedEmail = username.trim().toLowerCase();
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!normalizedEmail || !name.trim() || !seatCode.trim()) {
      return { success: false, error: 'Todos os campos são obrigatórios' };
    }

    // Validar formato de e-mail antes de chamar Supabase
    if (!isValidEmail(normalizedEmail)) {
      return { success: false, error: 'E-mail inválido. Informe um e-mail no formato nome@dominio.' };
    }

    // Verificar se o username já existe
    const existingUsers = listUsers();
    if (existingUsers.some(u => u.username.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Nome de usuário já existe' };
    }

    // Verificar se o jurado já foi cadastrado
    const existingJury = listJuryMembers();
    if (existingJury.some(j => j.username.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Jurado já cadastrado' };
    }

    // Gerar senha temporária
    const temporaryPassword = generateTemporaryPassword();

    // Registrar via Supabase Auth (usa "username" como e-mail)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: temporaryPassword,
    });
    if (signUpError) {
      return { success: false, error: `Falha ao criar usuário no Supabase: ${signUpError.message}` };
    }
    const supUserId = signUpData.user?.id;

    // Criar perfil e atribuir papel via RPC (SECURITY DEFINER)
    if (supUserId) {
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('register_jurado', {
        _auth_user_id: supUserId,
        _username: normalizedEmail,
        _full_name: name.trim(),
        _email: normalizedEmail,
        _seat_code: seatCode.trim(),
        _seat_label: seatLabel.trim(),
        _must_change: true,
      });
      if (rpcError) {
        const msg = String(rpcError.message || '');
        const isMissingRpc = msg.includes('Could not find the function') || msg.includes('schema cache') || msg.toLowerCase().includes('not found');
        if (isMissingRpc) {
          // Prosseguir sem bloquear o cadastro: perfil/role ficam pendentes até aplicar a migração
          console.warn('[JuryManagement] RPC register_jurado ausente. Prosseguindo com cadastro local e Supabase Auth.');
        } else {
          return { success: false, error: `Falha ao criar perfil/role: ${rpcError.message}` };
        }
      }
    }

    // Registrar também no sistema local como fallback
    const userResult = registerUser(normalizedEmail, temporaryPassword, 'jurado', true);
    if (!userResult.success) {
      return { success: false, error: userResult.error };
    }

    // Salvar informações do jurado
    const juryMember: JuryMember = {
      username: normalizedEmail,
      name: name.trim(),
      temporaryPassword,
      created_at: Date.now(),
      created_by: createdBy,
      seatCode: seatCode.trim(),
      seatLabel: seatLabel.trim(),
    };

    const juryMembers = listJuryMembers();
    juryMembers.push(juryMember);
    localStorage.setItem(JURY_MEMBERS_KEY, JSON.stringify(juryMembers));

    return { success: true, temporaryPassword };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao cadastrar jurado' };
  }
}

/**
 * Remove um jurado do sistema
 */
export function removeJuryMember(username: string): { success: boolean; error?: string } {
  try {
    // Remover da lista de jurados
    const juryMembers = listJuryMembers();
    const filteredJury = juryMembers.filter(j => j.username !== username);
    localStorage.setItem(JURY_MEMBERS_KEY, JSON.stringify(filteredJury));

    // Remover do sistema de usuários
    const users = listUsers();
    const filteredUsers = users.filter(u => u.username !== username);
    localStorage.setItem('mppi_users', JSON.stringify(filteredUsers));

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao remover jurado' };
  }
}

/**
 * Gera nova senha temporária para um jurado
 */
export function resetJuryPassword(username: string): { success: boolean; error?: string; temporaryPassword?: string } {
  try {
    const juryMembers = listJuryMembers();
    const juryIndex = juryMembers.findIndex(j => j.username === username);
    
    if (juryIndex === -1) {
      return { success: false, error: 'Jurado não encontrado' };
    }

    // Gerar nova senha
    const temporaryPassword = generateTemporaryPassword();

    // Atualizar no sistema de usuários
    // Atualizar no sistema de usuários e requerer nova troca
    const updateResult = updateUserPassword(username, temporaryPassword, false);
    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }
    // Marcar que precisa trocar novamente a senha
    const users = listUsers();
    const idx = users.findIndex(u => u.username === username);
    if (idx !== -1) {
      users[idx].mustChangePassword = true;
      localStorage.setItem('mppi_users', JSON.stringify(users));
    }

    // Atualizar informações do jurado
    juryMembers[juryIndex].temporaryPassword = temporaryPassword;
    localStorage.setItem(JURY_MEMBERS_KEY, JSON.stringify(juryMembers));

    return { success: true, temporaryPassword };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao resetar senha' };
  }
}

/**
 * Busca informações de um jurado específico
 */
export function getJuryMember(username: string): JuryMember | null {
  const juryMembers = listJuryMembers();
  return juryMembers.find(j => j.username === username) || null;
}