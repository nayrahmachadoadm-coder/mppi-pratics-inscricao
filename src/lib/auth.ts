// Sistema unificado de autenticação usando Supabase Auth
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'jurado';

/**
 * Autenticar usuário via Supabase Auth
 */
export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: 'Credenciais inválidas' };
    }

    // Verificar se precisa trocar senha
    const { data: profileData } = await supabase
      .from('profiles')
      .select('must_change_password')
      .eq('auth_user_id', data.user.id)
      .single();

    return { 
      success: true, 
      mustChangePassword: profileData?.must_change_password || false 
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao autenticar' };
  }
}

/**
 * Fazer logout do usuário
 */
export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Obter sessão atual
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Verificar se usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session);
}

/**
 * Obter perfil do usuário atual
 */
export async function getCurrentProfile() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', uid)
      .single();
    
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Verificar se usuário tem determinada role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const profile = await getCurrentProfile();
    if (!profile?.id) return false;
    
  const { data, error } = await supabase.rpc('has_role_text' as any, {
      _user_id: profile.id,
      _role_text: role,
    });
    
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Verificar se usuário atual precisa trocar senha
 */
export async function currentUserMustChangePassword(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return Boolean(profile?.must_change_password);
}

/**
 * Atualizar senha do usuário
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Atualizar senha no Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    // Atualizar flag must_change_password no perfil
    const profile = await getCurrentProfile();
    if (profile?.id) {
      const { error: profileError } = await supabase.rpc('update_profile_password_flag' as any, {
        _profile_id: profile.id,
        _must_change: false
      });

      if (profileError) {
        console.error('Erro ao atualizar flag de senha:', profileError);
      }
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao atualizar senha' };
  }
}

/**
 * Reset de senha (gerar nova senha temporária) - apenas para admin
 */
export async function resetUserPassword(userEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/jurado/senha`
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao resetar senha' };
  }
}
