import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/layout/app-header';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { View } from '@/tw';

export default function ChangePasswordScreen() {
  return (
    <SafeAreaView className="flex-1">
      <AppHeader title="Change Password" />
      <View className="flex-1 px-6 pt-2">
        <ChangePasswordForm />
      </View>
    </SafeAreaView>
  );
}
