// Autenticação de usuários (administrador e jurado) baseada em localStorage
// Em produção, utilizar Supabase Auth ou backend próprio com hashing de senhas.

export type UserRole = 'admin' | 'jurado';

type UserRecord = {
  username: string;
  password: string; // Placeholder simples; não use em produção
  role: UserRole;
  created_at: number;
  mustChangePassword?: boolean;
};

type UserSession = {
  username: string;
  role: UserRole;
  loginTime: number;
  expiresAt: number;
};

const USERS_KEY = 'mppi_users';
const USER_SESSION_KEY = 'mppi_user_session';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 horas

export function listUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserRecord[]) : [];
  } catch {
    return [];
  }
}

export function registerUser(username: string, password: string, role: UserRole, mustChangePassword: boolean = false): { success: boolean; error?: string } {
  try {
    const users = listUsers();
    const exists = users.some(u => u.username === username);
    if (exists) {
      return { success: false, error: 'Usuário já existe' };
    }
    const record: UserRecord = { username, password, role, created_at: Date.now(), mustChangePassword };
    users.push(record);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao registrar usuário' };
  }
}

export function authenticateUser(username: string, password: string): { success: boolean; error?: string } {
  try {
    const users = listUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) {
      return { success: false, error: 'Credenciais inválidas' };
    }
    const now = Date.now();
    const session: UserSession = {
      username: found.username,
      role: found.role,
      loginTime: now,
      expiresAt: now + SESSION_DURATION,
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao autenticar' };
  }
}

export function getUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as UserSession;
    const now = Date.now();
    if (now > s.expiresAt) {
      localStorage.removeItem(USER_SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    localStorage.removeItem(USER_SESSION_KEY);
    return null;
  }
}

export function isUserAuthenticated(): boolean {
  return Boolean(getUserSession());
}

export function isUserRole(role: UserRole): boolean {
  const s = getUserSession();
  return Boolean(s && s.role === role);
}

export function logoutUser(): void {
  localStorage.removeItem(USER_SESSION_KEY);
}

export function getUserByUsername(username: string): UserRecord | null {
  const users = listUsers();
  return users.find(u => u.username === username) || null;
}

export function currentUserMustChangePassword(): boolean {
  const s = getUserSession();
  if (!s) return false;
  const user = getUserByUsername(s.username);
  return Boolean(user?.mustChangePassword);
}

export function updateUserPassword(username: string, newPassword: string, clearFlag: boolean = true): { success: boolean; error?: string } {
  try {
    const users = listUsers();
    const idx = users.findIndex(u => u.username === username);
    if (idx === -1) {
      return { success: false, error: 'Usuário não encontrado' };
    }
    users[idx].password = newPassword;
    if (clearFlag) {
      users[idx].mustChangePassword = false;
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Erro ao atualizar senha' };
  }
}