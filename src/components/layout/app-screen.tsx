import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View as RNView,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth } from '@/theme';
import { View } from '@/tw';

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
  /** `SafeAreaView` edges — defaults to `['top', 'left', 'right']`
   * (excludes `bottom`). Every screen using `AppScreen` sits under the
   * `(student)`/`(parent)` `Tabs` navigators, whose tab bar isn't
   * `position: 'absolute'` — it already reserves real layout space above
   * itself (including the bottom safe-area inset), so a screen adding its
   * own `bottom` edge on top of that double-reserves the same space.
   * Pass an explicit `edges` (including `bottom`) for the rare screen that
   * genuinely isn't under a tab bar. */
  edges?: readonly Edge[];
  /** Applied to the scrollable/static content container. Default matches
   * the app's established list-screen padding (`px-4 pt-4`); pass `""` when
   * the content already handles its own padding (e.g. wrapping an existing
   * `QueryState`+`ScrollView` pair with `scroll={false}`). */
  contentClassName?: string;
  /** Reserves extra bottom space sized for the bottom tab bar
   * (`BottomTabInset` from `src/theme`), on top of whatever `edges`
   * already reserves. Default `false` — same reasoning as `edges` above:
   * this app's tab bar isn't floating, so `Tabs` already lays every
   * screen out entirely above it; this was only ever needed for a
   * floating/overlay tab bar. Set `true` only if this app ever adopts one. */
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
  edges = ['top', 'left', 'right'],
  contentClassName = 'px-4 pt-4',
  tabBarInset = false,
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
    // Plain React Native `ScrollView`, not `@/tw`'s — its css-interop mapping
    // has two config entries (`className`→`style` and
    // `contentContainerClassName`→`contentContainerStyle`), and the second
    // silently discards the `style` resolved from the first, so a `className`
    // meant to set `flex: 1` here never actually applies and the ScrollView
    // collapses to zero height. `contentClassName` is applied to a plain
    // `@/tw` `View` (single-config, unaffected) inside instead.
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: bottomInset, alignItems: 'center' }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      <View className={contentClassName} style={{ width: '100%', alignItems: 'center' }}>
        {widthCapped}
      </View>
    </ScrollView>
  ) : (
    // Plain RN `View` for the flex-sizing container, not `@/tw`'s — see
    // above. `contentClassName` is applied to a nested `@/tw` `View`
    // (non-flex-critical, just padding/gap) instead.
    <RNView style={{ flex: 1, paddingBottom: bottomInset, alignItems: 'center' }}>
      <View className={contentClassName} style={{ width: '100%', flex: 1, alignItems: 'center' }}>
        {widthCapped}
      </View>
    </RNView>
  );

  return (
    // `react-native-safe-area-context`'s `SafeAreaView` is not one of the
    // components NativeWind/`react-native-css` auto-registers for
    // `className` support — their component registry only re-exports
    // `react-native`'s own built-in `SafeAreaView`, not this package's (see
    // `node_modules/react-native-css/dist/commonjs/components/index.cjs`)
    // — and this project's `metro.config.js` sets
    // `globalClassNamePolyfill: false`, which disables the fallback that
    // would otherwise cover an unregistered/third-party component like it.
    // `className="flex-1"` here was therefore silently inert: this
    // `SafeAreaView`, the root of the whole screen tree, never got real
    // `flex: 1`, so every `flex: 1` descendant — down to a `scroll={true}`
    // screen's `ScrollView` — had no bounded height to resolve against and
    // collapsed to zero visible height, while natural/fixed-size siblings
    // (e.g. a header) still rendered, producing a screen that's blank below
    // whatever doesn't need flex to size itself. Root-caused via on-device
    // isolation testing on the Academics hub (single-variable A/B: swapping
    // this one prop from `className` to `style` was the entire fix) —
    // do not revert to `className` here. Consumer `className` is applied to
    // the inner `@/tw` `View` below instead, which does support it, with
    // its own explicit `flex: 1` so the layout never again depends on
    // `className` resolving correctly for the flex contract itself.
    <SafeAreaView style={{ flex: 1 }} edges={edges}>
      <View className={className} style={{ flex: 1 }}>
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
      </View>
    </SafeAreaView>
  );
}
