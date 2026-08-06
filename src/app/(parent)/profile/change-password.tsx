import { SafeAreaView } from 'react-native-safe-area-context';

import { ChangePasswordForm } from '@/components/profile/change-password-form';

export default function ChangePasswordScreen() {
  return (
    <SafeAreaView className="flex-1 px-6 pt-4">
      <ChangePasswordForm />
    </SafeAreaView>
  );
}
