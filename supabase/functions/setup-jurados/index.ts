import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Juror = {
  fullName: string;
  email: string;
  seatCode?: string | null;
  seatLabel?: string | null;
};

const TEMP_PASSWORD = 'Mppi#2026!';

const jurors: Juror[] = [];

function sanitizeUsernameFromEmail(email: string): string {
  const local = email.split('@')[0].toLowerCase();
  return local.replace(/[^a-z0-9_\.]+/g, '').replace(/[\.]+/g, '.');
}

async function ensureProfileAndRole(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  username: string,
  fullName: string,
  email: string,
  seatCode?: string | null,
  seatLabel?: string | null,
) {
  // Verifica se já existe perfil vinculado
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, username')
    .eq('auth_user_id', userId)
    .maybeSingle();

  if (!existingProfile) {
    // Cria perfil e atribui role jurado via RPC
    const { error: rpcError } = await supabaseAdmin.rpc('register_jurado' as any, {
      _auth_user_id: userId,
      _username: username,
      _full_name: fullName,
      _email: email,
      _seat_code: seatCode ?? null,
      _seat_label: seatLabel ?? null,
      _must_change: true,
    });
    if (rpcError) throw rpcError;
    return { createdProfile: true };
  }

  // Garante role jurado
  const { data: roles } = await supabaseAdmin
    .from('user_roles')
    .select('id, role')
    .eq('user_id', existingProfile.id);

  const hasJurado = Array.isArray(roles) && roles.some(r => String(r.role) === 'jurado');
  if (!hasJurado) {
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: existingProfile.id, role: 'jurado' });
    if (roleError) throw roleError;
  }

  // Atualiza username caso esteja vazio (opcional)
  if (!existingProfile.username) {
    const { error: updError } = await supabaseAdmin
      .from('profiles')
      .update({ username })
      .eq('id', existingProfile.id);
    if (updError) throw updError;
  }

  return { createdProfile: false };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Aceitar jurados via body ou usar lista padrão
    const body = await req.json().catch(() => ({}));
    const jurorsToProcess = body.jurors || jurors;

    const results: any[] = [];

    for (const j of jurorsToProcess) {
      const username = sanitizeUsernameFromEmail(j.email);

      let userId = '';
      let createdAuth = false;

      // Tentar achar pelo email no profiles (mais rápido e sem limite de paginação do Auth)
      const { data: profileByEmail } = await supabaseAdmin
        .from('profiles')
        .select('auth_user_id')
        .eq('email', j.email)
        .maybeSingle();

      if (profileByEmail?.auth_user_id) {
        userId = profileByEmail.auth_user_id;
      } else {
        let authData: any = null;
        let authError: any = null;
        
        try {
          const res = await supabaseAdmin.auth.admin.createUser({
            email: j.email,
            password: TEMP_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: j.fullName, role: 'jurado' },
          });
          authData = res.data;
          authError = res.error;
        } catch (e: any) {
          authError = e;
        }

        if (authError) {
          let page = 1;
          while (!userId && page < 100) {
            const { data: pageData } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
            if (!pageData || pageData.users.length === 0) {
              break;
            }
            const found = pageData.users.find((u: any) => u.email?.toLowerCase() === j.email.toLowerCase());
            if (found) {
              userId = found.id;
              break;
            }
            page++;
          }
          if (!userId) {
            throw authError; // throw the original error if we STILL can't find them
          }
        } else {
          userId = authData.user?.id || '';
          createdAuth = true;
        }
      }

      if (!userId) throw new Error(`ID do usuário não encontrado para ${j.email}`);

      // Garante perfil e role
      const profRes = await ensureProfileAndRole(
        supabaseAdmin,
        userId,
        username,
        j.fullName,
        j.email,
        j.seatCode ?? null,
        j.seatLabel ?? null,
      );

      results.push({
        email: j.email,
        fullName: j.fullName,
        username,
        createdAuth,
        tempPassword: createdAuth ? TEMP_PASSWORD : undefined,
        createdProfile: profRes.createdProfile,
      });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error: any) {
    console.error('❌ Erro ao cadastrar jurados:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro desconhecido' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});