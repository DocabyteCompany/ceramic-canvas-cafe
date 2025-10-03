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
    console.log('🔧 [useAuth] Configurando listener de autenticación');
    
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('🔄 [useAuth] Cambio en autenticación:', event, 'Session:', !!session);
      
      if (session?.user) {
        console.log('👤 [useAuth] Usuario encontrado:', session.user.email);
        setUser(session.user);
        // NO verificar admin aquí para evitar loops - se hará en useEffect separado
        setIsAdmin(false); // Temporalmente false hasta verificar
      } else {
        console.log('🔍 [useAuth] No hay usuario autenticado');
        setUser(null);
        setIsAdmin(false);
      }
      
      console.log('🏁 [useAuth] Finalizando verificación, estableciendo loading: false');
      setLoading(false);
    });

    return () => {
      console.log('🧹 [useAuth] Limpiando listener de autenticación');
      subscription.unsubscribe();
    };
  }, []);

  // Verificar admin cuando el usuario cambie (separado para evitar loops)
  useEffect(() => {
    if (user && !isAdmin) {
      console.log('🔍 [useAuth] Verificando admin para usuario:', user.email);
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      setVerifyingAdmin(true);
      console.log('🔍 [useAuth] Llamando a AuthService.isCurrentUserAdmin()...');
      const adminStatus = await AuthService.isCurrentUserAdmin();
      console.log('✅ [useAuth] Resultado verificación admin:', adminStatus);
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
        console.log('✅ [useAuth] Usuario autenticado:', currentUser.email, 'Admin:', adminStatus);
      } else {
        setIsAdmin(false);
        console.log('🔍 [useAuth] No hay usuario autenticado');
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
      console.log('🔐 [useAuth] Iniciando login para:', email);
      setLoading(true);
      
      const { data, error } = await AuthService.login(email, password);
      
      if (error) {
        console.error('❌ [useAuth] Error en login:', error);
        return { success: false, error };
      }
      
      if (data?.user) {
        console.log('✅ [useAuth] Login exitoso, verificando admin...');
        // Verificar si es admin después del login
        const adminStatus = await AuthService.isCurrentUserAdmin();
        console.log('🔍 [useAuth] Resultado verificación admin en login:', adminStatus);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          console.log('❌ [useAuth] Usuario no es admin, cerrando sesión');
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
        console.log('✅ [useAuth] Login exitoso para admin:', email);
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
      console.log('🚪 [useAuth] Iniciando logout');
      setLoading(true);
      
      const { error } = await AuthService.logout();
      
      if (error) {
        console.error('❌ [useAuth] Error en logout:', error);
        return { success: false, error };
      }
      
      setUser(null);
      setIsAdmin(false);
      console.log('✅ [useAuth] Logout exitoso');
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
