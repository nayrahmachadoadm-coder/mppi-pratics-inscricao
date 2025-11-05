// Script para inicializar o administrador no Supabase
import { supabase } from '@/integrations/supabase/client';

export async function setupInitialAdmin(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔧 Chamando edge function para configurar admin...');
    
    const { data, error } = await supabase.functions.invoke('setup-admin', {
      body: {}
    });

    if (error) {
      console.error('❌ Erro ao chamar função:', error);
      return { success: false, error: error.message };
    }

    if (data?.alreadyExists) {
      console.log('✅ Admin já existe no sistema');
      return { success: true };
    }

    console.log('✅ Admin configurado com sucesso!');
    console.log('📧 Email: admin@mppi.gov.br');
    console.log('🔑 Senha: premio9ed');
    
    return { success: true };
  } catch (e: any) {
    console.error('❌ Erro:', e);
    return { success: false, error: e?.message || 'Erro desconhecido' };
  }
}
