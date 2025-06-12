import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabase } from '../hooks/useSupabase';
import type { Profile } from '../lib/supabase';

interface User extends Profile {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
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
  const { signIn, signUp, signOut, getProfile } = useSupabase();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          setUser({
            ...profile,
            email: session.user.email || ''
          });
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            setUser({
              ...profile,
              email: session.user.email || ''
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [getProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn(email, password);
      return !!result?.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, userData: any): Promise<boolean> => {
    try {
      const result = await signUp(email, password, userData);
      return !!result?.user;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAdmin, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};