import { supabase } from '@/integrations/supabase/client';

export type JuryMember = {
  username: string;
  name: string;
  created_at: number;
  created_by: string;
  seatCode: string;
  seatLabel: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Função para obter membros do júri do Supabase
export async function getJuryMembers(): Promise<JuryMember[]> {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        username,
        full_name,
        created_at,
        seat_code,
        seat_label,
        user_roles!inner(role)
      `)
      .eq('user_roles.role', 'jurado')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar jurados:', error);
      return [];
    }

    return (profiles || []).map(p => ({
      username: p.username || '',
      name: p.full_name || '',
      created_at: new Date(p.created_at).getTime(),
      created_by: 'admin',
      seatCode: p.seat_code || '',
      seatLabel: p.seat_label || '',
    }));
  } catch (error) {
    console.error('Erro ao buscar jurados:', error);
    return [];
  }
}

// Função para adicionar um novo membro ao júri via Edge Function
export async function addJuryMember(
  name: string,
  email: string,
  createdBy: string,
  seatCode: string,
  seatLabel: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedName = name.trim();

  if (!normalizedEmail || !normalizedName) {
    return { success: false, error: 'Nome e e-mail são obrigatórios' };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { success: false, error: 'E-mail inválido' };
  }

  if (!seatCode.trim() || !seatLabel.trim()) {
    return { success: false, error: 'Código e rótulo da cadeira são obrigatórios' };
  }

  try {
    // Chamar a edge function setup-jurados para criar o jurado
    const { data, error } = await supabase.functions.invoke('setup-jurados', {
      body: {
        jurors: [{
          fullName: normalizedName,
          email: normalizedEmail,
          seatCode: seatCode.trim(),
          seatLabel: seatLabel.trim(),
        }]
      }
    });

    if (error) {
      console.error('Erro ao cadastrar jurado:', error);
      return { success: false, error: error.message || 'Erro ao cadastrar jurado' };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Erro ao cadastrar jurado' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao cadastrar jurado:', error);
    return { success: false, error: error.message || 'Erro ao cadastrar jurado' };
  }
}

// Função para remover um membro do júri
export async function removeJuryMember(username: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Buscar o perfil do jurado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, auth_user_id')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Jurado não encontrado' };
    }

    // Remover role de jurado
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', profile.id)
      .eq('role', 'jurado');

    if (roleError) {
      console.error('Erro ao remover role:', roleError);
      return { success: false, error: 'Erro ao remover permissões do jurado' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover jurado:', error);
    return { success: false, error: error.message || 'Erro ao remover jurado' };
  }
}

// Função para resetar senha de um jurado (força troca de senha)
export async function resetJuryPassword(username: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Buscar o perfil do jurado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, auth_user_id, email')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Jurado não encontrado' };
    }

    // Marcar que precisa trocar senha
    const { error: updateError } = await supabase.rpc('update_profile_password_flag', {
      _profile_id: profile.id,
      _must_change: true
    });

    if (updateError) {
      console.error('Erro ao marcar reset de senha:', updateError);
      return { success: false, error: 'Erro ao solicitar troca de senha' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao resetar senha:', error);
    return { success: false, error: error.message || 'Erro ao resetar senha' };
  }
}
