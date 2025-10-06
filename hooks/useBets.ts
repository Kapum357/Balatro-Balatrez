import {useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {BetStatus} from '@/.expo/types/bet';
import {BetManager} from '@/managers/betManager';
import * as BetsService from '@/utils/betsService';
import {useAuth} from '@/contexts/AuthContext';
import {GameAnalytics} from '@/utils/analytics';

const manager = new BetManager();
const analytics = new GameAnalytics();

export function useBets() {
    const {session} = useAuth();
    const userId = session?.user?.id ?? null;

    const load = useCallback(async (status?: BetStatus) => {
        const {data, error} = await BetsService.listBets({status});
        if (error) {
            Alert.alert('Error', error);
            return;
        }
        manager.upsertList(data.bets, data.reachedEnd);
    }, []);

    const loadMore = useCallback(async () => {
        const cursor = manager.getCursor().before;
        const {data, error} = await BetsService.listBets({before: cursor || undefined});
        if (error) {
            Alert.alert('Error', error);
            return;
        }
        manager.upsertList(data.bets, data.reachedEnd);
    }, []);

    const refreshBet = useCallback(async (betId: string) => {
        const {data, error} = await BetsService.getBet(betId);
        if (error || !data) {
            if (error) Alert.alert('Error', error);
            return;
        }
        manager.setDetail(data.bet, data.options, data.participants);
    }, []);

    const create = useCallback(async (input: {
        title: string;
        description?: string;
        stake_per_player: number;
        options: string[];
        auto_lock_at?: string | null
    }) => {
        const {data, error} = await BetsService.createBet(input);
        if (error || !data) {
            Alert.alert('Error', error || 'No se pudo crear');
            return null;
        }
        analytics.trackBetCreated({betId: data.id, stake: data.stake_per_player, optionCount: input.options.length});
        manager.upsertList([data], false);
        return data;
    }, []);

    const update = useCallback(async (betId: string, input: Partial<{
        title: string;
        description: string;
        stake_per_player: number;
        status: BetStatus;
        auto_lock_at: string | null
    }>) => {
        const {data, error} = await BetsService.updateBet(betId, input);
        if (error || !data) {
            Alert.alert('Error', error || 'No se pudo actualizar');
            return null;
        }
        manager.replaceBet(data);
        return data;
    }, []);

    const remove = useCallback(async (betId: string) => {
        const {error} = await BetsService.deleteBet(betId);
        if (error) {
            Alert.alert('Error', error);
            return false;
        }
        manager.removeBet(betId);
        return true;
    }, []);

    const join = useCallback(async (betId: string, optionId: string) => {
        if (!userId) {
            Alert.alert('Error', 'No autenticado');
            return;
        }
        if (!manager.canJoin(betId, userId)) return;
        manager.optimisticJoin(betId, userId, optionId);
        const res = await BetsService.joinBet(betId, optionId);
        if (res.error || !res.participant) {
            // rollback
            await refreshBet(betId);
            Alert.alert('Error', res.error || 'No se pudo unir');
            return;
        }
        analytics.trackBetJoined({betId, optionId, stake: manager.getBet(betId)?.stake_per_player || 0});
        manager.reconcileJoin(betId, userId, res.participant);
    }, [userId, refreshBet]);

    const leave = useCallback(async (betId: string) => {
        if (!userId) {
            Alert.alert('Error', 'No autenticado');
            return;
        }
        if (!manager.canLeave(betId, userId)) return;
        manager.optimisticLeave(betId, userId);
        const res = await BetsService.leaveBet(betId);
        if (res.error || !res.participant) {
            await refreshBet(betId);
            Alert.alert('Error', res.error || 'No se pudo salir');
            return;
        }
        manager.reconcileLeave(betId, userId, res.participant);
    }, [userId, refreshBet]);

    const settle = useCallback(async (betId: string, winningOptionId: string) => {
        const {data, error} = await BetsService.settleBet(betId, winningOptionId);
        if (error || !data) {
            Alert.alert('Error', error || 'No se pudo liquidar');
            return;
        }
        const pot = (manager.getParticipants(betId).filter(p => !p.left_at).length) * (manager.getBet(betId)?.stake_per_player || 0);
        const winners = manager.getParticipants(betId).filter(p => !p.left_at && p.option_id === winningOptionId).length;
        analytics.trackBetSettled({betId, winningOptionId, winners, pot});
        manager.replaceBet(data);
    }, []);

    const cancel = useCallback(async (betId: string) => {
        const {data, error} = await BetsService.cancelBet(betId);
        if (error || !data) {
            Alert.alert('Error', error || 'No se pudo cancelar');
            return;
        }
        const participants = manager.getParticipants(betId).filter(p => !p.left_at).length;
        analytics.trackBetCanceled({betId, participants});
        manager.replaceBet(data);
    }, []);

    return useMemo(() => ({
        state: manager.getState(),
        list: manager.getList(),
        get: manager.getBet.bind(manager),
        getOptions: manager.getOptions.bind(manager),
        getParticipants: manager.getParticipants.bind(manager),
        load, loadMore, refreshBet,
        create, update, remove,
        join, leave, settle, cancel,
    }), [load, loadMore, refreshBet, create, update, remove, join, leave, settle, cancel]);
}

