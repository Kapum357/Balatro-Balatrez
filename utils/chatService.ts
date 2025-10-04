import { supabase } from './supabaseClient';
import {
  Channel,
  ChannelMember,
  Message,
  PaginatedMessagesResult,
  ListMessagesParams,
  RealtimeMessageEvent,
  ChatSubscriptionHandle
} from '@/.expo/types/chat';

// Helper to assert auth session
async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Not authenticated');
  return data.user;
}

export async function createDirectChannel(otherUserId: string): Promise<Channel> {
  const user = await requireUser();
  if (otherUserId === user.id) throw new Error('Cannot DM self');

  // Try to find existing direct channel with both members
  const { data: existing, error: existingErr } = await supabase.rpc('find_or_create_direct_channel', {
    p_user_a: user.id,
    p_user_b: otherUserId
  });
  if (existingErr) throw existingErr;
  return existing as Channel; // Expect Postgres function to return row
}

export async function createGroupChannel(name: string, memberIds: string[]): Promise<Channel> {
  const user = await requireUser();
  const allMembers = Array.from(new Set([user.id, ...memberIds]));
  const { data: channel, error } = await supabase
    .from('channels')
    .insert({ name, is_direct: false, created_by: user.id })
    .select()
    .single();
  if (error) throw error;
  const rows = allMembers.map(uid => ({ channel_id: channel.id, user_id: uid }));
  const { error: memErr } = await supabase.from('channel_members').insert(rows);
  if (memErr) throw memErr;
  return channel as Channel;
}

export async function listUserChannels(): Promise<Channel[]> {
  await requireUser();
  const { data: memberRows, error: memberErr } = await supabase
    .from('channel_members')
    .select('channel_id');
  if (memberErr) throw memberErr;
  const ids = [...new Set((memberRows || []).map(r => r.channel_id))];
  if (!ids.length) return [];
  const { data: channels, error: chanErr } = await supabase
    .from('channels')
    .select('*')
    .in('id', ids);
  if (chanErr) throw chanErr;
  return (channels || []) as Channel[];
}

export async function getChannelMembers(channelId: string): Promise<ChannelMember[]> {
  const { data, error } = await supabase
    .from('channel_members')
    .select('*')
    .eq('channel_id', channelId);
  if (error) throw error;
  return (data || []) as ChannelMember[];
}

export async function sendMessage(channelId: string, body: string, clientTempId: string): Promise<Message> {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('messages')
    .insert({ channel_id: channelId, sender_id: user.id, body, client_temp_id: clientTempId })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

export async function listMessages(channelId: string, params: ListMessagesParams = {}): Promise<PaginatedMessagesResult> {
  // Validate channelId before making the request
  if (!channelId || channelId === 'undefined' || channelId.trim().length === 0) {
    throw new Error(`Invalid channelId provided to listMessages: ${channelId}`);
  }
  
  const limit = params.limit ?? 30;
  let query = supabase
    .from('messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (params.beforeTs) {
    query = query.lt('created_at', params.beforeTs);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error loading messages for channel:', channelId, error);
    throw error;
  }
  const messages = (data || []) as Message[];
  return { messages: messages.reverse(), reachedStart: messages.length < limit };
}

export function subscribeToChannelMessages(channelId: string, handler: (evt: RealtimeMessageEvent) => void): ChatSubscriptionHandle {
  const channel = supabase.channel(`db:messages:${channelId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, (payload) => {
      try {
        handler({ type: 'INSERT', record: payload.new });
      } catch (error) {
        if (__DEV__) console.error('Error handling message INSERT:', error);
      }
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, (payload) => {
      try {
        handler({ type: 'UPDATE', record: payload.new });
      } catch (error) {
        if (__DEV__) console.error('Error handling message UPDATE:', error);
      }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, (payload) => {
      try {
        handler({ type: 'DELETE', record: payload.old });
      } catch (error) {
        if (__DEV__) console.error('Error handling message DELETE:', error);
      }
    })
    .subscribe((status) => {
      if (__DEV__) {
        console.debug(`Messages subscription status for ${channelId}:`, status);
      }
    });

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
}

export async function markRead(_channelId: string, _messageId: string): Promise<void> {
  // Placeholder: would update channel_members.last_read_message_id via RPC / update.
  return;
}

export async function setTyping(channelId: string, isTyping: boolean): Promise<void> {
  const user = await requireUser();
  if (isTyping) {
    const { error } = await supabase
      .from('typing')
      .upsert({ 
        channel_id: channelId, 
        user_id: user.id, 
        last_typing: new Date().toISOString() 
      }, { 
        onConflict: 'channel_id,user_id' 
      });
    if (error) throw error;
  } else {
    // Clean up typing state when explicitly set to false
    const { error } = await supabase
      .from('typing')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', user.id);
    if (error) throw error;
  }
}

export function subscribeToPresence(channelId: string, userId: string, userProfile: { username: string; avatar_url?: string }, handler: (presenceState: Record<string, any[]>) => void): ChatSubscriptionHandle {
  const channel = supabase.channel(`presence:channel:${channelId}`, {
    config: { presence: { key: userId } }
  });

  channel.on('presence', { event: 'sync' }, () => {
    try {
      const state = channel.presenceState();
      handler(state);
    } catch (error) {
      if (__DEV__) console.error('Error handling presence sync:', error);
    }
  });

  channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
    if (__DEV__) {
      console.debug(`User ${key} joined channel ${channelId}`, newPresences);
    }
  });

  channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    if (__DEV__) {
      console.debug(`User ${key} left channel ${channelId}`, leftPresences);
    }
  });

  channel.subscribe(async (status) => {
    if (__DEV__) {
      console.debug(`Presence subscription status for ${channelId}:`, status);
    }
    
    if (status === 'SUBSCRIBED') {
      try {
        await channel.track({
          user_id: userId,
          username: userProfile.username,
          avatar_url: userProfile.avatar_url
        });
      } catch (error) {
        if (__DEV__) console.error('Error tracking presence:', error);
      }
    }
  });

  return {
    unsubscribe: () => {
      try {
        channel.untrack();
      } catch (error) {
        if (__DEV__) console.error('Error untracking presence:', error);
      }
      supabase.removeChannel(channel);
    }
  };
}

export function subscribeToTyping(channelId: string, handler: (evt: { type: string; record: any }) => void): ChatSubscriptionHandle {
  const channel = supabase.channel(`typing:${channelId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'typing', 
      filter: `channel_id=eq.${channelId}` 
    }, (payload) => {
      try {
        handler({ type: 'INSERT', record: payload.new });
      } catch (error) {
        if (__DEV__) console.error('Error handling typing INSERT:', error);
      }
    })
    .on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'typing', 
      filter: `channel_id=eq.${channelId}` 
    }, (payload) => {
      try {
        handler({ type: 'UPDATE', record: payload.new });
      } catch (error) {
        if (__DEV__) console.error('Error handling typing UPDATE:', error);
      }
    })
    .on('postgres_changes', { 
      event: 'DELETE', 
      schema: 'public', 
      table: 'typing', 
      filter: `channel_id=eq.${channelId}` 
    }, (payload) => {
      try {
        handler({ type: 'DELETE', record: payload.old });
      } catch (error) {
        if (__DEV__) console.error('Error handling typing DELETE:', error);
      }
    })
    .subscribe((status) => {
      if (__DEV__) {
        console.debug(`Typing subscription status for ${channelId}:`, status);
      }
    });

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
}

// Aggregate service export (optional convenience)
export const chatService = {
  createDirectChannel,
  createGroupChannel,
  listUserChannels,
  getChannelMembers,
  sendMessage,
  listMessages,
  subscribeToChannelMessages,
  subscribeToPresence,
  subscribeToTyping,
  markRead,
  setTyping
};
