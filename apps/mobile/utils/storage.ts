import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const storage = {
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Error saving data', e);
    }
  },
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (e) {
      console.error('Error reading data', e);
      return null;
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing data', e);
    }
  },
};

export const secureStorage = {
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('Error securely saving data', e);
    }
  },
  getItem: async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (e) {
      console.error('Error securely reading data', e);
      return null;
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error('Error securely removing data', e);
    }
  },
};
