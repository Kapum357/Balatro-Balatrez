import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return session
        ? <Redirect href="/home" />
        : <Redirect href="/(auth)/sign-in" />;
}