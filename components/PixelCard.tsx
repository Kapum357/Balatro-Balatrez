import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../constants/Theme';

interface PixelCardProps {
  suit: 'H' | 'D' | 'S' | 'C' | 'JOKER';
  value: string; // 'A','2'...'K','JOKER'
  selected?: boolean;
  muted?: boolean;
  small?: boolean;
}

const suitSymbol: Record<string,string> = {
  H: '♥', D: '♦', S: '♠', C: '♣', JOKER: '★'
};

export const PixelCard: React.FC<PixelCardProps> = ({
  suit, value, selected = false, muted = false, small = false
}) => {
  const isRed = suit === 'H' || suit === 'D';
  const isJoker = suit === 'JOKER';

  return (
    <View style={[
      styles.wrapper,
      small && styles.wrapperSmall,
      selected && styles.selected,
      muted && styles.muted,
      isJoker && styles.joker
    ]}>
      <View style={styles.inner}>
        <View style={styles.cornerTL}>
          <Text style={[
            styles.value,
            isRed && styles.red,
            isJoker && styles.jokerText
          ]}>{value}</Text>
          <Text style={[
            styles.suit,
            isRed && styles.red,
            isJoker && styles.jokerText
          ]}>{suitSymbol[suit]}</Text>
        </View>
        <View style={styles.center}>
          <Text style={[
            styles.big,
            isRed && styles.red,
            isJoker && styles.jokerText
          ]}>{suitSymbol[suit]}</Text>
        </View>
        <View style={styles.cornerBR}>
          <Text style={[
            styles.value,
            isRed && styles.red,
            isJoker && styles.jokerText
          ]}>{value}</Text>
          <Text style={[
            styles.suit,
            isRed && styles.red,
            isJoker && styles.jokerText
          ]}>{suitSymbol[suit]}</Text>
        </View>
      </View>
    </View>
  );
};

const W = 72;
const H = 104;

const styles = StyleSheet.create({
  wrapper: {
    width: W,
    height: H,
    backgroundColor: Theme.colors.cardFace,
    borderWidth: 2,
    borderColor: Theme.colors.cardEdge,
    margin: 4,
    position: 'relative',
  },
  wrapperSmall: {
    width: W * 0.7,
    height: H * 0.7,
  },
  inner: {
    flex: 1,
    padding: 4,
    justifyContent: 'space-between'
  },
  cornerTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    alignItems: 'center'
  },
  cornerBR: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }]
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  value: {
    fontFamily: Theme.typography.fontPixel,
    fontSize: 12,
    color: Theme.colors.text
  },
  suit: {
    fontSize: 10,
    color: Theme.colors.text
  },
  big: {
    fontSize: 28,
    fontFamily: Theme.typography.fontPixel,
    color: Theme.colors.text
  },
  red: {
    color: Theme.colors.danger
  },
  joker: {
    backgroundColor: '#262e24',
    borderColor: Theme.colors.success
  },
  jokerText: {
    color: Theme.colors.success
  },
  selected: {
    borderColor: Theme.colors.accent,
    top: -4
  },
  muted: {
    opacity: 0.4
  }
});