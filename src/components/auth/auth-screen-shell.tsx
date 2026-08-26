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
 * `KeyboardAvoidingView`/Android's `adjustResize` only shrink the viewport
 * to make room for the keyboard — neither scrolls an already-rendered field
 * into that shrunk viewport, so a field further down the form (e.g.
 * Password) can still end up hidden behind the keyboard. This calls RN
 * `ScrollView`'s own `scrollResponderScrollNativeHandleToKeyboard`, whose
 * source explicitly documents it as "the callback to onFocus in a
 * TextInput's parent view" — i.e. this is the built-in, intended mechanism
 * for this, not a custom workaround.
 */
export function useAuthFieldFocusScroll(): ScrollFieldIntoView | null {
  return useContext(AuthScrollContext);
}

/** Wave-header shell shared by the (auth) screens: header, keyboard avoidance, scroll. */
export function AuthScreenShell({ children }: { children: ReactNode }) {
  const scrollRef = useRef<ScrollView>(null);

  const scrollFieldIntoView: ScrollFieldIntoView = (nodeHandle) => {
    scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
      nodeHandle,
      FOCUSED_FIELD_OFFSET,
      true,
    );
  };

  return (
    <View style={styles.container}>
      <AuthHeader />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
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
        </KeyboardAvoidingView>
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
