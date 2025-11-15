import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEMP_PASSWORD = 'Mppi#2025!';

type ResetBody = {
  email?: string;
  username?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client com token do usuário para validar permissões
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verificar se quem chama é admin
    const { data: userInfo } = await userClient.auth.getUser();
    const authUserId = userInfo.user?.id;
    if (!authUserId) {
      return new Response(JSON.stringify({ success: false, error: 'not_authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: profileData, error: profErr } = await userClient
      .from('profiles')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (profErr || !profileData?.id) {
      return new Response(JSON.stringify({ success: false, error: 'profile_not_found' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: isAdmin } = await userClient.rpc('has_role_text' as any, { _user_id: profileData.id, _role_text: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ success: false, error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Ler payload
    const body = (await req.json().catch(() => ({}))) as ResetBody;
    const targetEmail = (body.email || '').toLowerCase().trim();
    const targetUsername = (body.username || '').toLowerCase().trim();
    if (!targetEmail && !targetUsername) {
      return new Response(JSON.stringify({ success: false, error: 'missing_target' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Descobrir userId e profileId do alvo
    let targetUserId: string | null = null;
    let targetProfileId: string | null = null;

    if (targetEmail) {
      const { data: allUsers } = await adminClient.auth.admin.listUsers();
      const found = allUsers?.users.find((u: any) => (u.email || '').toLowerCase() === targetEmail) || null;
      targetUserId = found?.id || null;
      if (!targetUserId) {
        return new Response(JSON.stringify({ success: false, error: 'user_not_found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const { data: prof } = await adminClient
        .from('profiles')
        .select('id')
        .eq('auth_user_id', targetUserId)
        .maybeSingle();
      targetProfileId = prof?.id || null;
    } else if (targetUsername) {
      const { data: prof } = await adminClient
        .from('profiles')
        .select('id, auth_user_id')
        .eq('username', targetUsername)
        .maybeSingle();
      targetProfileId = prof?.id || null;
      targetUserId = prof?.auth_user_id || null;
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ success: false, error: 'user_not_found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Atualizar senha no Auth
    const { error: updErr } = await adminClient.auth.admin.updateUserById(targetUserId, { password: TEMP_PASSWORD });
    if (updErr) {
      return new Response(JSON.stringify({ success: false, error: updErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Marcar que deve trocar senha
    if (targetProfileId) {
      await adminClient.rpc('update_profile_password_flag' as any, { _profile_id: targetProfileId, _must_change: true });
    }

    return new Response(JSON.stringify({ success: true, tempPassword: TEMP_PASSWORD }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error?.message || 'unknown_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

