import {supabase} from '@/utils/supabaseClient';
import {Bet, BetOption, BetParticipant, BetStatus, GetBetResult, ListBetsParams, ListBetsResult} from '@/.expo/types/bet';

export async function listBets(params: ListBetsParams = {}): Promise<{ data: ListBetsResult; error: string | null }> {
    const {status, before, limit = 20} = params;
    let query = supabase.from('bets').select('*').order('created_at', {ascending: false}).limit(limit + 1);
    if (status) query = query.eq('status', status);
    if (before) query = query.lt('created_at', before);
    const {data, error} = await query;
    if (error) return {data: {bets: [], reachedEnd: true}, error: error.message};
    const reachedEnd = (data?.length || 0) <= limit;
    const bets = (data || []).slice(0, limit) as Bet[];
    return {data: {bets, reachedEnd}, error: null};
}

export async function getBet(id: string): Promise<{ data: GetBetResult | null; error: string | null }> {
    const [b, o, p] = await Promise.all([
        supabase.from('bets').select('*').eq('id', id).single(),
        supabase.from('bet_options').select('*').eq('bet_id', id).order('sort_order', {ascending: true}),
        supabase.from('bet_participants').select('*').eq('bet_id', id)
    ]);
    if (b.error) return {data: null, error: b.error.message};
    return {
        data: {
            bet: b.data as Bet,
            options: (o.data || []) as BetOption[],
            participants: (p.data || []) as BetParticipant[]
        }, error: null
    };
}

export async function createBet(input: {
    title: string;
    description?: string;
    stake_per_player: number;
    options: string[];
    auto_lock_at?: string | null
}): Promise<{ data: Bet | null; error: string | null }> {
    const {title, description, stake_per_player, options, auto_lock_at} = input;
    const {data, error} = await supabase.rpc('create_bet', {
        p_created_by: (await supabase.auth.getUser()).data.user?.id,
        p_title: title,
        p_description: description ?? null,
        p_stake_per_player: stake_per_player,
        p_options: options,
        p_auto_lock_at: auto_lock_at ?? null
    });
    return {data: (data as Bet) || null, error: error?.message || null};
}

export async function updateBet(id: string, input: Partial<{
    title: string;
    description: string;
    stake_per_player: number;
    status: BetStatus;
    auto_lock_at: string | null
}>): Promise<{ data: Bet | null; error: string | null }> {
    const {title, description, stake_per_player, status, auto_lock_at} = input;
    const {data, error} = await supabase.rpc('update_bet', {
        p_bet_id: id,
        p_title: title ?? null,
        p_description: description ?? null,
        p_stake_per_player: stake_per_player ?? null,
        p_status: status ?? null,
        p_auto_lock_at: (auto_lock_at === undefined ? null : auto_lock_at)
    });
    return {data: (data as Bet) || null, error: error?.message || null};
}

export async function deleteBet(id: string): Promise<{ error: string | null }> {
    const {error} = await supabase.from('bets').delete().eq('id', id);
    return {error: error?.message || null};
}

export async function joinBet(betId: string, optionId: string): Promise<{
    participant: BetParticipant | null;
    balance_after: number | null;
    error: string | null
}> {
    const {data: userRes} = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return {participant: null, balance_after: null, error: 'No autenticado'};
    const {data, error} = await supabase.rpc('join_bet', {p_bet_id: betId, p_option_id: optionId, p_user_id: userId});
    if (error) return {participant: null, balance_after: null, error: error.message};
    const row = (data as any[])[0];
    return {participant: row?.participant as BetParticipant, balance_after: row?.balance_after ?? null, error: null};
}

export async function leaveBet(betId: string): Promise<{
    participant: BetParticipant | null;
    balance_after: number | null;
    error: string | null
}> {
    const {data: userRes} = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return {participant: null, balance_after: null, error: 'No autenticado'};
    const {data, error} = await supabase.rpc('leave_bet', {p_bet_id: betId, p_user_id: userId});
    if (error) return {participant: null, balance_after: null, error: error.message};
    const row = (data as any[])[0];
    return {participant: row?.participant as BetParticipant, balance_after: row?.balance_after ?? null, error: null};
}

export async function settleBet(betId: string, winningOptionId: string): Promise<{
    data: Bet | null;
    error: string | null
}> {
    const {data: userRes} = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    const {data, error} = await supabase.rpc('settle_bet', {
        p_bet_id: betId,
        p_winning_option_id: winningOptionId,
        p_settled_by: userId
    });
    return {data: (data as Bet) || null, error: error?.message || null};
}

export async function cancelBet(betId: string): Promise<{ data: Bet | null; error: string | null }> {
    const {data: userRes} = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    const {data, error} = await supabase.rpc('cancel_bet', {p_bet_id: betId, p_canceled_by: userId});
    return {data: (data as Bet) || null, error: error?.message || null};
}

