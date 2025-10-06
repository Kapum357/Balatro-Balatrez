import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, View} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {useBets} from '@/hooks/useBets';
import {PixelText} from '@/components/PixelText';
import BetJoinPanel from '@/components/BetJoinPanel';
import {PixelButton} from '@/components/PixelButton';
import {useAuth} from '@/contexts/AuthContext';

function useCountdown(targetIso?: string | null) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);
    return useMemo(() => {
        if (!targetIso) return null;
        const diff = new Date(targetIso).getTime() - now;
        if (diff <= 0) return '00:00:00';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }, [now, targetIso]);
}

export default function BetDetailScreen() {
    const {betId} = useLocalSearchParams<{ betId: string }>();
    const {get, getOptions, getParticipants, refreshBet, join, leave} = useBets();
    const {session} = useAuth();
    const bet = betId ? get(betId) : null;
    const options = betId ? getOptions(betId) : [];
    const participants = useMemo(
        () => (betId ? getParticipants(betId) : []),
        [betId, getParticipants]
    );
    const myId = session?.user?.id;
    const amIn = useMemo(() => !!participants.find(p => p.user_id === myId && !p.left_at), [participants, myId]);
    const countdown = useCountdown(bet?.auto_lock_at);

    useEffect(() => {
        if (betId) refreshBet(betId);
    }, [betId, refreshBet]);
    if (!bet) return <View
        style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><PixelText>Cargando...</PixelText></View>;

    const canJoin = bet.status === 'open' && !amIn;
    const canLeave = bet.status === 'open' && amIn;

    return (
        <View style={{flex: 1, padding: 12}}>
            <PixelText size="large">{bet.title}</PixelText>
            <PixelText>{bet.description}</PixelText>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8}}>
                <PixelText>Estado: {bet.status}</PixelText>
                <PixelText>Stake: {bet.stake_per_player}</PixelText>
            </View>
            {!!bet.auto_lock_at && bet.status !== 'settled' && (
                <PixelText>Bloqueo en: {countdown}</PixelText>
            )}
            {canJoin && (
                <BetJoinPanel options={options} stake={bet.stake_per_player} onJoin={(optId) => join(bet.id, optId)}/>
            )}
            {canLeave && (
                <PixelButton title="Salir de la apuesta" onPress={() => leave(bet.id)}/>
            )}
            <PixelText size="medium">Participantes ({participants.filter(p => !p.left_at).length})</PixelText>
            <FlatList data={participants} keyExtractor={(p) => p.user_id}
                      renderItem={({item}) => <PixelText>{item.user_id}</PixelText>}/>
        </View>
    );
}
