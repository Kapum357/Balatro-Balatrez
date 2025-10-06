import {Channel, Message, PendingMessageMeta, PresenceUser, RealtimeMessageEvent} from '@/.expo/types/chat';
import {GameAnalytics, trackChatMessageFailed, trackChatMessageSent} from '@/utils/analytics';
import * as ChatService from '@/utils/chatService';

interface MessagesState {
    byChannel: Record<string, Message[]>;
    paginationCursor: Record<string, string | null>; // earliest loaded created_at
    unread: Record<string, number>;
    presence: Record<string, PresenceUser[]>; // channelId -> online users
    typing: Record<
        string,
        { [userId: string]: { username?: string; lastTyping: string } }
    >; // channelId -> typing users
}

export class ChatManager {
    private channels: Channel[] = [];
    private state: MessagesState = {byChannel: {}, paginationCursor: {}, unread: {}, presence: {}, typing: {}};
    private pending: Map<string, PendingMessageMeta> = new Map();
    private subs: Map<string, { unsubscribe: () => void }> = new Map();
    private presenceSubs: Map<string, { unsubscribe: () => void }> = new Map();
    private typingSubs: Map<string, { unsubscribe: () => void }> = new Map();
    private analytics: GameAnalytics;
    private activeChannelId: string | null = null;
    private userId: string | null = null;
    private userProfile: { username: string; avatar_url?: string } | null = null;
    private isConnected: boolean = false;
    private reconnectTimeouts: Map<string, number> = new Map();

    constructor(analytics: GameAnalytics) {
        this.analytics = analytics;
    }

    setUser(userId: string | null) {
        this.userId = userId;
    }

    setUserProfile(profile: { username: string; avatar_url?: string } | null) {
        this.userProfile = profile;
    }

    getChannels() {
        return this.channels;
    }

    getMessages(channelId: string) {
        return this.state.byChannel[channelId] || [];
    }

    getPresence(channelId: string) {
        return this.state.presence[channelId] || [];
    }

    getOnlineCount(channelId: string) {
        return this.getPresence(channelId).length;
    }

    getTypingUsers(channelId: string): PresenceUser[] {
        const typing = this.state.typing[channelId];
        if (!typing) return [];

        const now = Date.now();
        const TYPING_TIMEOUT = 3000; // 3 seconds
        const result: PresenceUser[] = [];

        // Optimize: avoid object destructuring and reduce iterations
        for (const [userId, data] of Object.entries(typing)) {
            if (userId === this.userId) continue; // Don't show self as typing

            const lastTyping = new Date(data.lastTyping).getTime();
            if (now - lastTyping <= TYPING_TIMEOUT) {
                result.push({
                    user_id: userId,
                    username: data.username || 'Unknown',
                    avatar_url: undefined
                });
            }
        }

        return result;
    }

    async loadChannels() {
        this.channels = await ChatService.listUserChannels();
        return this.channels;
    }

    setActiveChannel(channelId: string | null) {
        // Validate channelId - ensure it's not an invalid string
        if (channelId === 'undefined' || channelId === 'null' || (channelId && channelId.trim().length === 0)) {
            channelId = null;
        }

        if (this.activeChannelId && this.activeChannelId !== channelId) {
            // Unsubscribe from previous channel
            const old = this.subs.get(this.activeChannelId);
            if (old) {
                old.unsubscribe();
                this.subs.delete(this.activeChannelId);
                this.analytics.trackChatUnsubscribed(this.activeChannelId);
            }

            const oldPresence = this.presenceSubs.get(this.activeChannelId);
            if (oldPresence) {
                oldPresence.unsubscribe();
                this.presenceSubs.delete(this.activeChannelId);
            }

            const oldTyping = this.typingSubs.get(this.activeChannelId);
            if (oldTyping) {
                oldTyping.unsubscribe();
                this.typingSubs.delete(this.activeChannelId);
            }
        }

        this.activeChannelId = channelId;

        if (channelId && !this.subs.has(channelId)) {
            // Subscribe to messages
            const handle = ChatService.subscribeToChannelMessages(channelId, (evt) => this.onRealtime(evt, channelId));
            this.subs.set(channelId, handle);

            // Subscribe to presence if user profile is available
            if (this.userId && this.userProfile) {
                const presenceHandle = ChatService.subscribeToPresence(
                    channelId,
                    this.userId,
                    this.userProfile,
                    (presenceState) => this.onPresenceSync(channelId, presenceState)
                );
                this.presenceSubs.set(channelId, presenceHandle);
            }

            // Subscribe to typing
            const typingHandle = ChatService.subscribeToTyping(channelId, (evt) => this.onTypingUpdate(evt, channelId));
            this.typingSubs.set(channelId, typingHandle);

            this.analytics.trackChatSubscribed(channelId);
            this.analytics.trackChatSessionStart(channelId, {
                isDirect: !!this.channels.find(c => c.id === channelId)?.is_direct,
                memberCount: 0
            });
        }
    }

    private onRealtime(evt: RealtimeMessageEvent, channelId: string) {
        try {
            if (!this.state.byChannel[channelId]) this.state.byChannel[channelId] = [];

            const messages = this.state.byChannel[channelId];

            if (evt.type === 'INSERT') {
                const msg = evt.record as Message;

                // Optimize: Use findIndex for better performance on large arrays
                const optimisticIndex = msg.client_temp_id ?
                    messages.findIndex(m => m.client_temp_id === msg.client_temp_id) : -1;

                if (optimisticIndex >= 0) {
                    // Replace optimistic message
                    messages[optimisticIndex] = {...msg, state: msg.deleted_at ? 'deleted' : 'sent'};
                } else {
                    // Add new message
                    messages.push({...msg, state: msg.deleted_at ? 'deleted' : 'sent'});
                }

                this.sort(channelId);

                if (channelId !== this.activeChannelId) {
                    this.state.unread[channelId] = (this.state.unread[channelId] || 0) + 1;
                }
            } else if (evt.type === 'UPDATE') {
                const msg = evt.record as Message;
                const index = messages.findIndex(m => m.id === msg.id);
                if (index >= 0) {
                    messages[index] = {...messages[index], ...msg};
                }
            } else if (evt.type === 'DELETE') {
                const msg = evt.record as Message;
                const index = messages.findIndex(m => m.id === msg.id);
                if (index >= 0) {
                    messages[index] = {
                        ...messages[index],
                        deleted_at: msg.deleted_at || new Date().toISOString(),
                        state: 'deleted'
                    };
                }
            }
        } catch (error) {
            if (__DEV__) {
                console.error('Error processing realtime event:', error);
            }
        }
    }

    private onPresenceSync(channelId: string, presenceState: Record<string, any[]>) {
        try {
            const onlineUsers: PresenceUser[] = [];

            // Optimize: reduce nested loops and memory allocation
            for (const presences of Object.values(presenceState)) {
                for (const presence of presences) {
                    if (presence.user_id && presence.username) {
                        onlineUsers.push({
                            user_id: presence.user_id,
                            username: presence.username,
                            avatar_url: presence.avatar_url
                        });
                    }
                }
            }

            this.state.presence[channelId] = onlineUsers;
        } catch (error) {
            if (__DEV__) {
                console.error('Error processing presence sync:', error);
            }
        }
    }

    private onTypingUpdate(evt: { type: string; record: any }, channelId: string) {
        try {
            if (!this.state.typing[channelId]) this.state.typing[channelId] = {};

            const record = evt.record;
            if (!record.user_id) return;

            const typingState = this.state.typing[channelId];

            if (evt.type === 'INSERT' || evt.type === 'UPDATE') {
                if (record.last_typing) {
                    typingState[record.user_id] = {
                        username: record.username,
                        lastTyping: record.last_typing
                    };
                }
            } else if (evt.type === 'DELETE') {
                delete typingState[record.user_id];
            }
        } catch (error) {
            if (__DEV__) {
                console.error('Error processing typing update:', error);
            }
        }
    }

    private sort(channelId: string) {
        this.state.byChannel[channelId].sort((a, b) => a.created_at.localeCompare(b.created_at));
    }

    async loadInitialMessages(channelId: string) {
        // Validate channelId before making API call
        if (!channelId || channelId === 'undefined' || channelId.trim().length === 0) {
            throw new Error(`Invalid channelId provided: ${channelId}`);
        }

        return measureAsync(`loadInitialMessages-${channelId}`, async () => {
            const {messages, reachedStart} = await ChatService.listMessages(channelId, {limit: 30});
            this.state.byChannel[channelId] = messages.map(m => ({...m, state: m.deleted_at ? 'deleted' : 'sent'}));
            this.state.paginationCursor[channelId] = messages.length ? messages[0].created_at : null;

            return {reachedStart};
        });
    }

    async loadMore(channelId: string) {
        const cursor = this.state.paginationCursor[channelId];
        if (!cursor) return {reachedStart: true};
        const {messages, reachedStart} = await ChatService.listMessages(channelId, {beforeTs: cursor, limit: 30});
        const existing = this.getMessages(channelId);
        const mergedIds = new Set(existing.map(m => m.id));
        const prepend = messages
            .filter(m => !mergedIds.has(m.id))
            .map(m => ({
                ...m,
                state: (m.deleted_at ? 'deleted' : 'sent') as Message['state']
            }));
        this.state.byChannel[channelId] = [...prepend, ...existing];
        if (messages.length) {
            this.state.paginationCursor[channelId] = messages[0].created_at;
        } else {
            this.state.paginationCursor[channelId] = null;
        }
        return {reachedStart};
    }

    async sendMessage(channelId: string, body: string) {
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const optimistic: Message = {
            id: tempId,
            channel_id: channelId,
            sender_id: this.userId || 'unknown',
            body,
            client_temp_id: tempId,
            created_at: new Date().toISOString(),
            state: 'sending'
        };
        if (!this.state.byChannel[channelId]) this.state.byChannel[channelId] = [];
        this.state.byChannel[channelId].push(optimistic);
        this.sort(channelId);
        this.pending.set(tempId, {tempId, channelId, body, createdAt: Date.now(), attempts: 1});
        try {
            const saved = await ChatService.sendMessage(channelId, body, tempId);
            // Reconcile will happen via realtime insert; fallback update:
            this.state.byChannel[channelId] = this.getMessages(channelId).map(m => m.client_temp_id === tempId ? {
                ...(saved as Message),
                state: 'sent' as Message['state']
            } : m);
            this.sort(channelId);
            // analytics
            try {
                trackChatMessageSent({
                    channelId,
                    messageId: (saved as any)?.id ?? tempId,
                    hasTempId: true,
                    bytes: body.length
                });
            } catch {}
            return saved;
        } catch (e: any) {
            this.state.byChannel[channelId] = this.getMessages(channelId).map(m => m.client_temp_id === tempId ? {
                ...m,
                state: 'failed' as Message['state']
            } : m);
            try {
                trackChatMessageFailed({
                    channelId,
                    clientTempId: tempId,
                    error: e?.message || String(e)
                });
            } catch {}
            throw e;
        }
    }

    markRead(channelId: string) {
        this.state.unread[channelId] = 0;
    }

    cleanup() {
        // Clean up all subscriptions
        this.subs.forEach(sub => sub.unsubscribe());
        this.subs.clear();

        this.presenceSubs.forEach(sub => sub.unsubscribe());
        this.presenceSubs.clear();

        this.typingSubs.forEach(sub => sub.unsubscribe());
        this.typingSubs.clear();

        // Clear reconnection timeouts
        this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
        this.reconnectTimeouts.clear();

        this.activeChannelId = null;
        this.isConnected = false;
    }

    private scheduleReconnect(channelId: string, delay: number = 1000) {
        if (__DEV__) {
            console.debug(`Scheduling reconnect for channel ${channelId} in ${delay}ms`);
        }

        const timeoutId = setTimeout(() => {
            this.reconnectTimeouts.delete(channelId);
            if (this.activeChannelId === channelId) {
                this.setActiveChannel(channelId);
            }
        }, delay);

        this.reconnectTimeouts.set(channelId, timeoutId);
    }

    setConnectionStatus(connected: boolean) {
        const wasConnected = this.isConnected;
        this.isConnected = connected;

        if (__DEV__) {
            console.debug(`Chat connection status changed: ${connected}`);
        }

        // Reconnect to active channel if connection was restored
        if (!wasConnected && connected && this.activeChannelId) {
            this.scheduleReconnect(this.activeChannelId, 500);
        }
    }
}

function measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
        const start = performance.now();
        return fn().then(result => {
            const duration = performance.now() - start;
            // Keep noise low, but log for chat dev
            if (duration > 50) {
                console.debug(`[measureAsync] ${label}: ${duration.toFixed(1)}ms`);
            }
            return result;
        });
    }
    return fn();
}
