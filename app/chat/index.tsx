import React, {useEffect} from 'react';
import {View, FlatList, RefreshControl, Text} from 'react-native';
import {useChat} from '@/hooks/useChat';
import {ChannelListItem} from '@/components/ChannelListItem';
import {useRouter} from 'expo-router';
import {useAuth} from '@/contexts/AuthContext';
import {Theme} from '@/constants/Theme';

export default function ChatListScreen() {
    const {channels, loadChannels, getOnlineCount} = useChat();
    const {session} = useAuth();
    const [refreshing, setRefreshing] = React.useState(false);
    const router = useRouter();

    useEffect(() => {
        if (session) {
            loadChannels().then(channels => {
                console.log('Loaded channels:', channels.length, channels.map(c => ({id: c.id, name: c.name})));
            }).catch(error => {
                console.error('Error loading channels:', error);
            });
        }
    }, [loadChannels, session]);

    // Debug current channels (only in development)
    if (__DEV__) {
        console.log('Current channels state:', channels.length, channels.map(c => ({id: c.id, name: c.name})));
    }

    // Don't load channels if user is not authenticated
    if (!session) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: Theme.colors.text, fontFamily: Theme.typography.fontPixel}}>
                    Please sign in to access chat
                </Text>
            </View>
        );
    }

    return (
        <View style={{flex: 1}}>
            <FlatList
                data={channels}
                keyExtractor={c => c.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => {
                    setRefreshing(true);
                    await loadChannels();
                    setRefreshing(false);
                }}/>}
                renderItem={({item}) => (
                    <ChannelListItem
                        channel={item}
                        lastMessage={item.last_message_preview || null}
                        unread={0}
                        onlineCount={getOnlineCount(item.id)}
                        onPress={() => {
                            if (item.id && item.id !== 'undefined') {
                                router.push(`/chat/${item.id}` as any);
                            } else {
                                console.warn('Attempted to navigate to channel with invalid ID:', item.id);
                            }
                        }}
                    />
                )}
            />
        </View>
    );
}
