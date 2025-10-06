import React, {useEffect, useRef} from 'react';
import {View, FlatList, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {useChat} from '@/hooks/useChat';
import {ChatMessage} from '@/components/ChatMessage';
import {ChatInput} from '@/components/ChatInput';
import {useAuth} from '@/contexts/AuthContext';
import {Theme} from '@/constants/Theme';

export default function ChannelScreen() {
    const {channelId} = useLocalSearchParams<{ channelId: string }>();

    // Validate channelId - handle cases where it might be "undefined" string or actually undefined
    const validChannelId = channelId && channelId !== 'undefined' ? channelId : undefined;

    const {messages, openChannel, send, loadMore, toggleTyping, typingUsers, presence} = useChat(validChannelId);
    const {session} = useAuth();
    const listRef = useRef<FlatList>(null);
    const loadingInitial = !messages.length;

    useEffect(() => {
        if (validChannelId) {
            openChannel(validChannelId);
        }
    }, [validChannelId, openChannel]);

    // Don't render anything if we don't have a valid channel ID
    if (!validChannelId) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: Theme.colors.text, fontFamily: Theme.typography.fontPixel}}>
                    Invalid channel ID
                </Text>
            </View>
        );
    }

    const renderTypingIndicator = () => {
        if (typingUsers.length === 0) return null;

        let typingText: string;
        if (typingUsers.length === 1) {
            typingText = `${typingUsers[0].username} is typing...`;
        } else if (typingUsers.length === 2) {
            typingText = `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
        } else {
            typingText = `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
        }

        return (
            <View style={styles.typingContainer}>
                <Text style={styles.typingText}>{typingText}</Text>
            </View>
        );
    };

    const renderPresenceInfo = () => {
        if (presence.length === 0) return null;

        return (
            <View style={styles.presenceContainer}>
                <Text style={styles.presenceText}>
                    {presence.length} online: {presence.map(u => u.username).join(', ')}
                </Text>
            </View>
        );
    };

    return (
        <View style={{flex: 1}}>
            {renderPresenceInfo()}
            {loadingInitial && <ActivityIndicator style={{marginTop: 24}}/>}
            <FlatList
                ref={listRef}
                data={[...messages].reverse()} // inverted view: newest bottom
                inverted
                keyExtractor={m => m.id}
                onEndReachedThreshold={0.2}
                onEndReached={() => {
                    if (validChannelId) loadMore(validChannelId);
                }}
                renderItem={({item}) => (
                    <ChatMessage message={item} isOwn={item.sender_id === session?.user.id}/>
                )}
            />
            {renderTypingIndicator()}
            <ChatInput
                onSend={(text) => send(validChannelId, text)}
                onTyping={(typing) => toggleTyping(validChannelId, typing)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    typingContainer: {
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: Theme.spacing.xs,
        backgroundColor: Theme.colors.bgAlt,
    },
    typingText: {
        fontSize: 12,
        color: Theme.colors.textFaint,
        fontFamily: Theme.typography.fontPixel,
        fontStyle: 'italic',
    },
    presenceContainer: {
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: Theme.spacing.xs,
        backgroundColor: Theme.colors.bg,
        borderBottomWidth: 1,
        borderColor: Theme.colors.border,
    },
    presenceText: {
        fontSize: 11,
        color: Theme.colors.textFaint,
        fontFamily: Theme.typography.fontPixel,
    },
});
