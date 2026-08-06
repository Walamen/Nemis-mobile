import { SafeAreaView } from 'react-native-safe-area-context';

import { EditProfileForm } from '@/components/profile/edit-profile-form';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 px-6 pt-4">
      <EditProfileForm />
    </SafeAreaView>
  );
}
