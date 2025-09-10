import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";

import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import { Theme } from "../constants/Theme";
import { useGameContext } from '../contexts/GameContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { state, dispatch } = useGameContext();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState({
    gamesPlayed: 0,
    highScore: 0,
    // Add more stats as needed
  });

  // Enhanced stats loading with error handling
  const loadPlayerStats = useCallback(async () => {
    try {
      setRefreshing(true);
      // Here you would load player stats from your storage
      // For now using dummy data
      setPlayerStats({
        gamesPlayed: 10,
        highScore: 1000,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Show error message to user
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Screen focus effect with optimized cleanup and state management
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        if (!isActive) return;
        
        setIsLoading(true);
        try {
          await loadPlayerStats();
          // Only update state if component is still mounted
          if (isActive) {
            setPlayerStats(prevStats => ({
              ...prevStats,
              lastUpdated: new Date().toISOString()
            }));
          }
        } catch (error) {
          console.error('Failed to load player stats:', error);
          if (isActive) {
            Alert.alert('Error', 'Failed to load player stats');
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      loadData();

      // Cleanup function
      return () => {
        isActive = false;
        setIsLoading(false);
        setRefreshing(false);
      };
    }, [loadPlayerStats])
  );

  // Navigation event listeners
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (state.currentGame) {
        e.preventDefault();
        
        Alert.alert(
          'Active Game',
          'You have an active game in progress. What would you like to do?',
          [
            { 
              text: "Continue Game", 
              style: 'cancel', 
              onPress: () => {
                router.push('/game');
              }
            },
            { 
              text: "Stay Here", 
              style: 'default',
              onPress: () => {} 
            },
            {
              text: 'Quit Game',
              style: 'destructive',
              onPress: () => {
                dispatch({ type: 'END_GAME' });
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }
    });

    return unsubscribe;
  }, [navigation, state.currentGame, dispatch, router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlayerStats();
    setRefreshing(false);
  }, [loadPlayerStats]);

  // Handle tab-specific focus events with state persistence
  const tabFocusHandler = useCallback(() => {
    if (!state.currentGame && !isLoading) {
      loadPlayerStats();
    }
  }, [state.currentGame, isLoading, loadPlayerStats]);

  // Enhanced focus effect with state persistence
    useFocusEffect(
    useCallback(() => {
      let timeoutId: number;
      
      const handleFocus = async () => {
        tabFocusHandler();
        
        // Persist navigation state after delay
        timeoutId = setTimeout(() => {
          // Optionally, handle navigation state here if needed
          // For Expo Router, you could use router.setParams if you need to set params
        }, 100);
      };

      handleFocus();

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [tabFocusHandler])
  );

  const updateStats = useCallback(() => {
    dispatch({
      type: 'UPDATE_STATS',
      payload: { gamesPlayed: state.playerStats.gamesPlayed + 1 },
    });
  }, [dispatch, state.playerStats.gamesPlayed]);

  // Enhanced game start handler
  const handleStartNewGame = useCallback(() => {
    if (state.currentGame) {
      Alert.alert(
        'New Game',
        'Starting a new game will end your current game. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'New Game',
            style: 'destructive',
            onPress: () => {
              dispatch({ type: 'END_GAME' });
              updateStats();
              router.push('/game');
            }
          }
        ]
      );
    } else {
      updateStats();
      router.push('/game');
    }
  }, [state.currentGame, dispatch, router, updateStats]);

  const { setOptions } = useNavigation();

  // Configure navigation options, animations and loading states
  useEffect(() => {
    setOptions({
      tabBarBadge: state.currentGame ? '1' : undefined,
      tabBarBadgeStyle: {
        backgroundColor: Theme.colors.accent,
      },
      animation: 'fade',
      gestureEnabled: !state.currentGame,
      gestureDirection: 'horizontal',
      tabBarStyle: {
        ...(navigation as any).getState().routes[0].state?.history?.length > 0 && isLoading 
          ? { display: 'none' }
          : undefined,
      },
      // Prevent tab press if game in progress
      tabBarButton: (props: React.ComponentProps<typeof Pressable>) => (
        <Pressable
          {...props}
          onPress={(event) => {
            if (state.currentGame) {
              Alert.alert('Game in Progress', 'Please finish or end your current game.');
              return;
            }
            if (props.onPress) {
              props.onPress(event);
            }
          }}
        />
      ),
    });
  }, [state.currentGame, setOptions, isLoading, navigation]);

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={Theme.colors.accent}
          colors={[Theme.colors.accent]}
        />
      }
    >
      <View style={styles.container}>
        {/* Logo or Banner */}
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Welcome Message */}
        <PixelText size="xxlarge" style={styles.title}>
          Welcome to Balatro
        </PixelText>

        {/* Player Stats */}
        <View style={styles.statsContainer}>
          <PixelText size="large" style={styles.statsTitle}>
            Your Stats
          </PixelText>
          <View style={styles.statsRow}>
            <PixelText size="regular">
              Games Played: {state.playerStats.gamesPlayed}
            </PixelText>
            <PixelText size="regular">
              High Score: {playerStats.highScore}
            </PixelText>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.buttonGrid}>
          <PixelButton
            title="New Game"
            onPress={handleStartNewGame}
            type="primary"
            style={styles.gridButton}
            disabled={refreshing || isLoading}
          />
          <PixelButton
            title="Tutorial"
            onPress={() => router.push('/tutorial')}
            type="secondary"
            style={styles.gridButton}
            disabled={refreshing || isLoading}
          />
        </View>

        {/* Active Game Info */}
        <View style={styles.activeGameContainer}>
          {isLoading ? (
            <ActivityIndicator color={Theme.colors.accent} />
          ) : state.currentGame ? (
            <PixelText size="medium" style={styles.activeGameText}>
              Game in Progress: {state.currentGame.name}
            </PixelText>
          ) : (
            <PixelText size="medium" style={styles.activeGameText}>
              No active game. Start a new one!
            </PixelText>
          )}
        </View>

        {/* Footer */}
        <PixelText size="small" style={styles.footer}>
          © 2025 Balatro by LocalThunk
        </PixelText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Theme.colors.bg, // Updated from 'background' to 'bg'
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 16, // Add padding for bottom tab bar
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    color: Theme.colors.accent, // Updated from 'primary' to 'accent'
  },
  statsContainer: {
    width: '100%',
    backgroundColor: Theme.colors.cardFace, // Updated from 'card' to 'cardFace'
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  statsTitle: {
    marginBottom: 8,
    color: Theme.colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  gridButton: {
    minWidth: 150,
    elevation: 2, // Android shadow
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeGameContainer: {
    marginTop: 24,
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors.cardFace,
    alignItems: 'center',
  },
  activeGameText: {
    color: Theme.colors.text,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    opacity: 0.7,
    color: Theme.colors.text,
  },
  // Add loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});