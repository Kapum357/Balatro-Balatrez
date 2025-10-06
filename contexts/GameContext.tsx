// contexts/GameContext.tsx
import {createContext, Dispatch, ReactNode, useContext, useReducer} from 'react';

const GameContext = createContext<{
    state: GameState;
    dispatch: Dispatch<GameAction>;
} | null>(null);

interface GameProviderProps {
    children: ReactNode;
}

export function GameProvider({children}: GameProviderProps) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    return (
        <GameContext.Provider value={{state, dispatch}}>
            {children}
        </GameContext.Provider>
    );
}

// Custom hook for easier access
export function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
}

interface PlayerStats {
    gamesPlayed: number;
    highScore: number;
}

interface GameState {
    playerStats: PlayerStats;
    currentGame: { name: string } | null;
    settings: {
        sound: boolean;
        notifications: boolean;
    };
}

type GameAction =
    | { type: 'UPDATE_STATS'; payload: Partial<PlayerStats> }
    | { type: 'START_GAME'; payload: { name: string } }
    | { type: 'END_GAME' }
    | { type: 'TOGGLE_SETTING'; payload: { setting: keyof GameState['settings'] } };

const initialState: GameState = {
    playerStats: {
        gamesPlayed: 0,
        highScore: 0,
    },
    currentGame: null, // Stores the current game session
    settings: {
        sound: true,
        notifications: true,
    },
};

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'UPDATE_STATS':
            return {
                ...state,
                playerStats: {
                    ...state.playerStats,
                    ...action.payload,
                },
            };
        case 'START_GAME':
            return {
                ...state,
                currentGame: action.payload,
            };
        case 'END_GAME':
            return {
                ...state,
                currentGame: null,
            };
        case 'TOGGLE_SETTING':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    [action.payload.setting]: !state.settings[action.payload.setting],
                },
            };
        default:
            return state;
    }
}