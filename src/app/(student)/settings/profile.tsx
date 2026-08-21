import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/layout/app-header';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { View } from '@/tw';

export default function ProfileScreen() {
  return (
    // `react-native-safe-area-context`'s `SafeAreaView` doesn't get
    // `className` support from NativeWind/`react-native-css` (see
    // `app-screen.tsx`'s comment) — use real `style` for the flex
    // contract, same fix as AppScreen's root.
    <SafeAreaView style={{ flex: 1 }}>
      <AppHeader title="Profile" />
      <View className="flex-1 px-6 pt-2">
        <EditProfileForm />
      </View>
    </SafeAreaView>
  );
}
