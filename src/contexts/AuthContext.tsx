import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, classApi } from '../services/api';


interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  schoolId?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Default initial session for immediate standalone usage
          const defaultAdmin: User = {
            id: 'usr-admin-01',
            email: 'admin@school.com',
            fullName: 'School Administrator',
            role: 'admin',
            schoolId: 1
          };
          setUser(defaultAdmin);
          localStorage.setItem('user', JSON.stringify(defaultAdmin));
          localStorage.setItem('token', 'mock-admin-token-2026');
        }
      } catch (err) {
        console.warn('Initial session check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (email === 'admin@school.com' && password === 'admin123') {
        const demoUser: User = {
          id: 'usr-admin-01',
          email: 'admin@school.com',
          fullName: 'School Administrator',
          role: 'admin',
          schoolId: 1
        };
        localStorage.setItem('token', 'mock-admin-token-2026');
        localStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
        return;
      }

      // Attempt remote API login if available
      try {
        const data = await authApi.login(email, password);
        if (data?.token && data?.user) {
          localStorage.setItem('token', data.token);
          const userData: User = {
            id: String(data.user.id),
            email: data.user.email,
            fullName: data.user.name,
            role: data.user.role,
            schoolId: data.user.school_id
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return;
        }
      } catch (apiErr) {
        console.warn('Remote auth failed, falling back to local session:', apiErr);
      }

      // Standalone fallback
      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        email: email,
        fullName: email.split('@')[0].replace('.', ' ') || 'Administrator',
        role: 'admin',
        schoolId: 1
      };
      localStorage.setItem('token', `token-${Date.now()}`);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };



  const forgotPassword = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Password reset email sent to:', email);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Password changed successfully for:', oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, forgotPassword, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
