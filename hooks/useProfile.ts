import { useAuth } from '@/contexts/AuthContext';
import {
    createInitialProfile,
    deleteProfile as deleteProfileService,
    getCurrentUserProfile,
    updateProfile as updateProfileService,
    type ProfileError
} from '@/utils/profilesService';
import { supabase } from '@/utils/supabaseClient';
import {
    Profile,
    ProfileUpdateRequest,
    CreateProfileResult,
    UpdateProfileResult,
    DeleteProfileResult
} from '@/.expo/types/profile'; // Unificar importaciones de Profile
import { useCallback, useEffect, useState } from 'react';

export function useProfile() {
    const { session } = useAuth();
    const [profile, setProfile] = useState<Profile | undefined>(undefined);
    const [error, setError] = useState<ProfileError | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    const refreshProfile = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const { data, error: supabaseError } = await getCurrentUserProfile(supabase);
            if (supabaseError) {
                setError(supabaseError);
                return;
            }
            setProfile(data as Profile | undefined); // Garantizar que 'data' sea del tipo correcto
        } catch (err) {
            setError({
                message: err instanceof Error ? err.message : 'Error desconocido',
                code: 'UNKNOWN_ERROR'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const createProfile = useCallback(
        async (metadata: { username: string; avatar_url?: string; }): Promise<CreateProfileResult> => {
            if (!session?.user?.id) {
                return {
                    success: false,
                    error: { message: 'Usuario no autenticado' }
                };
            }
            try {
                const result = await createInitialProfile(supabase, session.user.id, metadata); // Agregar 'supabase' y 'session.user.id' como argumentos
                if (result.error) {
                    return {
                        success: false,
                        error: result.error
                    };
                }
                return {
                    success: true,
                    data: result.data
                };
            } catch (err) {
                return {
                    success: false,
                    error: {
                        message: err instanceof Error ? err.message : 'Error desconocido'
                    }
                };
            }
        },
        [session]
    );

    const updateProfile = useCallback(
        async (updates: ProfileUpdateRequest): Promise<UpdateProfileResult> => {
            try {
                const result = await updateProfileService(supabase, updates); // Agregar 'supabase' como primer argumento
                if (result.error) {
                    return {
                        success: false,
                        error: result.error
                    };
                }
                return {
                    success: true,
                    data: result.data
                };
            } catch (err) {
                return {
                    success: false,
                    error: {
                        message: err instanceof Error ? err.message : 'Error desconocido'
                    }
                };
            }
        },
        []
    );

    const deleteProfile = useCallback(
        async (): Promise<DeleteProfileResult> => {
            try {
                if (!session?.user?.id) {
                    return {
                        success: false,
                        error: {
                            message: 'Usuario no autenticado',
                        },
                    };
                }
                const result = await deleteProfileService(supabase, session.user.id); // Agregar 'supabase' y 'session.user.id' como argumentos
                if (result.error) {
                    return {
                        success: false,
                        error: result.error
                    };
                }
                return { success: true };
            } catch (err) {
                return {
                    success: false,
                    error: {
                        message: err instanceof Error ? err.message : 'Error desconocido'
                    }
                };
            }
        },
        [session]
    );

    useEffect(() => {
        if (session?.user) {
            refreshProfile();
        } else {
            setProfile(undefined);
            setError(undefined); // Cambiar null por undefined
            setLoading(false);
        }
    }, [session, refreshProfile]);

    return {
        profile,
        loading,
        error,
        refreshProfile,
        createProfile,
        updateProfile,
        deleteProfile
    };
}