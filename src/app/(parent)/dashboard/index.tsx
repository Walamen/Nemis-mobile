import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetParentDashboardQuery } from '@/api/parent/dashboard-api';
import { QuickActionCard } from '@/components/cards/quick-action-card';
import { StatCard } from '@/components/cards/stat-card';
import { Card } from '@/components/common/card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { HeroBanner } from '@/components/common/hero-banner';
import { Icon, type IconProps } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { ThemedView } from '@/components/common/themed-view';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { useUnreadTotal } from '@/hooks/use-unread-total';
import { Palette } from '@/theme';

const CHEVRON_ICON: IconProps['name'] = {
  ios: 'chevron.right',
  android: 'chevron_right',
  web: 'chevron_right',
};

// Same tile treatment as the Student Home's Quick Actions (themed card
// surface + per-action tint from the student set — docs/UI_PATTERNS.md §10),
// pointing at parent routes.
const QUICK_ACTIONS: { label: string; href: Href; icon: IconProps['name']; tint: string }[] = [
  {
    label: 'My Child',
    href: '/dashboard/my-child' as Href,
    icon: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
    tint: '#6E3BD6',
  },
  {
    label: 'Fees',
    href: '/finance' as Href,
    icon: { ios: 'creditcard', android: 'credit_card', web: 'credit_card' },
    tint: '#121894',
  },
  {
    label: 'Attendance',
    href: '/academics/attendance' as Href,
    icon: { ios: 'checkmark.circle', android: 'event_available', web: 'event_available' },
    tint: '#1B8A4C',
  },
  {
    label: 'Contact School',
    href: '/communication/new-message' as Href,
    icon: { ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' },
    tint: '#0E7C86',
  },
];

const ALERT_BORDER_COLOR = {
  warning: Palette.warning,
  info: Palette.secondary,
  error: Palette.error,
} as const;

/**
 * Parent Home — the Student Home's layout (fixed `DashboardHeader`, hero,
 * Quick Stats, alerts, Quick Actions, a record card) with parent data: the
 * dashboard summary plus the selected child.
 */
export default function ParentDashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const dashboardQuery = useGetParentDashboardQuery();
  const childrenQuery = useSelectedChild();
  const { data } = dashboardQuery;
  const { selectedChild } = childrenQuery;
  // The dashboard endpoint's `stats.unreadMessages` is always 0 on the
  // server, so the bell and "Unread" stat count unread notifications +
  // unread direct messages instead — the same source as the Student Home.
  const unread = useUnreadTotal();

  const totalChildren = data?.stats.totalChildren;
  const isRefreshing = dashboardQuery.isFetching || childrenQuery.isFetching;
  function refreshAll() {
    dashboardQuery.refetch();
    childrenQuery.refetch();
    unread.refetch();
  }

  return (
    // Same shell as the Student Home: the header sits outside the scroll
    // view and owns the top inset so its blue extends behind the status bar;
    // no `bottom` edge — the tab bar already reserves that space.
    <SafeAreaView style={styles.flex} edges={['left', 'right']}>
      <DashboardHeader
        greeting={`Hello, ${user?.firstName ?? ''}`}
        subtitle={
          totalChildren != null
            ? `${totalChildren} ${totalChildren === 1 ? 'child' : 'children'} linked`
            : undefined
        }
        unreadCount={unread.total}
        notificationsHref={'/communication/notifications' as Href}
        avatarUrl={user?.profileImageUrl}
        avatarInitial={user?.firstName?.charAt(0)}
        avatarHref={'/profile' as Href}
      />

      <QueryState
        isLoading={dashboardQuery.isLoading}
        // A failed refresh keeps showing the dashboard already loaded.
        isError={dashboardQuery.isError && !data}
        error={dashboardQuery.error}
        onRetry={dashboardQuery.refetch}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
        >
          <View style={styles.body}>
            {user?.institution && (
              <HeroBanner
                title={user.institution.name}
                subtitle={user.institution.address}
                className="mt-4"
              />
            )}

            <SectionHeader title="Quick Stats" />
            <View style={styles.statRow}>
              <StatCard
                label="Outstanding fees"
                value={`LRD ${(data?.stats.outstandingFees ?? 0).toLocaleString()}`}
                backgroundColor={theme.card}
              />
              <StatCard
                label="Assignments due"
                value={`${data?.stats.assignmentsDue ?? 0}`}
                backgroundColor={theme.card}
              />
              <StatCard
                label="Unread"
                value={`${unread.total ?? 0}`}
                backgroundColor={theme.card}
              />
            </View>

            {data?.alerts?.map((alert, index) => (
              <ThemedView
                key={`${alert.type}-${alert.title}-${index}`}
                style={[
                  styles.alert,
                  { backgroundColor: theme.card, borderLeftColor: ALERT_BORDER_COLOR[alert.type] },
                ]}
              >
                <ThemedText type="smallBold">{alert.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {alert.message}
                </ThemedText>
              </ThemedView>
            ))}

            <SectionHeader title="Quick Actions" />
            <View style={styles.quickGrid}>
              {QUICK_ACTIONS.map((action) => (
                <QuickActionCard key={action.label} {...action} bg={theme.card} />
              ))}
            </View>

            <SectionHeader title="Your children" href={'/dashboard/my-child' as Href} />
            <ChildSwitcher />
            {selectedChild ? (
              <Card
                onPress={() => router.push('/dashboard/my-child' as Href)}
                backgroundColor={theme.card}
                className="flex-row items-center"
                accessibilityLabel={`${selectedChild.firstName} ${selectedChild.lastName}. ${selectedChild.grade}, ${selectedChild.school}. Attendance ${selectedChild.attendance}%. ${selectedChild.feeLabel}`}
                accessibilityHint="Opens your child's record"
              >
                <View style={[styles.recordAvatar, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText type="smallBold" style={{ color: Palette.secondary }}>
                    {`${selectedChild.firstName.charAt(0)}${selectedChild.lastName.charAt(0)}`}
                  </ThemedText>
                </View>
                <View className="flex-1 gap-0.5">
                  <ThemedText type="smallBold">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {selectedChild.grade} · {selectedChild.school}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Attendance {selectedChild.attendance}% · {selectedChild.feeLabel}
                  </ThemedText>
                </View>
                <Icon name={CHEVRON_ICON} size="sm" color={theme.textSecondary} />
              </Card>
            ) : (
              !childrenQuery.isLoading && (
                <ThemedView className="rounded-card p-6" style={{ backgroundColor: theme.card }}>
                  <ThemedText themeColor="textSecondary" className="text-center">
                    {childrenQuery.isError
                      ? "Couldn't load your children right now."
                      : 'No children linked to your account yet.'}
                  </ThemedText>
                </ThemedView>
              )
            )}
          </View>
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  body: {
    paddingHorizontal: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  alert: {
    marginTop: 12,
    gap: 4,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recordAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
});
