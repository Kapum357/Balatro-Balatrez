// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveGameState(key: string, value: object) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving game state:', e);
  }
}

export async function loadGameState(key: string): Promise<any> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error loading game state:', e);
    return null;
  }
}