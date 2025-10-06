import React, {useEffect, useState} from 'react';
import {View, TextInput, ScrollView} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useBets} from '@/hooks/useBets';
import {PixelText} from '@/components/PixelText';
import {PixelButton} from '@/components/PixelButton';
import { BetOptionPill } from '@/components/BetOptionPill';
import BetAdminPanel from '@/components/BetAdminPanel';

export default function EditBetScreen() {
    const {betId} = useLocalSearchParams<{ betId: string }>();
    const router = useRouter();
    const {get, getOptions, refreshBet, update, settle, cancel, remove} = useBets();
    const bet = betId ? get(betId) : null;
    const options = betId ? getOptions(betId) : [];
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [winning, setWinning] = useState<string | null>(null);

    useEffect(() => {
        if (betId) refreshBet(betId);
    }, [betId, refreshBet]);
    useEffect(() => {
        if (bet) {
            setTitle(bet.title);
            setDescription(bet.description || '');
        }
    }, [bet?.id, bet]);

    const canOpen = bet?.status === 'draft';
    const canLock = bet?.status === 'open';
    const canUnlock = bet?.status === 'locked';
    const canSettle = bet && (bet.status === 'open' || bet.status === 'locked') && !!winning;
    const canCancel = bet && bet.status !== 'settled' && bet.status !== 'canceled';

    if (!bet) return <View
        style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><PixelText>Cargando...</PixelText></View>;

    return (
        <ScrollView contentContainerStyle={{padding: 12}}>
            <PixelText size="large">Editar apuesta</PixelText>
            <PixelText>Título</PixelText>
            <TextInput value={title} onChangeText={setTitle} style={{backgroundColor: '#222', padding: 8}}/>
            <PixelText>Descripción</PixelText>
            <TextInput value={description} onChangeText={setDescription}
                       style={{backgroundColor: '#222', padding: 8, marginBottom: 8}}/>
            <PixelButton title="Guardar" onPress={() => update(bet.id, {title, description})}/>

            <PixelText size="medium" style={{marginTop: 12}}>Opciones</PixelText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8}}>
                {options.map(o => (
                    <BetOptionPill key={o.id} label={o.label} selected={winning === o.id}
                                   onPress={() => setWinning(o.id)}/>
                ))}
            </View>

            <PixelText size="medium" style={{marginTop: 12}}>Estado actual: {bet.status}</PixelText>
            <BetAdminPanel
                onOpen={canOpen ? () => update(bet.id, {status: 'open'}) : undefined}
                onLock={canLock ? () => update(bet.id, {status: 'locked'}) : undefined}
                onUnlock={canUnlock ? () => update(bet.id, {status: 'open'}) : undefined}
                onSettle={canSettle ? () => winning && settle(bet.id, winning) : undefined}
                onCancel={canCancel ? () => cancel(bet.id) : undefined}
            />

            <PixelButton title="Eliminar" variant="danger" onPress={async () => {
                const ok = await remove(bet.id);
                if (ok) router.back();
            }}/>
        </ScrollView>
    );
}
