import { createContext, useContext, useRef, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthHeader } from '@/components/auth/auth-header';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

/** Breathing room (px) between a focused field and the keyboard's top edge
 * once scrolled into view — a fixed visual gap, not a keyboard-size guess. */
const FOCUSED_FIELD_OFFSET = 16;

/** Whatever a TextInput focus event's `target` carries (a numeric tag on
 * the legacy architecture, a host-component instance under Fabric) —
 * derived from the event type itself rather than an internal RN type
 * export, since `scrollResponderScrollNativeHandleToKeyboard` accepts
 * either. */
type FocusEventTarget = NonNullable<
  Parameters<NonNullable<TextInputProps['onFocus']>>[0]
>['target'];

type ScrollFieldIntoView = (nodeHandle: FocusEventTarget) => void;

const AuthScrollContext = createContext<ScrollFieldIntoView | null>(null);

/**
 * Lets a field inside `AuthScreenShell` (see `AuthTextField`) ask the
 * shell's `ScrollView` to bring itself above the keyboard on focus.
 * `KeyboardAvoidingView` only shrinks the viewport to make room for the
 * keyboard — it doesn't scroll an already-rendered field into that shrunk
 * viewport, so a field further down the form (e.g. Password) can still end
 * up hidden behind the keyboard. This calls RN `ScrollView`'s own
 * `scrollResponderScrollNativeHandleToKeyboard`, whose source explicitly
 * documents it as "the callback to onFocus in a TextInput's parent view" —
 * i.e. this is the built-in, intended mechanism for this, not a custom
 * workaround.
 */
export function useAuthFieldFocusScroll(): ScrollFieldIntoView | null {
  return useContext(AuthScrollContext);
}

/** Wave-header shell shared by the (auth) screens: header, keyboard avoidance, scroll. */
export function AuthScreenShell({ children }: { children: ReactNode }) {
  const scrollRef = useRef<ScrollView>(null);
  // Android only — see `useKeyboardHeight` for why `KeyboardAvoidingView`
  // itself doesn't work here (it, like this hook's alternative would if it
  // used position instead of height, depends on a `screenY` value that
  // Android under edge-to-edge no longer reports accurately). 0 on iOS,
  // where `KeyboardAvoidingView` already works correctly, so it's unused
  // there (see the `Platform.OS === 'ios'` branch below).
  const androidKeyboardHeight = useKeyboardHeight();

  const scrollFieldIntoView: ScrollFieldIntoView = (nodeHandle) => {
    // Android: skip. This depends on the same unreliable `screenY` as
    // `KeyboardAvoidingView` (see `useKeyboardHeight`'s doc comment) —
    // confirmed on-device it overshoots and scrolls the form up past its
    // own top edge instead of just bringing the focused field into view.
    // The `paddingBottom` shrink below is enough on its own to keep every
    // field reachable by a manual scroll.
    if (Platform.OS === 'android') return;
    scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
      nodeHandle,
      FOCUSED_FIELD_OFFSET,
      true,
    );
  };

  const scrollableForm = (
    <ScrollView
      ref={scrollRef}
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <AuthScrollContext.Provider value={scrollFieldIntoView}>
        {children}
      </AuthScrollContext.Provider>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <AuthHeader />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView style={styles.flex} behavior="padding">
            {scrollableForm}
          </KeyboardAvoidingView>
        ) : (
          // Plain `View` + real keyboard height as bottom padding, not
          // `KeyboardAvoidingView` — see `useKeyboardHeight`'s doc comment
          // for why that (and, previously, the `behavior: undefined`
          // "adjustResize handles it" assumption) both do nothing on
          // Android under this app's edge-to-edge config: confirmed
          // on-device that neither shifted the form at all.
          <View style={[styles.flex, { paddingBottom: androidKeyboardHeight }]}>
            {scrollableForm}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 4,
  },
});
