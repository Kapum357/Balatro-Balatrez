// screens/TutorialScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { HandGuide } from '../components/HandGuide';
import { PixelButton } from '../components/PixelButton';
import { PixelTheme } from '../constants/Theme'; // Import PixelTheme

export default function TutorialScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView>
        <HandGuide />
      </ScrollView>
      <PixelButton
        title="¡Empezar a Jugar!"
        onPress={() => navigation.navigate('Game')}
        type="primary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PixelTheme.colors.background,
  },
});