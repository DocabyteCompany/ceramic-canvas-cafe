import { useState, useEffect } from 'react';
import { AuthService } from '@/services/authService';
import type { User } from '@supabase/supabase-js';

export interface UseAuthReturn {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  verifyingAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // NO verificar admin aquí para evitar loops - se hará en useEffect separado
        setIsAdmin(false); // Temporalmente false hasta verificar
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Verificar admin cuando el usuario cambie (separado para evitar loops)
  useEffect(() => {
    if (user && !isAdmin) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      setVerifyingAdmin(true);
      const adminStatus = await AuthService.isCurrentUserAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('❌ [useAuth] Error verificando admin:', error);
      setIsAdmin(false);
    } finally {
      setVerifyingAdmin(false);
    }
  };

  /**
   * Verificar el estado actual de autenticación
   */
  const checkAuth = async (): Promise<void> => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const adminStatus = await AuthService.isCurrentUserAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    } catch (error: any) {
      console.error('❌ [useAuth] Error verificando autenticación:', error);
      setUser(null);
      setIsAdmin(false);
    }
  };

  /**
   * Iniciar sesión
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Objeto con success y error
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await AuthService.login(email, password);
      
      if (error) {
        console.error('❌ [useAuth] Error en login:', error);
        return { success: false, error };
      }
      
      if (data?.user) {
        // Verificar si es admin después del login
        const adminStatus = await AuthService.isCurrentUserAdmin();
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          // Si no es admin, cerrar sesión inmediatamente
          await AuthService.logout();
          setUser(null);
          setIsAdmin(false);
          return { 
            success: false, 
            error: 'No tienes permisos de administrador' 
          };
        }
        
        setUser(data.user);
        return { success: true };
      }
      
      return { success: false, error: 'Error inesperado en el login' };
    } catch (error: any) {
      console.error('❌ [useAuth] Error inesperado en login:', error);
      return { success: false, error: error.message || 'Error inesperado al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   * @returns Objeto con success y error
   */
  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { error } = await AuthService.logout();
      
      if (error) {
        console.error('❌ [useAuth] Error en logout:', error);
        return { success: false, error };
      }
      
      setUser(null);
      setIsAdmin(false);
      return { success: true };
    } catch (error: any) {
      console.error('❌ [useAuth] Error inesperado en logout:', error);
      return { success: false, error: error.message || 'Error inesperado al cerrar sesión' };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAdmin,
    loading,
    verifyingAdmin,
    login,
    logout,
    checkAuth
  };
};
