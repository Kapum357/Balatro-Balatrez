import React, {useState} from 'react';
import {View, TextInput} from 'react-native';
import {useRouter} from 'expo-router';
import {useBets} from '@/hooks/useBets';
import {PixelButton} from '@/components/PixelButton';
import {PixelText} from '@/components/PixelText';

export default function NewBetScreen() {
    const router = useRouter();
    const {create} = useBets();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [stake, setStake] = useState('10');
    const [options, setOptions] = useState('Sí,No');

    const onSubmit = async () => {
        const created = await create({
            title,
            description,
            stake_per_player: parseInt(stake, 10),
            options: options.split(',')
        });
        if (created) router.replace(`/admin/bets/${created.id}/edit`);
    };

    return (
        <View style={{flex: 1, padding: 12}}>
            <PixelText>Título</PixelText>
            <TextInput value={title} onChangeText={setTitle} style={{backgroundColor: '#222', padding: 8}}/>
            <PixelText>Descripción</PixelText>
            <TextInput value={description} onChangeText={setDescription} style={{backgroundColor: '#222', padding: 8}}/>
            <PixelText>Stake</PixelText>
            <TextInput value={stake} onChangeText={setStake} keyboardType="numeric"
                       style={{backgroundColor: '#222', padding: 8}}/>
            <PixelText>Opciones (separadas por coma)</PixelText>
            <TextInput value={options} onChangeText={setOptions} style={{backgroundColor: '#222', padding: 8}}/>
            <PixelButton title="Crear" onPress={onSubmit}/>
        </View>
    );
}

