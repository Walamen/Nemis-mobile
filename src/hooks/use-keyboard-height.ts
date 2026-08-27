import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * Live keyboard height in dp (0 when hidden), tracked directly from
 * `Keyboard`'s own `keyboardDidShow`/`keyboardDidHide` events rather than
 * through `KeyboardAvoidingView`'s built-in position math.
 *
 * Why: on Android, RN's native keyboard-event emitter (`ReactRootView.java`)
 * reports an accurate *height* — read straight from
 * `WindowInsetsCompat.Type.ime()` — but derives the event's `screenY`
 * (where the keyboard starts) from the older `getWindowVisibleDisplayFrame`
 * API, which does not reliably shrink once edge-to-edge is enabled (this
 * app's default — see `android/gradle.properties`). Both
 * `KeyboardAvoidingView` and `ScrollView`'s
 * `scrollResponderScrollNativeHandleToKeyboard` compute how much to shift
 * content from that `screenY`, so under edge-to-edge that math can come out
 * to ~0 even while the keyboard is genuinely covering the form — matching
 * what was observed on-device (no visible shift at all). Reading just the
 * height sidesteps the unreliable half of the event entirely.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      setHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return height;
}
