import React, {useEffect, useState} from 'react';
import {View, FlatList} from 'react-native';
import {useRouter} from 'expo-router';
import {useBets} from '@/hooks/useBets';
import BetCard from '@/components/BetCard';
import {Bet, BetStatus} from '@/.expo/types/bet';
import {PixelButton} from '@/components/PixelButton';

export default function BetsListScreen() {
    const router = useRouter();
    const {list, load, loadMore} = useBets();
    const [filter, setFilter] = useState<BetStatus | undefined>('open');

    useEffect(() => {
        load(filter);
    }, [filter, load]);

    return (
        <View style={{flex: 1, padding: 12}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8}}>
                <PixelButton title="Abiertas" onPress={() => setFilter('open')}/>
                <PixelButton title="Bloqueadas" onPress={() => setFilter('locked')}/>
                <PixelButton title="Liquidadas" onPress={() => setFilter('settled')}/>
            </View>
            <FlatList
                data={list}
                keyExtractor={(item: Bet) => item.id}
                renderItem={({item}) => (
                    <BetCard bet={item} onPressOpen={() => router.push(`/bets/${item.id}`)}
                             onPressJoin={item.status === 'open' ? () => router.push(`/bets/${item.id}`) : undefined}/>
                )}
                onEndReached={() => loadMore()}
                onEndReachedThreshold={0.5}
            />
        </View>
    );
}

