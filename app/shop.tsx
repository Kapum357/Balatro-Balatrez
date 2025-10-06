import React from 'react';
import {ShopScreen} from '@/components/ShopScreen';
import {useLocalSearchParams} from 'expo-router';

export default function Shop() {
    const params = useLocalSearchParams();
    return <ShopScreen
        chips={params.chips ? Number(Array.isArray(params.chips) ? params.chips[0] : params.chips) : undefined}/>;
}
