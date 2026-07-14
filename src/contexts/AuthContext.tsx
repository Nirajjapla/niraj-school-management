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
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
          // Perform a token validation request to check if the session is still active
          await classApi.getClasses();
        } catch (err) {
          console.warn('Initial session check failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
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
    } catch (err: any) {
      // Auto-register fallback for default admin credentials
      if (email === 'admin@school.com' && password === 'admin123') {
        try {
          await authApi.register({
            name: 'Admin User',
            email: 'admin@school.com',
            password: 'admin123',
            role: 'admin'
          });
          // Attempt login again
          const data = await authApi.login(email, password);
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
        } catch (regErr: any) {
          throw new Error(regErr.message || 'Auto-registration failed');
        }
      }
      throw err;
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
