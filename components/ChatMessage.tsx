import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Message} from '@/.expo/types/chat';
import {Theme} from '@/constants/Theme';

interface ChatMessageProps {
    message: Message;
    isOwn: boolean;
}

export function ChatMessage({message, isOwn}: ChatMessageProps) {
    const stateLabel = message.state === 'failed' ? ' (!) ' : message.state === 'sending' ? ' … ' : '';
    const deleted = !!message.deleted_at;
    return (
        <View style={[styles.row, isOwn && styles.rowOwn]}>
            <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther, deleted && styles.deleted]}>
                <Text style={styles.text}>
                    {deleted ? 'Message deleted' : message.body}{stateLabel}
                </Text>
                <Text style={styles.meta}>{new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {flexDirection: 'row', paddingHorizontal: Theme.spacing.sm, marginVertical: 2},
    rowOwn: {justifyContent: 'flex-end'},
    bubble: {
        maxWidth: '80%',
        borderWidth: 2,
        borderColor: Theme.colors.border,
        padding: Theme.spacing.xs,
        backgroundColor: Theme.colors.bgAlt
    },
    bubbleOwn: {backgroundColor: Theme.colors.accent},
    bubbleOther: {backgroundColor: Theme.colors.bgAlt},
    text: {color: Theme.colors.text, fontFamily: Theme.typography.fontPixel, fontSize: 12},
    meta: {marginTop: 2, fontSize: 9, color: Theme.colors.textFaint},
    deleted: {opacity: 0.5}
});
