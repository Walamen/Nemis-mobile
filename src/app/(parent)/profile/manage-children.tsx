import { useRouter, type Href } from 'expo-router';

import { Button } from '@/components/buttons/button';
import { initialsOf } from '@/components/cards/message-card';
import { Badge } from '@/components/common/badge';
import { ChildGate } from '@/components/common/child-gate';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import type { Child } from '@/types/dashboard';
import { View } from '@/tw';
import { formatNemisIdInput } from '@/utils/nemis-id';

function SectionLabel({ children }: { children: string }) {
  return (
    <ThemedText type="smallBold" themeColor="textSecondary" className="mb-2 mt-5 uppercase">
      {children}
    </ThemedText>
  );
}

function ChildCard({ child, onViewRecord }: { child: Child; onViewRecord: () => void }) {
  const theme = useTheme();
  const name = `${child.firstName} ${child.lastName}`;
  return (
    <View className="mb-3 gap-3 rounded-card p-4" style={{ backgroundColor: theme.card }}>
      <View className="flex-row items-center gap-3">
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
        <Badge label="Linked" tone="success" />
      </View>

      <View
        className="flex-row items-center justify-between border-t pt-3"
        style={{ borderColor: theme.backgroundSelected }}
      >
        <ThemedText type="small" themeColor="textSecondary">
          NEMIS ID
        </ThemedText>
        {/* The server's `studentId` field carries the NEMIS ID. */}
        <ThemedText type="smallBold">{formatNemisIdInput(child.studentId)}</ThemedText>
      </View>

      <Button variant="secondary" label="View Record" onPress={onViewRecord} />
    </View>
  );
}

function LinkedChildren() {
  const router = useRouter();
  const { children, setSelectedChildId } = useSelectedChild();
  return (
    <>
      {children.map((child) => (
        <ChildCard
          key={child.id}
          child={child}
          onViewRecord={() => {
            setSelectedChildId(child.id);
            router.push('/dashboard/my-child' as Href);
          }}
        />
      ))}
    </>
  );
}

/**
 * Linked children — the children on this parent account, in the Linked
 * children design: one card per child (class · school, NEMIS ID, View
 * Record, which also makes that child the selected one app-wide).
 *
 * Parts of the design that need server support are left out rather than
 * shown as controls that do nothing: Relationship and Linked since aren't
 * returned by `GET /parent/children`, there's no per-child alert setting,
 * and no link-request endpoint — adding a child goes through the school
 * (Contact school) instead of the design's "Send Link Request" form.
 */
export default function ManageChildrenScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <AppScreen>
      <AppHeader title="Linked children" titleAlign="left" />
      <ThemedText type="small" themeColor="textSecondary">
        Children are linked to your account by their school using their NEMIS ID. You can view each
        child&apos;s records here.
      </ThemedText>

      <SectionLabel>Linked children</SectionLabel>
      <ChildGate loadingFallback={<SkeletonList count={2} lines={3} />}>
        <LinkedChildren />
      </ChildGate>

      <SectionLabel>Add a child</SectionLabel>
      <View className="gap-3 rounded-card p-4" style={{ backgroundColor: theme.card }}>
        <ThemedText type="small" themeColor="textSecondary">
          Send the school your child&apos;s NEMIS ID (from their report card or enrollment slip).
          The school links the child to your account, and they appear here.
        </ThemedText>
        <Button
          label="Contact school"
          onPress={() => router.push('/communication/new-message' as Href)}
        />
      </View>

      <ThemedText type="small" themeColor="textSecondary" className="mb-6 mt-5 text-center">
        To remove a child or correct a relationship, contact your school administrator.
      </ThemedText>
    </AppScreen>
  );
}
