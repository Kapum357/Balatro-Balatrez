import React, {useEffect} from 'react';
import {View, FlatList} from 'react-native';
import {useRouter} from 'expo-router';
import {useBets} from '@/hooks/useBets';
import BetCard from '@/components/BetCard';
import {PixelButton} from '@/components/PixelButton';

export default function AdminBetsList() {
    const router = useRouter();
    const {list, load} = useBets();

    useEffect(() => {
        load();
    }, [load]);

    return (
        <View style={{flex: 1, padding: 12}}>
            <PixelButton title="Nueva" onPress={() => router.push('/admin/bets/new')}/>
            <FlatList data={list} keyExtractor={(i) => i.id} renderItem={({item}) => (
                <BetCard bet={item} onPressOpen={() => router.push(`/admin/bets/${item.id}/edit`)}/>
            )}/>
        </View>
    );
}

