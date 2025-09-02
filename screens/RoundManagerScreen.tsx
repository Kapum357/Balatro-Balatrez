// screens/RoundManagerScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { RoundManager } from '../managers/roundManager';

export default function RoundManagerScreen() {
  const [roundManager] = useState(new RoundManager());
  const [currentRound, setCurrentRound] = useState<string | null>(null);

  const startRound = (type: 'small-blind' | 'big-blind' | 'special') => {
    roundManager.startRound(type, 100);
    setCurrentRound(type);
  };

  const endRound = () => {
    roundManager.endRound();
    setCurrentRound(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Round Manager</Text>
      <Text>Current Round: {currentRound || 'None'}</Text>
      <Button title="Start Small Blind" onPress={() => startRound('small-blind')} />
      <Button title="Start Big Blind" onPress={() => startRound('big-blind')} />
      <Button title="Start Special Round" onPress={() => startRound('special')} />
      <Button title="End Round" onPress={endRound} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});