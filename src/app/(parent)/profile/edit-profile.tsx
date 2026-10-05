import { SectionCaption } from '@/components/common/section-caption';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { View } from '@/tw';

/**
 * Parent "Edit profile": the shared `EditProfileForm` plus the read-only list
 * of linked children. Previously wrapped in `SafeAreaView className="flex-1"`
 * and a React Native `ScrollView className=…` — both ignore `className`, so
 * the screen had no height or padding and rendered blank while loading.
 */
export default function EditProfileScreen() {
  const theme = useTheme();
  const { children } = useSelectedChild();

  return (
    <AppScreen contentClassName="" keyboardAvoiding>
      <AppHeader title="Edit profile" titleAlign="left" />
      <View className="px-6 pb-8 pt-2">
        <EditProfileForm />

        {children.length > 0 && (
          <>
            <SectionCaption className="mt-6">LINKED CHILDREN</SectionCaption>
            <View className="overflow-hidden rounded-card" style={{ backgroundColor: theme.card }}>
              {children.map((child, index) => (
                <View
                  key={child.id}
                  className="flex-row items-center justify-between gap-3 px-4 py-3.5"
                  style={
                    index < children.length - 1
                      ? { borderBottomWidth: 1, borderBottomColor: theme.border }
                      : undefined
                  }
                  accessible
                  accessibilityLabel={`${child.firstName} ${child.lastName}, ${child.grade}`}
                >
                  <ThemedText type="smallBold" className="flex-1">
                    {child.firstName} {child.lastName}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {child.grade}
                  </ThemedText>
                </View>
              ))}
            </View>
            <ThemedText type="small" themeColor="textSecondary" className="mt-2">
              Linked children come from the school register. Contact your school to change them.
            </ThemedText>
          </>
        )}
      </View>
    </AppScreen>
  );
}
