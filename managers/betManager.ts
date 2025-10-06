import {Bet, BetOption, BetParticipant} from '@/.expo/types/bet';

export type BetsState = {
    list: Bet[];
    byId: Record<string, Bet>;
    optionsByBet: Record<string, BetOption[]>;
    participantsByBet: Record<string, BetParticipant[]>;
    cursors: { before: string | null; reachedEnd: boolean };
};

export class BetManager {
    private state: BetsState = {
        list: [],
        byId: {},
        optionsByBet: {},
        participantsByBet: {},
        cursors: {before: null, reachedEnd: false}
    };
    private pendingJoins: Set<string> = new Set(); // betId_userId
    private pendingLeaves: Set<string> = new Set();

    getState() {
        return this.state;
    }

    getList() {
        return this.state.list;
    }

    getBet(id: string) {
        return this.state.byId[id] || null;
    }

    getOptions(betId: string) {
        return this.state.optionsByBet[betId] || [];
    }

    getParticipants(betId: string) {
        return this.state.participantsByBet[betId] || [];
    }

    getCursor() {
        return this.state.cursors;
    }

    upsertList(bets: Bet[], reachedEnd: boolean) {
        const existingIds = new Set(this.state.list.map(b => b.id));
        const merged = [...this.state.list];
        for (const b of bets) {
            this.state.byId[b.id] = b;
            if (!existingIds.has(b.id)) merged.push(b);
        }
        this.state.list = merged.sort((a, b) => b.created_at.localeCompare(a.created_at));
        this.state.cursors = {before: merged.length ? merged[merged.length - 1].created_at : null, reachedEnd};
    }

    replaceBet(bet: Bet) {
        this.state.byId[bet.id] = bet;
        this.state.list = this.state.list.map(b => b.id === bet.id ? bet : b);
    }

    setDetail(bet: Bet, options: BetOption[], participants: BetParticipant[]) {
        this.state.byId[bet.id] = bet;
        this.state.optionsByBet[bet.id] = options;
        this.state.participantsByBet[bet.id] = participants;
        const exists = this.state.list.some(b => b.id === bet.id);
        if (!exists) this.state.list.unshift(bet);
    }

    removeBet(betId: string) {
        delete this.state.byId[betId];
        delete this.state.optionsByBet[betId];
        delete this.state.participantsByBet[betId];
        this.state.list = this.state.list.filter(b => b.id !== betId);
    }

    optimisticJoin(betId: string, userId: string, optionId: string) {
        const key = `${betId}_${userId}`;
        this.pendingJoins.add(key);
        const current = this.getParticipants(betId);
        this.state.participantsByBet[betId] = [...current, {
            bet_id: betId,
            user_id: userId,
            option_id: optionId,
            joined_at: new Date().toISOString(),
            left_at: null
        }];
    }

    reconcileJoin(betId: string, userId: string, participant?: BetParticipant) {
        const key = `${betId}_${userId}`;
        this.pendingJoins.delete(key);
        const current = this.getParticipants(betId).filter(p => !(p.user_id === userId && p.left_at == null));
        this.state.participantsByBet[betId] = participant ? [...current, participant] : current;
    }

    optimisticLeave(betId: string, userId: string) {
        const key = `${betId}_${userId}`;
        this.pendingLeaves.add(key);
        this.state.participantsByBet[betId] = this.getParticipants(betId).map(p => p.user_id === userId && !p.left_at ? {
            ...p,
            left_at: new Date().toISOString()
        } : p);
    }

    reconcileLeave(betId: string, userId: string, participant?: BetParticipant) {
        const key = `${betId}_${userId}`;
        this.pendingLeaves.delete(key);
        this.state.participantsByBet[betId] = this.getParticipants(betId).map(p => p.user_id === userId ? (participant ?? p) : p);
    }

    canJoin(betId: string, userId: string | null) {
        const bet = this.getBet(betId);
        if (!bet || !userId) return false;
        if (!(bet.status === 'open')) return false;
        const already = this.getParticipants(betId).some(p => p.user_id === userId && !p.left_at);
        return !already;
    }

    canLeave(betId: string, userId: string | null) {
        const bet = this.getBet(betId);
        if (!bet || !userId) return false;
        if (!(bet.status === 'open' || bet.status === 'locked')) return false;
        const active = this.getParticipants(betId).some(p => p.user_id === userId && !p.left_at);
        return active && bet.status === 'open';
    }

}

