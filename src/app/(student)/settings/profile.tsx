import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { StudentProfileEditor } from '@/components/profile/student-profile-editor';
import { View } from '@/tw';

/** Settings → Edit profile. Same route (`/settings/profile`) as before. */
export default function EditProfileScreen() {
  return (
    <AppScreen contentClassName="" keyboardAvoiding>
      <AppHeader title="Edit profile" titleAlign="left" />
      <View className="px-4 pt-2">
        <StudentProfileEditor />
      </View>
    </AppScreen>
  );
}
