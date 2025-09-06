import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { PixelButton } from './PixelButton';
import { PixelCard } from './PixelCard';
import { PixelLayout } from './PixelLayout';

export default function RetroInterface() {
  return (
    <PixelLayout style={styles.layout}>
      <Text style={styles.title}>Balatro Retro</Text>
      <PixelCard suit="H" value="A" selected />
      <PixelCard suit="JOKER" value="JOKER" />
      <PixelButton title="Iniciar Juego" onPress={() => console.log('Iniciar Juego')} />
      <PixelButton title="Opciones" onPress={() => console.log('Opciones')} type="secondary" />
    </PixelLayout>
  );
}

const styles = StyleSheet.create({
  layout: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});