import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {PixelButton} from '@/components/PixelButton';
import {PixelText} from '@/components/PixelText';
import { BetOptionPill } from '@/components/BetOptionPill';
import {BetOption} from '@/.expo/types/bet';

export default function BetJoinPanel({options, stake, onJoin}: {
    options: BetOption[];
    stake: number;
    onJoin: (optionId: string) => void
}) {
    const [selected, setSelected] = useState<string | null>(null);
    return (
        <View style={styles.container}>
            <PixelText>Stake: {stake}</PixelText>
            <View style={styles.options}>
                {options.map(o => <BetOptionPill key={o.id} label={o.label} selected={selected === o.id}
                                                 onPress={() => setSelected(o.id)}/>)}
            </View>
            <PixelButton title="Unirme" onPress={() => selected && onJoin(selected)} disabled={!selected}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {padding: 12},
    options: {flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8}
});

