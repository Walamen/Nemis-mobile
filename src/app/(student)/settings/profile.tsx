import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/layout/app-header';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { View } from '@/tw';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1">
      <AppHeader title="Profile" />
      <View className="flex-1 px-6 pt-2">
        <EditProfileForm />
      </View>
    </SafeAreaView>
  );
}
