import { useState, useCallback } from 'react';
import { Card } from '@/.expo/types/card';
import { DeckManager } from '@/managers/deckManager';
import { RoundManager } from '@/managers/roundManager';
import { GameAnalytics } from '@/utils/analytics';
import { GAME_CONSTANTS, INITIAL_DECK } from '@/constants/GameConstants';

export function useGameFlow() {
    const [deckManager] = useState(() => new DeckManager(INITIAL_DECK));
    const [roundManager] = useState(() => new RoundManager());
    const [gameAnalytics] = useState(() => new GameAnalytics());
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [discards, setDiscards] = useState(0); // Track discards per round

    const startNewGame = useCallback(() => {
        setGameStartTime(Date.now());
        roundManager.startRound(GAME_CONSTANTS.DEFAULT_GAME_MODE, GAME_CONSTANTS.ROUND_STARTING_SCORE);
        const initialHand = deckManager.drawCards(GAME_CONSTANTS.STARTING_HAND_SIZE);
        setPlayerHand(initialHand);
        setScore(0);
        setTotalScore(0);
        setDiscards(0); // Reset discards
    }, [deckManager, roundManager]);

    const discardCards = useCallback((cardsToDiscard: Card[]) => {
        deckManager.discardCards(cardsToDiscard);
        const newCards = deckManager.drawCards(cardsToDiscard.length);
        setPlayerHand(prevHand => [
            ...prevHand.filter(card => !cardsToDiscard.includes(card)),
            ...newCards
        ]);
        setDiscards(prev => prev + cardsToDiscard.length); // Increment discards
    }, [deckManager]);

    const calculateCurrentScore = useCallback(() => {
        const roundScore = roundManager.calculateScore(playerHand, { discards }); // Use tracked discards
        setScore(roundScore);
        return roundScore;
    }, [playerHand, roundManager, discards]);

    const endCurrentRound = useCallback(() => {
        const duration = Date.now() - gameStartTime;
        roundManager.endRound();
        const finalScore = roundManager.getTotalScore();
        setTotalScore(finalScore);

        gameAnalytics.trackGameSession({
            expansionsActive: new Set(['base']),
            gameMode: 'normal',
            duration: Math.floor(duration / 1000),
            finalScore
        });

        deckManager.resetDeck();
        setDiscards(0); // Reset discards for next round
    }, [deckManager, roundManager, gameAnalytics, gameStartTime]);

    const resetGame = useCallback(() => {
        deckManager.resetDeck();
        setPlayerHand([]);
        setScore(0);
        setTotalScore(0);
        setDiscards(0); // Reset discards
    }, [deckManager]);

    return {
        playerHand,
        score,
        totalScore,
        startNewGame,
        discardCards,
        calculateCurrentScore,
        endCurrentRound,
        resetGame
    };
}
