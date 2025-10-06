import {useState, useCallback} from 'react';
import {Card} from '@/.expo/types/card';
import {DeckManager} from '@/managers/deckManager';
import {RoundManager} from '@/managers/roundManager';
import {GameAnalytics} from '@/utils/analytics';
import {GAME_CONSTANTS, INITIAL_DECK, BlindType} from '@/constants/GameConstants';
import {getBlindTarget, nextBlind, firstBlind, isOverflowTarget} from '@/utils/progression';

export function useGameFlow() {
    const [deckManager] = useState(() => new DeckManager(INITIAL_DECK));
    const [roundManager] = useState(() => new RoundManager());
    const [gameAnalytics] = useState(() => new GameAnalytics());

    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [discards, setDiscards] = useState(0);

    const [ante, setAnte] = useState(1);
    const [blind, setBlind] = useState<BlindType>(firstBlind());
    const [target, setTarget] = useState<number>(getBlindTarget(1, firstBlind()));
    const [handsRemaining, setHandsRemaining] = useState<number>(GAME_CONSTANTS.HANDS_PER_BLIND);
    const [cash, setCash] = useState<number>(GAME_CONSTANTS.STARTING_CASH);
    const [inShop, setInShop] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isOverflow, setIsOverflow] = useState(false);

    const startNewGame = useCallback(() => {
        roundManager.ante = 1;
        roundManager.blindIndex = 0;
        roundManager.endless = false;
        roundManager.overflowed = false;
        roundManager.win = false;
        roundManager.lose = false;

        setGameStartTime(Date.now());
        setAnte(1);
        const b = firstBlind();
        setBlind(b);
        const t = getBlindTarget(1, b);
        setTarget(t);
        setIsOverflow(isOverflowTarget(t));
        roundManager.startRound('normal' as any, t);
        const initialHand = deckManager.drawCards(GAME_CONSTANTS.STARTING_HAND_SIZE);
        setPlayerHand(initialHand);
        setScore(0);
        setTotalScore(0);
        setDiscards(0);
        setHandsRemaining(GAME_CONSTANTS.HANDS_PER_BLIND);
        setCash(GAME_CONSTANTS.STARTING_CASH);
        setInShop(false);
        setIsWin(false);
        setIsGameOver(false);
    }, [deckManager, roundManager]);

    const discardCards = useCallback((cardsToDiscard: Card[]) => {
        deckManager.discardCards(cardsToDiscard);
        const newCards = deckManager.drawCards(cardsToDiscard.length);
        setPlayerHand(prevHand => [
            ...prevHand.filter(card => !cardsToDiscard.includes(card)),
            ...newCards
        ]);
        setDiscards(prev => prev + cardsToDiscard.length);
    }, [deckManager]);

    const calculateCurrentScore = useCallback(() => {
        const roundScore = roundManager.calculateScore(playerHand, {discards});
        setScore(roundScore);
        return roundScore;
    }, [playerHand, roundManager, discards]);

    const endCurrentRound = useCallback(() => {
        const duration = Date.now() - gameStartTime;
        setHandsRemaining(prev => prev - 1);
        const lastTotal = roundManager.getLastBreakdown()?.total ?? 0;
        const success = lastTotal >= target;

        if (success) {
            const bonus = Math.floor(target * 0.1);
            setCash(c => c + bonus);
            setInShop(true);
        } else if (handsRemaining - 1 <= 0) {
            setIsGameOver(true);
        }

        roundManager.endRound();
        setTotalScore(roundManager.getTotalScore());

        gameAnalytics.trackGameSession({
            expansionsActive: new Set(['base']),
            gameMode: 'normal',
            duration: Math.floor(duration / 1000),
            finalScore: roundManager.getTotalScore()
        });

        deckManager.resetDeck();
        setDiscards(0);
    }, [deckManager, roundManager, gameAnalytics, gameStartTime, target, handsRemaining]);

    const resetGame = useCallback(() => {
        deckManager.resetDeck();
        setPlayerHand([]);
        setScore(0);
        setTotalScore(0);
        setDiscards(0);
        setHandsRemaining(GAME_CONSTANTS.HANDS_PER_BLIND);
        setCash(GAME_CONSTANTS.STARTING_CASH);
        setAnte(1);
        const b = firstBlind();
        setBlind(b);
        const t = getBlindTarget(1, b);
        setTarget(t);
        setIsOverflow(isOverflowTarget(t));
        setInShop(false);
        setIsWin(false);
        setIsGameOver(false);
    }, [deckManager]);

    const proceedFromShop = useCallback(() => {
        if (isOverflow) {
            setIsGameOver(true);
            return;
        }
        let next = nextBlind(blind);
        let nextAnte = ante;
        if (next === null) {
            nextAnte = ante + 1;
            next = 'small';
            if (nextAnte > GAME_CONSTANTS.MAX_ANTE) {
                setIsWin(true);
            }
        }
        const t = getBlindTarget(nextAnte, next);
        const overflow = isOverflowTarget(t);
        setAnte(nextAnte);
        setBlind(next);
        setTarget(t);
        setIsOverflow(overflow);
        setInShop(false);
        setHandsRemaining(GAME_CONSTANTS.HANDS_PER_BLIND);
        roundManager.startRound('normal' as any, t);
        const newHand = deckManager.drawCards(GAME_CONSTANTS.STARTING_HAND_SIZE);
        setPlayerHand(newHand);
    }, [ante, blind, roundManager, deckManager, isOverflow]);

    function playRound() {
        const target = roundManager.getTargetChips();
        if (score >= target) {
            roundManager.advanceBlind();
            // ...trigger shop...
        } else {
            // ...decrement hands/cards...
            roundManager.checkEndConditions(score, handsRemaining);
        }
    }

    return {
        ante: roundManager.ante,
        blind: roundManager.getCurrentBlind(),
        target: roundManager.getTargetChips(),
        overflowed: roundManager.overflowed,
        win: roundManager.win,
        lose: roundManager.lose,
        endless: roundManager.endless,
        playerHand,
        score,
        totalScore,
        handsRemaining,
        cash,
        inShop,
        isWin,
        isGameOver,
        isOverflow,
        startNewGame,
        discardCards,
        calculateCurrentScore,
        endCurrentRound,
        resetGame,
        proceedFromShop,
        playRound,
    };
}
