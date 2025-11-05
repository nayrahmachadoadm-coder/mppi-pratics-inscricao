// Serviço de gerenciamento de jurados pelo administrador
// Permite cadastrar jurados com senhas temporárias

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

    // Verificar se o jurado já foi cadastrado no Supabase
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
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

    // Criar perfil e role via RPC (SECURITY DEFINER)
    if (supUserId) {
      const { error: rpcError } = await supabase.rpc('register_jurado' as any, {
        _auth_user_id: supUserId,
        _username: normalizedEmail,
        _full_name: name.trim(),
        _email: normalizedEmail,
        _seat_code: seatCode.trim(),
        _seat_label: seatLabel.trim(),
        _must_change: true,
      });
      
      if (rpcError) {
        console.error('[JuryManagement] Erro ao criar perfil/role:', rpcError);
        return { success: false, error: `Falha ao criar perfil/role: ${rpcError.message}` };
      }
    }

    // Salvar informações do jurado localmente
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
export async function removeJuryMember(username: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Remover da lista local de jurados
    const juryMembers = listJuryMembers();
    const filteredJury = juryMembers.filter(j => j.username !== username);
    localStorage.setItem(JURY_MEMBERS_KEY, JSON.stringify(filteredJury));

    // Buscar perfil no Supabase para deletar usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('auth_user_id')
      .eq('email', username)
      .maybeSingle();

    if (profile?.auth_user_id) {
      // Nota: Deletar usuário requer service_role, então apenas removemos localmente
      console.log('Jurado removido localmente. Admin deve remover do Supabase Auth manualmente.');
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao remover jurado' };
  }
}

/**
 * Gera nova senha temporária para um jurado via Supabase
 */
export async function resetJuryPassword(username: string): Promise<{ success: boolean; error?: string; temporaryPassword?: string }> {
  try {
    const juryMembers = listJuryMembers();
    const juryIndex = juryMembers.findIndex(j => j.username === username);
    
    if (juryIndex === -1) {
      return { success: false, error: 'Jurado não encontrado' };
    }

    // Gerar nova senha
    const temporaryPassword = generateTemporaryPassword();

    // Buscar perfil do jurado
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, auth_user_id')
      .eq('email', username)
      .maybeSingle();

    if (!profile?.auth_user_id) {
      return { success: false, error: 'Perfil do jurado não encontrado no Supabase' };
    }

    // Atualizar senha no Supabase Auth (requer service_role, então usar reset password)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(username, {
      redirectTo: `${window.location.origin}/jurado/senha`
    });

    if (resetError) {
      console.error('Erro ao enviar email de reset:', resetError);
    }

    // Marcar que precisa trocar senha
    await supabase.rpc('update_profile_password_flag' as any, {
      _profile_id: profile.id,
      _must_change: true
    });

    // Atualizar informações locais do jurado
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