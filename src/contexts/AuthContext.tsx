import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
      // Check if user is logged in locally first
      const savedUser = localStorage.getItem('pt_current_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      }

      // If Supabase is available, try to get session
      if (supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('Supabase session error:', error);
            setLoading(false);
            return;
          }

          if (session?.user) {
            // Try to load user profile from Supabase
            try {
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('auth_user_id', session.user.id)
                .maybeSingle();

              if (profile) {
                const userData = {
                  id: profile.id,
                  username: profile.username,
                  email: profile.email,
                  role: profile.role,
                  fullName: profile.full_name,
                  phone: profile.phone || undefined,
                  avatar: profile.avatar_url || undefined,
                  startDate: profile.start_date,
                };
                setUser(userData);
                localStorage.setItem('pt_current_user', JSON.stringify(userData));
              }
            } catch (profileError) {
              console.warn('Could not load user profile, using basic auth data');
              // Create basic user from auth data
              const basicUser = {
                id: session.user.id,
                username: session.user.email?.split('@')[0] || 'user',
                email: session.user.email || '',
                role: 'client' as const,
                fullName: session.user.email?.split('@')[0] || 'User',
              };
              setUser(basicUser);
              localStorage.setItem('pt_current_user', JSON.stringify(basicUser));
            }
          }
        } catch (supabaseError) {
          console.warn('Supabase initialization failed:', supabaseError);
        }
      }
    } catch (error) {
      console.warn('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // If Supabase is available, try Supabase auth first
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data.user) {
            // Try to get user profile
            try {
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('auth_user_id', data.user.id)
                .maybeSingle();

              if (profile) {
                const userData = {
                  id: profile.id,
                  username: profile.username,
                  email: profile.email,
                  role: profile.role,
                  fullName: profile.full_name,
                  phone: profile.phone || undefined,
                  avatar: profile.avatar_url || undefined,
                  startDate: profile.start_date,
                };
                setUser(userData);
                localStorage.setItem('pt_current_user', JSON.stringify(userData));
                return true;
              }
            } catch (profileError) {
              console.warn('Could not load profile, creating basic user');
              const basicUser = {
                id: data.user.id,
                username: email.split('@')[0],
                email,
                role: 'client' as const,
                fullName: email.split('@')[0],
              };
              setUser(basicUser);
              localStorage.setItem('pt_current_user', JSON.stringify(basicUser));
              return true;
            }
          }
        } catch (supabaseError) {
          console.warn('Supabase login failed, trying localStorage fallback');
        }
      }

      // Fallback to localStorage authentication
      const users = JSON.parse(localStorage.getItem('pt_users') || '[]');
      
      // Initialize default admin if no users exist
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
      // If Supabase is available, try Supabase auth first
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (!error && data.user) {
            // Try to create user profile
            const username = email.split('@')[0];
            try {
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  auth_user_id: data.user.id,
                  username,
                  email,
                  full_name: username,
                  role: 'client',
                });

              if (!profileError) {
                return true;
              }
            } catch (profileError) {
              console.warn('Could not create user profile in database');
            }
            return true; // Auth succeeded even if profile creation failed
          }
        } catch (supabaseError) {
          console.warn('Supabase registration failed, trying localStorage fallback');
        }
      }

      // Fallback to localStorage registration
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
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.warn('Supabase logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('pt_current_user');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};