import {Profile, ProfileUpdateRequest} from '@/.expo/types/profile'; // Cambiar la ruta de importación
import {supabase} from './supabaseClient';
import * as ImageManipulator from 'expo-image-manipulator';

export type ProfileError = {
    message: string;
    code?: string;
    details?: any;
};

const AVATAR_BUCKET = 'avatars';
const MAX_IMAGE_DIMENSION = 1024;

export async function deleteProfile(
    client: typeof supabase,
    userId: string
): Promise<{ data: Profile | undefined; error: ProfileError | null }> {
    if (!userId) {
        return {data: undefined, error: {message: 'userId es requerido'} as ProfileError};
    }

    const {error: authError} = await supabase.auth.getUser();
    if (authError) {
        return {data: undefined, error: {message: 'No autorizado', code: 'AUTH_ERROR'} as ProfileError};
    }

    const {data, error} = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error al eliminar perfil:', error);
        return {
            data: undefined,
            error: {
                message: error.message,
                code: error.code,
                details: error.details
            } as ProfileError
        };
    }

    return {data: data as Profile, error: null};
}

export async function getCurrentUserProfile(
    client: typeof supabase
): Promise<{ data: Profile | undefined; error: ProfileError | null }> {
    const {
        data: {user},
        error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
        return {
            data: undefined,
            error: {
                message: authError?.message ?? 'No hay usuario autenticado',
                code: authError?.name ?? 'AUTH_ERROR'
            } as ProfileError
        };
    }

    const {data, error} = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error al obtener perfil:', error);
        return {
            data: undefined,
            error: {
                message: error.message,
                code: error.code,
                details: error.details
            } as ProfileError
        };
    }

    return {data: data as Profile, error: null};
}

export async function updateProfile(
    client: typeof supabase,
    updates: ProfileUpdateRequest
): Promise<{ data: Profile | undefined; error: string | null }> {
    const {
        data: {user},
        error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
        return {data: undefined, error: 'No hay usuario autenticado'};
    }

    const {data, error} = await client
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error al actualizar perfil:', error);
        return {data: undefined, error: error.message};
    }

    return {data: data as Profile, error: null};
}

export async function createInitialProfile(
    client: typeof supabase,
    userId: string,
    metadata?: Partial<Profile>
): Promise<{ data: Profile | undefined; error: string | null }> {
    try {
        const {data, error} = await client
            .from('profiles') // Se añadió la referencia a la tabla 'profiles'
            .insert([{id: userId, ...metadata}])
            .select()
            .single();

        return {data, error: error ? error.message : null};
    } catch (err) {
        return {data: undefined, error: err instanceof Error ? err.message : 'Unknown error'};
    }
}

export async function getProfile(userId: string): Promise<{ data: Profile | undefined; error: any }> {
    const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    return {data, error};
}

export async function uploadAvatar(
    userId: string,
    uri: string
): Promise<{ url: string | null; error: any }> {
    try {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{resize: {width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION}}],
            {compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true}
        );

        if (!manipResult.base64) {
            return {url: null, error: {message: "No se pudo obtener base64 de la imagen"}};
        }

        const byteCharacters = atob(manipResult.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const filePath = `${userId}/${Date.now()}.jpg`;

        const {error: uploadError} = await supabase.storage
            .from(AVATAR_BUCKET)
            .upload(filePath, byteArray, {
                contentType: "image/jpeg",
                upsert: true,
            });

        if (uploadError) return {url: null, error: uploadError};

        const {data} = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        const {data: profileData, error: profileError} = await getProfile(userId);
        if (profileError) {
            console.error("Error obteniendo perfil:", profileError);
            return {url: null, error: profileError};
        }

        await updateProfile(supabase, {
            id: userId,
            avatar_url: publicUrl,
            // updated_at eliminado
            username: profileData?.username || "", // Preserve existing username
            coins: profileData?.coins || 0,       // Preserve existing coins
        });

        return {url: publicUrl, error: null};
    } catch (error) {
        console.error("Error subiendo avatar:", error);
        return {url: null, error};
    }
}