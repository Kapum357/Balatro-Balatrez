import React, { useReducer } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { PixelButton } from './PixelButton';
import { PixelText } from './PixelText';
import { Profile, ProfileUpdateRequest } from '@/.expo/types/profile';

interface ProfileFormState {
    username: string;
    avatar_url?: string | null; // Ajustado para aceptar null
    errors: {
        username?: string;
        avatar_url?: string;
    };
}

type ProfileFormAction =
    | { type: 'SET_FIELD'; field: keyof Omit<ProfileFormState, 'errors'>; value: string }
    | { type: 'SET_ERROR'; field: keyof ProfileFormState['errors']; error: string | undefined }

interface ProfileFormProps {
    initialValues?: Partial<Profile>;
    onSubmit: (values: ProfileUpdateRequest) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

const initialState: ProfileFormState = {
    username: '',
    avatar_url: '',
    errors: {},
};

function profileFormReducer(state: ProfileFormState, action: ProfileFormAction): ProfileFormState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'SET_ERROR':
            return { ...state, errors: { ...state.errors, [action.field]: action.error } };
        default:
            return state;
    }
}

export function ProfileForm({ initialValues, onSubmit, onCancel, isLoading }: ProfileFormProps) {
    const [state, dispatch] = useReducer(profileFormReducer, {
        ...initialState,
        ...initialValues,
    });

    const validateForm = (): boolean => {
        let isValid = true;

        if (!state.username.trim()) {
            dispatch({ type: 'SET_ERROR', field: 'username', error: 'El nombre de usuario es requerido' });
            isValid = false;
        } else if (state.username.length < 3) {
            dispatch({ type: 'SET_ERROR', field: 'username', error: 'El nombre debe tener al menos 3 caracteres' });
            isValid = false;
        } else {
            dispatch({ type: 'SET_ERROR', field: 'username', error: undefined });
        }

        if (state.avatar_url && !state.avatar_url.match(/^https?:\/\/.+/)) {
            dispatch({ type: 'SET_ERROR', field: 'avatar_url', error: 'La URL del avatar debe ser válida' });
            isValid = false;
        } else {
            dispatch({ type: 'SET_ERROR', field: 'avatar_url', error: undefined });
        }

        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const { errors, ...formData } = state;
        const sanitizedFormData = {
            ...formData,
            avatar_url: formData.avatar_url || '', // Convertir null a cadena vacía
        };
        await onSubmit(sanitizedFormData);
    };

    return (
        <View style={styles.container}>
            <View style={styles.field}>
                <PixelText style={styles.label}>Nombre de Usuario</PixelText>
                <TextInput
                    style={[styles.input, state.errors.username && styles.inputError]}
                    value={state.username}
                    onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'username', value })}
                    placeholder="Tu nombre de usuario"
                    maxLength={30}
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                {state.errors.username && (
                    <PixelText style={styles.errorText}>{state.errors.username}</PixelText>
                )}
            </View>

            <View style={styles.field}>
                <PixelText style={styles.label}>URL del Avatar</PixelText>
                <TextInput
                    style={[styles.input, state.errors.avatar_url && styles.inputError]}
                    value={state.avatar_url || ''} // Convertir null a cadena vacía
                    onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'avatar_url', value })}
                    placeholder="https://tu-avatar.com/imagen.png"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                />
                {state.errors.avatar_url && (
                    <PixelText style={styles.errorText}>{state.errors.avatar_url}</PixelText>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <PixelButton
                    onPress={handleSubmit}
                    disabled={isLoading}
                    style={styles.submitButton}
                >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                </PixelButton>

                {onCancel && (
                    <PixelButton
                        onPress={onCancel}
                        variant="secondary"
                        disabled={isLoading}
                        style={styles.cancelButton}
                    >
                        Cancelar
                    </PixelButton>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#ff0000',
    },
    errorText: {
        color: '#ff0000',
        marginTop: 4,
        fontSize: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24,
    },
    submitButton: {
        minWidth: 100,
    },
    cancelButton: {
        minWidth: 100,
        marginLeft: 12,
    },
});