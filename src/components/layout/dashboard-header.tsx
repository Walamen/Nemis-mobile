import { Image } from 'expo-image';
import type { Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { Palette } from '@/theme';
import { Link } from '@/tw';

export type DashboardHeaderProps = {
  greeting: string;
  subtitle: string;
  /** Renders a small badge on the bell when truthy. */
  unreadCount?: number;
  notificationsHref: Href;
  avatarUrl?: string | null;
  /** Shown when there's no `avatarUrl` — typically the user's first initial. */
  avatarInitial?: string;
  avatarHref: Href;
};

/**
 * The gradient "home screen" header — greeting, a notification bell with an
 * unread badge, and an avatar — used by both dashboards' tab-root screen
 * (student `(student)/index.tsx`, parent `(parent)/dashboard/index.tsx`).
 * This is the "Dashboard" header variant from the original design-system
 * plan; kept as its own component rather than a branch inside `AppHeader`
 * since the two are structurally quite different (a tall gradient banner
 * that scrolls with the page vs. `AppHeader`'s slim fixed bar) — see
 * docs/PRODUCT_DECISIONS.md.
 *
 * Meant to sit as the first child inside the screen's `ScrollView` (it
 * scrolls with the page; the body below it overlaps it via a negative
 * `marginTop`, unchanged from how the student dashboard always did this),
 * not inside `AppScreen`'s fixed-header slot.
 *
 * Owns the top safe-area inset itself (padding, not `SafeAreaView`) so its
 * blue background extends up behind the status bar instead of leaving a
 * gap in the screen's default background above it — the enclosing screen's
 * `SafeAreaView`/`AppScreen` must therefore exclude the `top` edge. Also
 * sets the status bar to light content while focused, since dark icons
 * are unreadable on this blue background; other screens (via `AppHeader`)
 * are unaffected and keep the default style.
 *
 * Includes a "Search anything…" row — decorative only (NEMIS has no search
 * endpoint to back it yet), matching the same non-interactive treatment
 * used elsewhere for UI that doesn't have a real backend behind it yet.
 */
export function DashboardHeader({
  greeting,
  subtitle,
  unreadCount,
  notificationsHref,
  avatarUrl,
  avatarInitial,
  avatarHref,
}: DashboardHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <StatusBar style="light" />
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <ThemedText type="title" style={styles.headerGreeting}>
            {greeting}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>{subtitle}</ThemedText>
        </View>

        <View style={styles.headerActions}>
          <Link
            href={notificationsHref}
            style={styles.headerIconButton}
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'
            }
          >
            <Icon
              name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
              color="#FFFFFF"
            />
            {!!unreadCount && (
              <View style={styles.headerBadge}>
                <ThemedText style={styles.headerBadgeText}>{unreadCount}</ThemedText>
              </View>
            )}
          </Link>

          <Link
            href={avatarHref}
            style={styles.headerAvatar}
            accessibilityRole="button"
            accessibilityLabel="Account"
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.headerAvatarImage}
                contentFit="cover"
              />
            ) : (
              <ThemedText style={styles.headerAvatarInitial}>{avatarInitial}</ThemedText>
            )}
          </Link>
        </View>
      </View>

      <View style={styles.searchBar} accessible={false}>
        <Icon
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size="sm"
          color="#DCEAF3"
        />
        <ThemedText type="small" style={styles.searchPlaceholder}>
          Search anything...
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: Palette.secondary,
    paddingHorizontal: 20,
    paddingBottom: 38,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGreeting: {
    color: '#FFFFFF',
  },
  headerSubtitle: {
    color: '#E6F4FA',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#C10021',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  headerAvatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginTop: 16,
  },
  searchPlaceholder: {
    color: '#DCEAF3',
  },
});
