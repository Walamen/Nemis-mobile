import { Stack } from 'expo-router';

export default function FeesLayout() {
  return (
    // headerShown: false — see (student)/learning/_layout.tsx for why.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Fees' }} />
      <Stack.Screen name="balance" options={{ title: 'Current Balance' }} />
      <Stack.Screen name="payment-history" options={{ title: 'Payment History' }} />
    </Stack>
  );
}
