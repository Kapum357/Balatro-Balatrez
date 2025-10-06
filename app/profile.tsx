import {NotificationToast} from '@/components/NotificationToast';
import {PixelButton} from '@/components/PixelButton';
import {PixelText} from '@/components/PixelText';
import {ProfileForm} from '@/components/ProfileForm';
import {useProfile} from '@/hooks/useProfile';
import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Alert, Image, ScrollView, StyleSheet, View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useRouter} from 'expo-router';
import {supabase} from '@/utils/supabaseClient';
import {uploadAvatar} from '@/utils/profilesService';
import {Profile, ProfileUpdateRequest} from "@/.expo/types/profile";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#2c3e50',
    },
    profileInfo: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#3498db',
    },
    placeholderAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        marginBottom: 16,
        backgroundColor: '#bdc3c7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#95a5a6',
    },
    placeholderAvatarText: {
        fontSize: 48,
        color: '#7f8c8d',
    },
    infoContainer: {
        marginBottom: 24,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#2c3e50',
    },
    usernameEmpty: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#95a5a6',
        fontStyle: 'italic',
    },
    stats: {
        fontSize: 16,
        marginBottom: 8,
        color: '#34495e',
        textAlign: 'center',
    },
    statsHighlight: {
        fontSize: 18,
        marginBottom: 8,
        color: '#27ae60',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    errorText: {
        color: '#e74c3c',
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12,
    },
    editButton: {
        flex: 1,
    },
    deleteButton: {
        flex: 1,
    },
    createProfileContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    welcomeText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: '#7f8c8d',
    },
});

export default function ProfileScreen() {
    const {profile, loading, error, createProfile, updateProfile, deleteProfile, refreshProfile} = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);
    const router = useRouter();

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setNotification({message, type});
    }, []);

    const handleCreateProfile = async (values: Partial<Profile>) => {
        if (!values.username?.trim()) {
            showNotification('El nombre de usuario es obligatorio', 'error');
            return;
        }

        const result = await createProfile({
            username: values.username.trim(),
            avatar_url: values.avatar_url ?? undefined // Corrige null a undefined
        });

        if (!result.success) {
            showNotification(
                typeof result.error === 'string'
                    ? result.error
                    : result.error?.message || 'Error desconocido',
                'error'
            );
        } else {
            showNotification('Perfil creado correctamente', 'success');
        }
    };

    const handleUpdateProfile = async (values: Partial<ProfileUpdateRequest>) => {
        if (!values.username?.trim()) {
            showNotification('El nombre de usuario es obligatorio', 'error');
            return;
        }

        if (!profile) {
            showNotification('Perfil no encontrado', 'error');
            return;
        }

        const result = await updateProfile({
            id: profile.id,
            username: values.username.trim(),
            avatar_url: values.avatar_url ?? undefined, // Corrige null a undefined
            coins: profile.coins
        });

        if (!result.success) {
            showNotification(
                typeof result.error === 'string'
                    ? result.error
                    : result.error?.message || 'Error al actualizar',
                'error'
            );
        } else {
            setIsEditing(false);
            showNotification('Perfil actualizado correctamente', 'success');
            await refreshProfile();
        }
    };
    useCallback(async () => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar tu perfil? Esta acción no se puede deshacer.',
            [
                {text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteProfile();
                        if (!result.success) {
                            showNotification(
                                typeof result.error === 'string'
                                    ? result.error
                                    : result.error?.message || 'Error al eliminar',
                                'error'
                            );
                        } else {
                            showNotification('Perfil eliminado correctamente', 'success');
                        }
                    },
                },
            ]
        );
    }, [deleteProfile, showNotification]);

    const handleImagePick = async () => {
        try {
            const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Error', 'Se necesitan permisos para acceder a la galería');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Revertido para compatibilidad
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                const {data: {user}} = await supabase.auth.getUser();
                if (!user) return;

                const {url, error} = await uploadAvatar(user.id, result.assets[0].uri);

                if (error) {
                    Alert.alert('Error', 'No se pudo subir la imagen');
                    return;
                }

                if (url && profile) {
                    const updateResult: {
                        success: boolean;
                        error?: { message: string; code?: string } | string;
                        data?: Profile
                    } = await updateProfile({
                        id: profile.id,
                        avatar_url: url,
                        username: profile.username,
                        coins: profile.coins
                    });

                    if (updateResult.error) {
                        const errorMsg =
                            typeof updateResult.error === 'string'
                                ? updateResult.error
                                : updateResult.error.message;
                        showNotification(errorMsg, 'error');
                    } else {
                        showNotification('Avatar actualizado correctamente', 'success');
                        refreshProfile();
                    }
                }
            }
        } catch {
            Alert.alert('Error', 'Ocurrió un error al seleccionar la imagen');
        }
    };

    const handleCameraPress = () => {
        router.push('/camera');
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3498db"/>
                <PixelText style={{marginTop: 16, color: '#7f8c8d'}}>
                    Cargando perfil...
                </PixelText>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <PixelText style={styles.errorText}>
                    {error.message || 'Ha ocurrido un error'}
                </PixelText>
                <PixelButton onPress={() => window.location.reload()}>
                    Reintentar
                </PixelButton>
            </View>
        );
    }

    if (!profile) {
        return (
            <ScrollView style={styles.container}>
                <PixelText style={styles.title}>Crear Tu Perfil</PixelText>
                <View style={styles.createProfileContainer}>
                    <PixelText style={styles.welcomeText}>
                        ¡Bienvenido! Crea tu perfil para comenzar a jugar.
                    </PixelText>
                    <ProfileForm
                        onSubmit={handleCreateProfile}
                        isLoading={loading}
                    />
                </View>
            </ScrollView>
        );
    }


    return (
        <ScrollView style={styles.container}>
            <PixelText style={styles.title}>Tu Perfil</PixelText>

            {!isEditing ? (
                <View style={styles.profileInfo}>
                    {profile.avatar_url ? (
                        <Image
                            source={{uri: profile.avatar_url}}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.placeholderAvatar}>
                            <PixelText style={styles.placeholderAvatarText}>
                                {profile.username ? profile.username.charAt(0).toUpperCase() : '?'}
                            </PixelText>
                        </View>
                    )}

                    <View style={styles.infoContainer}>
                        <PixelText style={profile.username ? styles.username : styles.usernameEmpty}>
                            {profile.username || '(Sin nombre)'}
                        </PixelText>
                        <PixelText style={styles.stats}>
                            Monedas: {profile.coins || 0}
                        </PixelText>
                        <PixelText style={styles.stats}>
                            Partidas jugadas: {profile.games_played || 0}
                        </PixelText>
                        <PixelText style={styles.statsHighlight}>
                            Mejor puntuación: {profile.highest_score || 0}
                        </PixelText>
                    </View>

                    <View style={styles.buttonContainer}>
                        <PixelButton
                            title="Editar Perfil"
                            onPress={() => setIsEditing(true)}
                            style={styles.editButton}
                        />
                        <PixelButton
                            title="Cambiar Avatar"
                            onPress={handleImagePick}
                            style={styles.editButton}
                        />
                        <PixelButton
                            title="Usar Cámara"
                            onPress={handleCameraPress}
                            style={styles.editButton}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.profileInfo}>
                    <ProfileForm
                        initialValues={{
                            username: profile.username || '',
                            avatar_url: profile.avatar_url ?? undefined, // Corrige null a undefined
                        }}
                        onSubmit={handleUpdateProfile}
                        onCancel={() => setIsEditing(false)}
                        isLoading={loading}
                    />
                </View>
            )}

            {notification && (
                <NotificationToast
                    message={notification.message}
                    type={notification.type}
                    onDismiss={() => setNotification(null)}
                />
            )}
        </ScrollView>
    );
}