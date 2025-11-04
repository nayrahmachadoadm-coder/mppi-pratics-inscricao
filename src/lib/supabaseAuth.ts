import { supabase } from '@/integrations/supabase/client';

export async function getSupabaseSession() {
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

export async function isSupabaseAuthenticated(): Promise<boolean> {
  const session = await getSupabaseSession();
  return Boolean(session);
}

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

export async function hasSupabaseRole(role: 'admin' | 'jurado'): Promise<boolean> {
  try {
    const profile = await getCurrentProfile();
    if (!profile?.id) return false;
    const { data, error } = await (supabase as any).rpc('has_role', {
      _user_id: profile.id,
      _role: role,
    });
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}