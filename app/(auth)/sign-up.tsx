import {supabase} from '@/utils/supabaseClient';
import {PixelButton} from '@/components/PixelButton';
import {Theme} from '@/constants/Theme';
import {useAuth} from '@/contexts/AuthContext';
import {useRouter} from 'expo-router';
import {useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {createInitialProfile} from '@/utils/profilesService';

type SignUpResult = {
    user?: { id: string; email?: string }; // Ajusta según la estructura real del usuario
    error?: { message: string };
};

async function localSignUp(email: string, password: string, username: string): Promise<SignUpResult> {
    try {
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                }
            }
        });
        if (error) {
            return {error: {message: error.message}};
        }
        if (data?.user) {
            return {user: {id: data.user.id, email: data.user.email}};
        }
        return {error: {message: 'User creation failed.'}};
    } catch {
        return {error: {message: 'An unexpected error occurred.'}};
    }
}

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const {loading} = useAuth();
    const router = useRouter();

    const handleSignUp = async () => {
        // Input validation
        if (!email || !password || !username) {
            setError('All fields are required.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            setError(''); // Clear previous errors
            const result = await localSignUp(email, password, username);

            if (result.error) {
                setError(result.error.message);
                return;
            }

            if (result.user) {
                // Assuming createInitialProfile is a function that sets up the user profile
                await createInitialProfile(supabase, result.user.id, {username, avatar_url: null});
                router.push('/home');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
            setError(errorMessage);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Join Balatro</Text>

            <View style={styles.form}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <PixelButton
                    title={loading ? 'Creating Account...' : 'Sign Up'}
                    onPress={handleSignUp}
                    disabled={loading}
                />

                <TouchableOpacity
                    onPress={() => router.push('/(auth)/sign-in')}
                    style={styles.link}
                >
                    <Text style={styles.linkText}>Already have an account? Sign in</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.bg,
        padding: Theme.spacing.lg,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        color: Theme.colors.text,
        textAlign: 'center',
        marginBottom: Theme.spacing.lg,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    input: {
        backgroundColor: Theme.colors.bgAlt,
        color: Theme.colors.text,
        borderWidth: 2,
        borderColor: Theme.colors.border,
        padding: Theme.spacing.md,
        marginVertical: Theme.spacing.sm,
        borderRadius: 4,
    },
    link: {
        marginTop: Theme.spacing.lg,
        alignItems: 'center',
    },
    linkText: {
        color: Theme.colors.accent,
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: Theme.spacing.sm,
        textAlign: 'center',
    },
});