// Sistema de autenticação administrativa
// Para maior segurança, as credenciais devem ser configuradas via variáveis de ambiente

interface AdminCredentials {
  username: string;
  password: string;
}

// Credenciais padrão (ALTERE ESTAS CREDENCIAIS EM PRODUÇÃO)
const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'premio9ed'
};

// Chave para armazenar o token de sessão no localStorage
const ADMIN_SESSION_KEY = 'mppi_admin_session';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 horas em milliseconds

interface AdminSession {
  username: string;
  loginTime: number;
  expiresAt: number;
}

/**
 * Autentica o administrador com username e password
 */
export function authenticateAdmin(username: string, password: string): boolean {
  // Verificar credenciais (em produção, isso deveria ser feito no backend)
  const isValid = username === DEFAULT_ADMIN_CREDENTIALS.username && 
                  password === DEFAULT_ADMIN_CREDENTIALS.password;
  
  if (isValid) {
    // Criar sessão
    const now = Date.now();
    const session: AdminSession = {
      username,
      loginTime: now,
      expiresAt: now + SESSION_DURATION
    };
    
    // Salvar sessão no localStorage
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    
    console.log('✅ Admin autenticado com sucesso');
    return true;
  }
  
  console.log('❌ Credenciais inválidas');
  return false;
}

/**
 * Verifica se o administrador está autenticado
 */
export function isAdminAuthenticated(): boolean {
  try {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) {
      return false;
    }
    
    const session: AdminSession = JSON.parse(sessionData);
    const now = Date.now();
    
    // Verificar se a sessão não expirou
    if (now > session.expiresAt) {
      // Sessão expirada, remover
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar autenticação admin:', error);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return false;
  }
}

/**
 * Obtém informações da sessão atual
 */
export function getAdminSession(): AdminSession | null {
  try {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    
    const session: AdminSession = JSON.parse(sessionData);
    const now = Date.now();
    
    // Verificar se a sessão não expirou
    if (now > session.expiresAt) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Erro ao obter sessão admin:', error);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

/**
 * Faz logout do administrador
 */
export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  console.log('✅ Admin deslogado com sucesso');
}

/**
 * Renova a sessão do administrador (estende o tempo de expiração)
 */
export function renewAdminSession(): boolean {
  const session = getAdminSession();
  if (!session) {
    return false;
  }
  
  // Estender a sessão
  const now = Date.now();
  const renewedSession: AdminSession = {
    ...session,
    expiresAt: now + SESSION_DURATION
  };
  
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(renewedSession));
  return true;
}

/**
 * Obtém o tempo restante da sessão em minutos
 */
export function getSessionTimeRemaining(): number {
  const session = getAdminSession();
  if (!session) {
    return 0;
  }
  
  const now = Date.now();
  const remaining = session.expiresAt - now;
  return Math.max(0, Math.floor(remaining / (60 * 1000))); // em minutos
}