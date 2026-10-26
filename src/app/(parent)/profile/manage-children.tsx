import { useRouter, type Href } from 'expo-router';

import { Button } from '@/components/buttons/button';
import { initialsOf } from '@/components/cards/message-card';
import { ChildGate } from '@/components/common/child-gate';
import { Icon } from '@/components/common/icon';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Pressable, View } from '@/tw';

function LinkedChildren() {
  const router = useRouter();
  const theme = useTheme();
  const { children, selectedChildId, setSelectedChildId } = useSelectedChild();

  return (
    <>
      <SectionHeader title="Linked to your account" />
      {children.map((child) => {
        const name = `${child.firstName} ${child.lastName}`;
        const isSelected = child.id === selectedChildId;
        return (
          <Pressable
            key={child.id}
            className="mb-2 flex-row items-center gap-3 rounded-card px-4 py-3"
            style={{ backgroundColor: theme.card }}
            onPress={() => {
              setSelectedChildId(child.id);
              router.push('/dashboard/my-child' as Href);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${name}, ${child.grade}, ${child.school}. Open profile`}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.backgroundSelected }}
            >
              <ThemedText type="smallBold">{initialsOf(name)}</ThemedText>
            </View>
            <View className="flex-1">
              <ThemedText type="smallBold">{name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {[child.grade, child.school].filter(Boolean).join(' · ')}
              </ThemedText>
            </View>
            {isSelected && (
              <ThemedText type="small" themeColor="textSecondary">
                Viewing
              </ThemedText>
            )}
            <Icon
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size="sm"
              color={theme.textSecondary}
            />
          </Pressable>
        );
      })}
    </>
  );
}

/**
 * Manage children — the children linked to this parent account. Linking is
 * done by the school (the server has no parent-facing link/unlink endpoint),
 * so this lists them, opens a child's profile on tap (also making them the
 * selected child app-wide), and sends add/remove requests to the school
 * through "Contact school" rather than offering forms that would reach no one.
 */
export default function ManageChildrenScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <AppScreen>
      <AppHeader title="Manage children" />
      <ChildGate loadingFallback={<SkeletonList count={2} lines={2} />}>
        <LinkedChildren />
      </ChildGate>

      <View className="mt-4 gap-3 rounded-card p-4" style={{ backgroundColor: theme.card }}>
        <ThemedText type="smallBold">Adding or removing a child</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Children are linked to your account by their school. To add a child, or if a child is
          listed by mistake, contact the school with the child&apos;s NEMIS ID.
        </ThemedText>
        <Button
          variant="secondary"
          label="Contact school"
          onPress={() => router.push('/communication/new-message' as Href)}
        />
      </View>
    </AppScreen>
  );
}
