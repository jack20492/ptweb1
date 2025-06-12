import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'client';
  fullName: string;
  phone?: string;
  avatar?: string;
  startDate?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Initialize default admin account if no users exist
      const users = JSON.parse(localStorage.getItem('pt_users') || '[]');
      if (users.length === 0) {
        const defaultAdmin = {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@phinpt.com',
          role: 'admin',
          fullName: 'Phi Nguyễn PT',
          phone: '0123456789',
          password: 'admin123'
        };
        users.push(defaultAdmin);
        localStorage.setItem('pt_users', JSON.stringify(users));
      }

      // Check if user is logged in
      const savedUser = localStorage.getItem('pt_current_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('pt_users') || '[]');
      
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      );

      if (foundUser) {
        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password;
        setUser(userWithoutPassword);
        localStorage.setItem('pt_current_user', JSON.stringify(userWithoutPassword));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('pt_users') || '[]');
      
      // Check if email already exists
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        return false;
      }

      // Generate username from email
      const username = email.split('@')[0];
      let finalUsername = username;
      let counter = 1;
      while (users.find((u: any) => u.username === finalUsername)) {
        finalUsername = `${username}${counter}`;
        counter++;
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        username: finalUsername,
        email,
        fullName: username,
        phone: '',
        role: 'client',
        password,
        startDate: new Date().toISOString().split('T')[0]
      };

      users.push(newUser);
      localStorage.setItem('pt_users', JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('pt_current_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};