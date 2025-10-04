import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { createInitialProfile } from '@/utils/profilesService';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string, avatarUrl?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string, avatarUrl: string = '') => {
    if (!email || !password || !username) {
      setError('Todos los campos son requeridos');
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        Alert.alert('Error de registro', signUpError.message);
        return;
      }

      const user = signUpData?.user;
      if (!user?.id) {
        setError('No se pudo crear el usuario');
        Alert.alert('Error', 'No se pudo crear el usuario');
        return;
      }

      const { error: profileError } = await createInitialProfile(supabase, user.id, {
        username,
        avatar_url: avatarUrl,
      });

      if (profileError) {
        if (profileError === 'El perfil ya existe') {
          Alert.alert('Advertencia', 'El perfil ya existe para este usuario.');
        } else {
          setError(profileError);
          Alert.alert('Error al crear perfil', profileError);
          // Limpiar el usuario creado si falla la creación del perfil
          await supabase.auth.signOut();
        }
        return;
      }

      Alert.alert(
        'Registro exitoso',
        '¡Verifica tu correo electrónico para el enlace de confirmación!'
      );
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Ocurrió un error inesperado';
      setError(errorMessage);
      Alert.alert('Error inesperado', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        Alert.alert('Error de inicio de sesión', error.message);
        return;
      }

      if (data.user) {
        // Login exitoso, el listener de sesión se encargará de actualizar el estado
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido durante el inicio de sesión';
      setError(errorMessage);
      Alert.alert('Error inesperado', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        Alert.alert('Error al cerrar sesión', error.message);
        return;
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido al cerrar sesión';
      setError(errorMessage);
      Alert.alert('Error inesperado', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}