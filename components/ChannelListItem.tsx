import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Channel } from '@/.expo/types/chat';
import { Theme } from '@/constants/Theme';

interface ChannelListItemProps {
  channel: Channel;
  lastMessage?: string | null;
  unread?: number;
  onlineCount?: number;
  onPress: () => void;
  active?: boolean;
}

export function ChannelListItem({ channel, lastMessage, unread = 0, onlineCount = 0, onPress, active }: ChannelListItemProps) {
  return (
    <Pressable onPress={onPress} style={[styles.row, active && styles.active]}> 
      <View style={styles.meta}> 
        <View style={styles.nameRow}>
          <Text style={styles.name}>{channel.name || (channel.is_direct ? 'Direct Message' : 'Channel')}</Text>
          {onlineCount > 0 && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{onlineCount}</Text>
            </View>
          )}
        </View>
        {lastMessage && <Text numberOfLines={1} style={styles.preview}>{lastMessage}</Text>}
      </View>
      {unread > 0 && (
        <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.sm, borderBottomWidth: 1, borderColor: Theme.colors.border },
  active: { backgroundColor: Theme.colors.bgAlt },
  meta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontFamily: Theme.typography.fontPixel, color: Theme.colors.text, fontSize: 14 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF00', marginRight: 4 },
  onlineText: { fontSize: 10, color: Theme.colors.textFaint, fontFamily: Theme.typography.fontPixel },
  preview: { marginTop: 2, fontSize: 11, color: Theme.colors.textFaint },
  badge: { minWidth: 22, paddingHorizontal: 6, height: 22, borderRadius: 11, backgroundColor: Theme.colors.accent, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: Theme.colors.text, fontFamily: Theme.typography.fontPixel, fontSize: 11 }
});
