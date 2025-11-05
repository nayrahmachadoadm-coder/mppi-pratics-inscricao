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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔧 Configurando administrador inicial...');

    const adminEmail = 'admin@mppi.gov.br';
    const adminPassword = 'premio9ed';

    // Verificar se admin já existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUsers?.users.some(u => u.email === adminEmail);

    if (adminExists) {
      console.log('✅ Administrador já existe no sistema');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Administrador já existe',
          alreadyExists: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar usuário admin via Supabase Auth
    console.log('📝 Criando usuário admin no Supabase Auth...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador MPPI',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError);
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('ID do usuário não retornado');
    }

    console.log('✅ Usuário criado:', userId);

    // Criar perfil e role via RPC
    console.log('📝 Criando perfil e role via RPC...');
    const { data: profileData, error: rpcError } = await supabaseAdmin.rpc('register_admin', {
      _auth_user_id: userId,
      _username: 'admin',
      _full_name: 'Administrador MPPI',
      _email: adminEmail
    });

    if (rpcError) {
      console.error('❌ Erro ao criar perfil/role:', rpcError);
      throw rpcError;
    }

    console.log('✅ Perfil e role criados com sucesso!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Senha:', adminPassword);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Administrador configurado com sucesso',
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro ao configurar admin:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
