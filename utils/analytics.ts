// utils/analytics.ts
const analytics = {
    logEvent: (eventName: string, params: object) => {
        console.log(`Event logged: ${eventName}`, params);
    }
};

interface GameSessionAnalytics {
    expansionsActive: Set<string>;
    gameMode: string;
    duration: number;
    finalScore: number;
    activeDays?: number;
    onlineMatches?: number;
}

export class GameAnalytics {
    trackGameSession({
        expansionsActive,
        gameMode,
        duration,
        finalScore,
        activeDays = 1,
        onlineMatches = 0
    }: GameSessionAnalytics) {
        // Seguimiento de métricas de juego y retención en un solo evento
        analytics.logEvent('game_session', {
            // Métricas del juego
            expansions: Array.from(expansionsActive),
            mode: gameMode,
            timeSpent: duration,
            score: finalScore,
            // Métricas de retención
            daysActive: activeDays,
            expansionsOwned: Array.from(expansionsActive).length,
            multiplayerGames: onlineMatches,
            timestamp: new Date().toISOString()
        });
    }

    // --- Chat analytics (console-based; keep signatures stable) ---
    trackChatSessionStart(channelId: string, context: { isDirect: boolean; memberCount: number }) {
        analytics.logEvent('chat_session_start', {
            channelId,
            isDirect: context.isDirect,
            members: context.memberCount,
            ts: Date.now()
        });
    }

    trackChatSubscribed(channelId: string) {
        analytics.logEvent('chat_subscribed', { channelId, ts: Date.now() });
    }

    trackChatUnsubscribed(channelId: string) {
        analytics.logEvent('chat_unsubscribed', { channelId, ts: Date.now() });
    }

    // --- Bets analytics ---
    trackBetCreated(meta: { betId: string; stake: number; optionCount: number }) {
        analytics.logEvent('bet_created', { ...meta, ts: Date.now() });
    }

    trackBetJoined(meta: { betId: string; optionId: string; stake: number }) {
        analytics.logEvent('bet_joined', { ...meta, ts: Date.now() });
    }

    trackBetSettled(meta: { betId: string; winningOptionId: string; winners: number; pot: number }) {
        analytics.logEvent('bet_settled', { ...meta, ts: Date.now() });
    }

    trackBetCanceled(meta: { betId: string; participants: number }) {
        analytics.logEvent('bet_canceled', { ...meta, ts: Date.now() });
    }
}

// Top-level helpers to avoid per-file "unused method" warnings while keeping analytics centralized
export function trackChatMessageSent(
    meta: { channelId: string; messageId: string; hasTempId: boolean; bytes: number }
) {
    analytics.logEvent('chat_message_sent', {
        ...meta,
        ts: Date.now()
    });
}

export function trackChatMessageFailed(meta: { channelId: string; clientTempId: string; error: string }) {
    analytics.logEvent('chat_message_failed', { ...meta, ts: Date.now() });
}
