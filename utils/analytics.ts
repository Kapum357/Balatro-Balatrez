// utils/analytics.ts
const analytics = {
    logEvent: (eventName: string, params: object) => {
        console.log(`Event logged: ${eventName}`, params);
    }
};

export class GameAnalytics {
    trackGameSession({
        expansionsActive,
        gameMode,
        duration,
        finalScore
    }: GameSessionData) {
        // Seguimiento de métricas
        analytics.logEvent('game_completed', {
            expansions: Array.from(expansionsActive),
            mode: gameMode,
            timeSpent: duration,
            score: finalScore
        });
    }
    
    trackRetention(playerData: PlayerData) {
        // Análisis de retención
        analytics.logEvent('player_retention', {
            daysActive: playerData.activeDays,
            expansionsOwned: playerData.expansions.length,
            multiplayerGames: playerData.onlineMatches
        });
    }
}

interface GameSessionData {
  expansionsActive: Set<string>;
  gameMode: string;
  duration: number;
  finalScore: number;
}

interface PlayerData {
  activeDays: number;
  expansions: string[];
  onlineMatches: number;
}