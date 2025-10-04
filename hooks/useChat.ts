import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { ChatManager } from '@/managers/chatManager';
import { GameAnalytics } from '@/utils/analytics';
import { Message, PresenceUser } from '@/.expo/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/utils/supabaseClient';
import * as chatService from '@/utils/chatService';

const managerSingleton = new ChatManager(new GameAnalytics());

export function useChat(activeChannelId?: string) {
  const { session } = useAuth();
  const { profile } = useProfile();
  const [, force] = useState(0);
  const forceRender = useCallback(() => force(c => c + 1), [force]);
  const bootRef = useRef(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const typingDebounceRef = useRef<number | null>(null);

  // Sync auth user id and profile to manager
  useEffect(() => { 
    managerSingleton.setUser(session?.user.id || null); 
  }, [session?.user.id]);

  useEffect(() => {
    if (profile) {
      managerSingleton.setUserProfile({
        username: profile.username || 'Unknown',
        avatar_url: profile.avatar_url || undefined
      });
    } else {
      managerSingleton.setUserProfile(null);
    }
  }, [profile]);

  // Subscribe active channel
  useEffect(() => {
    // Validate channelId - don't process "undefined" strings or invalid UUIDs
    const validChannelId = activeChannelId && activeChannelId !== 'undefined' && activeChannelId.length > 0 ? activeChannelId : null;
    managerSingleton.setActiveChannel(validChannelId);
    forceRender();
  }, [activeChannelId, forceRender]);

  const loadChannels = useCallback(async () => {
    const list = await managerSingleton.loadChannels();
    forceRender();
    return list;
  }, [forceRender]);

  const openChannel = useCallback(async (channelId: string) => {
    // Validate channelId before processing
    if (!channelId || channelId === 'undefined' || channelId.trim().length === 0) {
      console.warn('openChannel called with invalid channelId:', channelId);
      return;
    }
    
    managerSingleton.setActiveChannel(channelId);
    if (!managerSingleton.getMessages(channelId).length) {
      await managerSingleton.loadInitialMessages(channelId);
    }
    managerSingleton.markRead(channelId);
    forceRender();
  }, [forceRender]);

  const send = useCallback(async (channelId: string, body: string) => {
    const res = await managerSingleton.sendMessage(channelId, body);
    forceRender();
    return res;
  }, [forceRender]);

  const loadMore = useCallback(async (channelId: string) => {
    const res = await managerSingleton.loadMore(channelId);
    forceRender();
    return res;
  }, [forceRender]);

  const markRead = useCallback((channelId: string) => {
    managerSingleton.markRead(channelId);
    forceRender();
  }, [forceRender]);

  const toggleTyping = useCallback((channelId: string, isTyping: boolean) => {
    if (isTyping) {
      // Debounce typing updates to at most once per second
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      
      typingDebounceRef.current = setTimeout(() => {
        chatService.setTyping(channelId, true).catch(console.error);
      }, 100);
      
      // Clear typing state after 3 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        chatService.setTyping(channelId, false).catch(console.error);
      }, 3000);
    } else {
      // Immediately stop typing
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      chatService.setTyping(channelId, false).catch(console.error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!bootRef.current && session) {
      bootRef.current = true;
      loadChannels();
    }
  }, [session, loadChannels]);

  // Cleanup on auth state change or unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      // Don't cleanup manager here as it's a singleton
    };
  }, []);

  // Cleanup when user signs out
  useEffect(() => {
    if (!session) {
      managerSingleton.cleanup();
      bootRef.current = false;
    }
  }, [session]);

  // Monitor connection status and app state
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App became active, assume connection is good
        managerSingleton.setConnectionStatus(true);
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background, connection might be lost
        managerSingleton.setConnectionStatus(false);
      }
    };

    // Monitor Supabase realtime connection
    const channel = supabase.channel('connection-monitor');
    channel.subscribe((status) => {
      const connected = status === 'SUBSCRIBED';
      managerSingleton.setConnectionStatus(connected);
    });

    // Monitor app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      supabase.removeChannel(channel);
    };
  }, []);

  const getOnlineCount = useCallback((channelId: string) => {
    return managerSingleton.getOnlineCount(channelId);
  }, []);

  return {
    channels: managerSingleton.getChannels(),
    messages: activeChannelId ? managerSingleton.getMessages(activeChannelId) : [] as Message[],
    presence: activeChannelId ? managerSingleton.getPresence(activeChannelId) : [] as PresenceUser[],
    typingUsers: activeChannelId ? managerSingleton.getTypingUsers(activeChannelId) : [] as PresenceUser[],
    getOnlineCount,
    loadChannels,
    openChannel,
    send,
    loadMore,
    markRead,
    toggleTyping
  };
}
