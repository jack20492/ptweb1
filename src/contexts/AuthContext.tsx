import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabase } from '../hooks/useSupabase';
import type { Profile } from '../lib/supabase';

interface User extends Profile {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, signOut, getProfile } = useSupabase();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setError(null);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (sessionError.message?.includes('Failed to fetch')) {
            setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.');
          } else {
            setError('Lỗi xác thực. Vui lòng thử lại.');
          }
          setLoading(false);
          return;
        }

        if (session?.user) {
          try {
            const profile = await getProfile(session.user.id);
            if (profile) {
              setUser({
                ...profile,
                email: session.user.email || ''
              });
            } else {
              console.warn('No profile found for user:', session.user.id);
              setError('Không tìm thấy thông tin người dùng. Vui lòng liên hệ quản trị viên.');
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (error instanceof Error && error.message?.includes('Failed to fetch')) {
          setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và cấu hình Supabase.');
        } else {
          setError('Lỗi hệ thống. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        try {
          setError(null);
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
        } catch (error) {
          console.error('Error handling auth state change:', error);
          if (error instanceof Error && error.message?.includes('Failed to fetch')) {
            setError('Mất kết nối với máy chủ. Vui lòng kiểm tra kết nối internet.');
          } else {
            setError('Lỗi xác thực. Vui lòng thử lại.');
          }
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [getProfile]);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await signIn(emailOrUsername, password);
      
      if (result?.user) {
        // The auth state change listener will handle setting the user
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error && error.message?.includes('Failed to fetch')) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await signUp(email, password, userData);
      
      if (result?.user) {
        // For email confirmation disabled, user should be signed in immediately
        // The auth state change listener will handle setting the user
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof Error && error.message?.includes('Failed to fetch')) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      if (error instanceof Error && error.message?.includes('Failed to fetch')) {
        setError('Không thể kết nối đến máy chủ khi đăng xuất.');
      } else {
        setError('Lỗi khi đăng xuất. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
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
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};