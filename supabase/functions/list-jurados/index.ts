import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Exige usuário autenticado, mas permite qualquer role
    const { data: userInfo } = await userClient.auth.getUser();
    if (!userInfo.user) {
      return new Response(JSON.stringify({ success: false, error: 'not_authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await (adminClient as any)
      .from('profiles')
      .select('username, full_name, created_at, seat_code, seat_label, user_roles!inner(role)')
      .eq('user_roles.role', 'jurado')
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const rows = (data || []).map((p: any) => ({
      username: p.username,
      full_name: p.full_name,
      created_at: p.created_at,
      seat_code: p.seat_code,
      seat_label: p.seat_label,
    }));

    return new Response(JSON.stringify({ success: true, data: rows }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error?.message || 'unknown_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

