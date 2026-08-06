import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useSelectedChild } from '@/hooks/use-selected-child';

export default function ProfileScreen() {
  const { children } = useSelectedChild();

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 px-6 pt-4" keyboardShouldPersistTaps="handled">
        <EditProfileForm />

        {children.length > 0 && (
          <>
            <ThemedText type="sectionHeading" className="mb-2 mt-6">
              Linked children
            </ThemedText>
            {children.map((child) => (
              <ThemedView
                key={child.id}
                type="backgroundElement"
                className="mb-2 flex-row items-center justify-between rounded-card p-4"
              >
                <ThemedText type="small">
                  {child.firstName} {child.lastName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {child.grade}
                </ThemedText>
              </ThemedView>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
