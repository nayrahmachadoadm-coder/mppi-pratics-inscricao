// Configuração do Supabase
const supabaseUrl = 'https://ljbxctmywdpsfmjvmlmh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYnhjdG15d2Rwc2ZtanZtbG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzY5MTYsImV4cCI6MjA3MzUxMjkxNn0.7A5d6_TvKyRV2Csqf43hkXzvaCd-5b2tKKlAU4ucyaY';

// Inicializar Supabase
let supabase;

// Função para inicializar o Supabase
async function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        return true;
    }
    return false;
}

// Função para exibir resultados
function showResult(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="${type}"><pre>${message}</pre></div>`;
}

// 1. Verificar Status RLS
async function checkRLSStatus() {
    showResult('rlsResult', '🔍 Verificando status do RLS...', 'info');
    
    if (!supabase) {
        await initSupabase();
    }
    
    try {
        // Tentar uma consulta simples
        const { data, error } = await supabase
            .from('inscricoes')
            .select('count(*)')
            .limit(1);

        if (error) {
            showResult('rlsResult', `❌ ERRO RLS: ${error.message}\nCódigo: ${error.code}`, 'error');
        } else {
            showResult('rlsResult', `✅ RLS OK! Total de registros: ${data[0]?.count || 0}`, 'success');
        }
    } catch (err) {
        showResult('rlsResult', `💥 Erro: ${err.message}`, 'error');
    }
}

// 2. Verificar Campo Matricula
async function checkMatriculaField() {
    showResult('matriculaResult', '🔍 Verificando campo matricula...', 'info');
    
    if (!supabase) {
        await initSupabase();
    }
    
    try {
        // Fazer uma consulta SQL para verificar a estrutura da coluna
        const { data, error } = await supabase.rpc('check_matricula_field');
        
        if (error) {
            // Se a função não existir, tentar uma abordagem alternativa
            showResult('matriculaResult', `⚠️ Não foi possível verificar diretamente.\nTentando inserção de teste...`, 'warning');
            
            // Tentar inserção sem matricula para testar
            await testInsertWithoutMatricula();
        } else {
            showResult('matriculaResult', `✅ Campo matricula verificado: ${JSON.stringify(data, null, 2)}`, 'success');
        }
    } catch (err) {
        showResult('matriculaResult', `💥 Erro: ${err.message}`, 'error');
    }
}

// 3. Testar Inserção SEM Matricula
async function testInsertWithoutMatricula() {
    showResult('insertResult', '🧪 Testando inserção SEM matricula...', 'info');
    
    if (!supabase) {
        await initSupabase();
    }
    
    const testData = {
        nome_completo: 'Teste Sem Matricula',
        cargo_funcao: 'Analista de Teste',
        telefone: '(86) 99999-9999',
        email_institucional: 'teste.sem.matricula@mppi.mp.br',
        lotacao: 'Unidade de Teste',
        area_atuacao: 'Tecnologia da Informação',
        titulo_iniciativa: 'Teste Sem Campo Matricula',
        data_inicio: '2024',
        publico_alvo: 'Servidores',
        descricao_iniciativa: 'Teste para verificar se matricula é opcional',
        objetivos: 'Verificar funcionamento sem matricula',
        metodologia: 'Inserção JavaScript',
        principais_resultados: 'Campo matricula agora é opcional',
        cooperacao: 'Excelente',
        inovacao: 'Alta',
        resolutividade: 'Muito boa',
        impacto_social: 'Significativo',
        alinhamento_ods: 'ODS 16',
        replicabilidade: 'Alta',
        participou_edicoes_anteriores: false,
        foi_vencedor_anterior: false,
        declaracao: true
        // Note que matricula não está sendo fornecida
    };

    try {
        const { data, error } = await supabase
            .from('inscricoes')
            .insert([testData])
            .select();

        if (error) {
            if (error.code === '23502' && error.message.includes('matricula')) {
                showResult('insertResult', `❌ CAMPO MATRICULA AINDA É OBRIGATÓRIO!\n\nERRO: ${error.message}\n\nSOLUÇÃO:\n1. Execute o script 'fix-matricula-field.sql' no Supabase Dashboard\n2. Vá em: SQL Editor\n3. Cole e execute o script\n4. Volte aqui e teste novamente`, 'error');
            } else {
                showResult('insertResult', `❌ ERRO: ${error.message}\nCódigo: ${error.code}`, 'error');
            }
        } else {
            showResult('insertResult', `🎉 SUCESSO! Inserção sem matricula funcionou!\n\nID: ${data[0]?.id}\nNome: ${data[0]?.nome_completo}\nMatricula: ${data[0]?.matricula || 'NULL (correto!)'}`, 'success');
            
            // Limpar o registro de teste
            if (data[0]?.id) {
                await supabase.from('inscricoes').delete().eq('id', data[0].id);
                showResult('insertResult', 
                    document.getElementById('insertResult').innerHTML.replace('</pre></div>', '\n\n🧹 Registro de teste removido automaticamente.</pre></div>')
                );
            }
        }
    } catch (err) {
        showResult('insertResult', `💥 Erro inesperado: ${err.message}`, 'error');
    }
}

// 4. Simular Formulário Completo
async function simulateFormSubmission() {
    showResult('formResult', '📝 Simulando formulário completo...', 'info');
    
    if (!supabase) {
        await initSupabase();
    }
    
    const formData = {
        nome_completo: 'João Silva Teste Completo',
        cargo_funcao: 'Analista de Sistemas',
        telefone: '(86) 99999-9999',
        email_institucional: 'joao.completo@mppi.mp.br',
        lotacao: 'Coordenadoria de TI',
        area_atuacao: 'Tecnologia da Informação',
        titulo_iniciativa: 'Sistema de Gestão Digital',
        data_inicio: '2024',
        publico_alvo: 'Servidores do MPPI',
        descricao_iniciativa: 'Sistema para digitalização de processos',
        objetivos: 'Modernizar os processos internos',
        metodologia: 'Desenvolvimento ágil',
        principais_resultados: 'Redução de 50% no tempo de processos',
        cooperacao: 'Excelente',
        inovacao: 'Alta',
        resolutividade: 'Muito boa',
        impacto_social: 'Significativo',
        alinhamento_ods: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
        replicabilidade: 'Alta',
        participou_edicoes_anteriores: false,
        foi_vencedor_anterior: false,
        declaracao: true
    };

    try {
        const { data, error } = await supabase
            .from('inscricoes')
            .insert([formData])
            .select();

        if (error) {
            showResult('formResult', `❌ ERRO no formulário: ${error.message}\nCódigo: ${error.code}`, 'error');
        } else {
            showResult('formResult', `🎉 FORMULÁRIO FUNCIONANDO PERFEITAMENTE!\n\nID: ${data[0]?.id}\nNome: ${data[0]?.nome_completo}\nÁrea: ${data[0]?.area_atuacao}`, 'success');
            
            // Limpar registro
            if (data[0]?.id) {
                await supabase.from('inscricoes').delete().eq('id', data[0].id);
                showResult('formResult', 
                    document.getElementById('formResult').innerHTML.replace('</pre></div>', '\n\n🧹 Registro de teste removido.</pre></div>')
                );
            }
        }
    } catch (err) {
        showResult('formResult', `💥 Erro: ${err.message}`, 'error');
    }
}

// 5. Limpar Dados de Teste
async function cleanupTestData() {
    showResult('cleanupResult', '🧹 Limpando dados de teste...', 'info');
    
    if (!supabase) {
        await initSupabase();
    }
    
    try {
        // Remover registros de teste
        const { data, error } = await supabase
            .from('inscricoes')
            .delete()
            .or('nome_completo.ilike.%teste%,email_institucional.ilike.%teste%')
            .select();

        if (error) {
            showResult('cleanupResult', `❌ Erro na limpeza: ${error.message}`, 'error');
        } else {
            showResult('cleanupResult', `✅ Limpeza concluída!\nRegistros removidos: ${data?.length || 0}`, 'success');
        }
    } catch (err) {
        showResult('cleanupResult', `💥 Erro: ${err.message}`, 'error');
    }
}

// Inicializar quando a página carregar
window.addEventListener('load', async function() {
    const initialized = await initSupabase();
    if (!initialized) {
        console.error('Erro ao inicializar Supabase');
    }
});