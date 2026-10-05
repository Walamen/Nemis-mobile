import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { View } from '@/tw';

export default function ChangePasswordScreen() {
  return (
    <AppScreen contentClassName="" keyboardAvoiding>
      <AppHeader title="Change password" titleAlign="left" />
      <View className="px-6 pt-2">
        <ChangePasswordForm />
      </View>
    </AppScreen>
  );
}
