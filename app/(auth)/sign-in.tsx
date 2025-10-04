import { PixelButton } from '@/components/PixelButton';
import { Theme } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; // Add Animated

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { signIn, loading } = useAuth();
  const router = useRouter();

  // Card shuffle animation
  const shuffleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(shuffleAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [shuffleAnim]);

  const cards = ['♠️', '♥️', '♣️', '♦️'];

  async function handleSignIn() {
    // Input validation
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setErrorMessage(''); // Clear previous errors
      await signIn(email, password);
      router.push('/profile'); // Redirect to profile on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      setErrorMessage(errorMessage);
    }
  }

  return (
    <View style={styles.container}>
      {/* Card shuffle animation */}
      <View style={styles.cardShuffleContainer}>
        {cards.map((card, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.card,
              {
                transform: [
                  {
                    translateY: shuffleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50 * (index + 1)],
                    }),
                  },
                ],
                opacity: shuffleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            {card}
          </Animated.Text>
        ))}
      </View>

      <Text style={styles.title}>Welcome Back to Balatro!</Text>

      <View style={styles.form}>
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

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        {loading ? (
          <Animated.View
            style={[
              styles.loadingSpinner,
              {
                transform: [
                  {
                    rotate: shuffleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.spinnerText}>🎲</Text>
          </Animated.View>
        ) : (
          <PixelButton
            title="Sign In"
            onPress={handleSignIn}
            disabled={loading}
          />
        )}

        <TouchableOpacity
          onPress={() => router.push('/sign-up')}
          style={styles.link}
        >
          <Text style={styles.linkText}>Need an account? Sign up</Text>
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
  cardShuffleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
    minHeight: 40,
  },
  card: {
    fontSize: 32,
    marginHorizontal: 8,
    textShadowColor: Theme.colors.border,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  error: {
    color: 'red',
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  loadingSpinner: {
    alignSelf: 'center',
    marginVertical: Theme.spacing.lg,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerText: {
    fontSize: 32,
  },
});