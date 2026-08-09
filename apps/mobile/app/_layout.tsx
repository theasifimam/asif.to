import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../constants/Theme';
import { View, StyleSheet } from 'react-native';
import Toast from '../components/ui/Toast';

const queryClient = new QueryClient();

function LayoutContent() {
  const { colors: theme } = useAppTheme();

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false, title: 'Notifications' }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, title: 'Checkout' }} />
        <Stack.Screen name="orders" options={{ headerShown: false, title: 'My Orders' }} />
        <Stack.Screen name="addresses" options={{ headerShown: false, title: 'My Addresses' }} />
        <Stack.Screen name="payments" options={{ headerShown: false, title: 'Payments' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <Toast />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LayoutContent />
      </QueryClientProvider>
    </Provider>
  );
}

// npm install @reduxjs/toolkit react-redux @tanstack/react-query axios react-hook-form yup @hookform/resolvers