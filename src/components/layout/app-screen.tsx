import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth } from '@/theme';
import { ScrollView, View } from '@/tw';

export type AppScreenProps = PropsWithChildren<{
  /** Wrap content in a scrollable container (default `true`). Set `false`
   * for screens that manage their own scroll container internally (e.g. one
   * that nests `QueryState` around its own `ScrollView` — see
   * docs/UI_PATTERNS.md for why those can't just be handed to `AppScreen`
   * directly) or that never need to scroll. */
  scroll?: boolean;
  /** Wrap in `KeyboardAvoidingView` (iOS `'padding'` behavior) — screens
   * with inputs near the bottom of the screen should set this. */
  keyboardAvoiding?: boolean;
  /** Pull-to-refresh — pass both, or neither. Only applies when `scroll`. */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** `SafeAreaView` edges — defaults to all edges. */
  edges?: readonly Edge[];
  /** Applied to the scrollable/static content container. Default matches
   * the app's established list-screen padding (`px-4 pt-4`); pass `""` when
   * the content already handles its own padding (e.g. wrapping an existing
   * `QueryState`+`ScrollView` pair with `scroll={false}`). */
  contentClassName?: string;
  /** Reserves bottom space sized for the bottom tab bar (`BottomTabInset`
   * from `src/theme`) so content doesn't end up hidden behind it — every
   * screen nested under the `(student)`/`(parent)` tab navigators wants
   * this (default `true`); screens that aren't under a tab bar can set
   * `false`. */
  tabBarInset?: boolean;
  /** Applied to the outer `SafeAreaView`. */
  className?: string;
}>;

/**
 * Standard screen shell: safe area + optional scroll/pull-to-refresh +
 * optional keyboard avoidance + consistent content padding + tab-bar-aware
 * bottom spacing. Consolidates the `<SafeAreaView><ScrollView style={{...}}>`
 * boilerplate duplicated across `src/app/**` screens — see
 * docs/UI_PATTERNS.md for the shapes this replaces and the ones it
 * deliberately doesn't (QueryState-owned scroll containers).
 */
export function AppScreen({
  children,
  scroll = true,
  keyboardAvoiding = false,
  refreshing,
  onRefresh,
  edges,
  contentClassName = 'px-4 pt-4',
  tabBarInset = true,
  className = '',
}: AppScreenProps) {
  const bottomInset = tabBarInset ? BottomTabInset : 0;
  // Caps content at MaxContentWidth and centers it — a no-op on any phone
  // (screens are always narrower than this), so this is purely additive for
  // tablets/large screens. `flex: 1` on the wrapper keeps height propagating
  // to `scroll={false}` children (e.g. QueryState/ScrollView) exactly as
  // before; only the width behavior is new.
  const widthCapped = (
    <View style={{ flex: 1, width: '100%', maxWidth: MaxContentWidth }}>{children}</View>
  );

  const content = scroll ? (
    <ScrollView
      className={`flex-1 ${contentClassName}`}
      contentContainerStyle={{ paddingBottom: bottomInset, alignItems: 'center' }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      {widthCapped}
    </ScrollView>
  ) : (
    <View
      className={`flex-1 ${contentClassName}`}
      style={{ paddingBottom: bottomInset, alignItems: 'center' }}
    >
      {widthCapped}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${className}`} edges={edges}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
