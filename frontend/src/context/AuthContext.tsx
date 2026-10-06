import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProfile } from '../types.ts';
import { api, authStorage } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; targetRole?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileState: (updatedProfile: UserProfile) => void;
  quickDemoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = authStorage.getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response.success && response.user) {
          setUser(response.user);
          setToken(storedToken);
        } else {
          authStorage.removeToken();
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session validation failed:', err);
        authStorage.removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.auth.login(credentials);
      if (response.success && response.token) {
        authStorage.setToken(response.token);
        setToken(response.token);
        setUser(response.user);
        return response;
      } else {
        throw new Error(response.message || 'Login failed. Invalid response received.');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; targetRole?: string }) => {
    setLoading(true);
    try {
      const response = await api.auth.register(userData);
      if (response.success && response.token) {
        authStorage.setToken(response.token);
        setToken(response.token);
        setUser(response.user);
        return response;
      } else {
        throw new Error(response.message || 'Registration failed. Invalid response received.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.auth.logout();
      }
    } catch (err) {
      console.warn('Logout network notification:', err);
    } finally {
      authStorage.removeToken();
      setToken(null);
      setUser(null);
    }
  };

  const updateProfileState = (updatedProfile: UserProfile) => {
    if (user) {
      setUser({
        ...user,
        profile: updatedProfile,
      });
    }
  };

  const quickDemoLogin = async () => {
    await login({
      email: 'dev@skillnexus.ai',
      password: 'password123',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        updateProfileState,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
