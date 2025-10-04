import { supabase } from '@/lib/supabase';

export class AuthService {
  /**
   * Iniciar sesión con email y contraseña
   * @param email - Email del administrador
   * @param password - Contraseña del administrador
   * @returns Objeto con data (usuario) y error (si hay)
   */
  static async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { data: null, error: error.message };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error inesperado al iniciar sesión' };
    }
  }

  /**
   * Cerrar sesión del usuario actual
   * @returns Objeto con error (si hay)
   */
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error inesperado al cerrar sesión' };
    }
  }

  /**
   * Verificar si el usuario actual es administrador
   * Usa función de Supabase para evitar recursión RLS
   * @returns true si es admin, false si no
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return false;
      }

      // Usar la función de Supabase para evitar recursión RLS
      const { data, error } = await supabase.rpc('is_user_admin', {
        user_uuid: user.id
      });

      if (error) {
        return false;
      }
      return data === true;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Obtener el usuario actual autenticado
   * @returns Usuario actual o null si no está autenticado
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return null;
      }
      
      return user;
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Obtener la sesión actual
   * @returns Sesión actual o null si no hay sesión
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return null;
      }
      
      return session;
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Escuchar cambios en el estado de autenticación
   * @param callback - Función a ejecutar cuando cambie el estado
   * @returns Función para desuscribirse
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}
