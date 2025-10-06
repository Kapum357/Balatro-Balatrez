import React, {useState} from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import {PixelButton} from './PixelButton';
import {Theme} from '@/constants/Theme';

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
    onTyping?: (typing: boolean) => void;
}

export function ChatInput({onSend, disabled, onTyping}: ChatInputProps) {
    const [text, setText] = useState('');

    function handleSend() {
        const trimmed = text.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setText('');
        onTyping?.(false);
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={text}
                placeholder="Message"
                placeholderTextColor={Theme.colors.textFaint}
                onChangeText={(v) => {
                    setText(v);
                    onTyping?.(v.length > 0);
                }}
                editable={!disabled}
                multiline
            />
            <PixelButton title="Send" onPress={handleSend} disabled={disabled || text.trim().length === 0} small/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: Theme.spacing.xs,
        borderTopWidth: 1,
        borderColor: Theme.colors.border
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        color: Theme.colors.text,
        fontFamily: Theme.typography.fontPixel,
        padding: Theme.spacing.xs
    }
});
