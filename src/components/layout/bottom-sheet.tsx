import { useEffect, useState, type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/theme';
import { Pressable, View } from '@/tw';

const ANIMATION_MS = 250;
/** Drag distance (px) or flick velocity (px/s) past which a release is
 * treated as "dismiss" rather than "snap back open". */
const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 800;

export type BottomSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}>;

/**
 * Bottom sheet: slides up over a dimming backdrop; dismissible by tapping
 * the backdrop, the close button, the Android back button, or dragging the
 * handle down (far or fast enough). Fully controlled — `visible`/`onClose`
 * are the single source of truth; this component only owns the animation
 * and an `isMounted` flag so it can animate out before unmounting.
 *
 * Built directly on `react-native-reanimated` + `react-native-gesture-handler`
 * (no bottom-sheet library is installed) — same "raw reanimated, `style`
 * not `className`" approach as `Skeleton`. Only the handle/title row is
 * wrapped in `GestureDetector`, not the whole body, so a scrollable or
 * interactive body (e.g. a form) isn't fought over by two gesture
 * recognizers. `Modal` renders in a separate native root that the app's
 * top-level `GestureHandlerRootView` (`src/app/_layout.tsx`) doesn't cover,
 * so this nests its own — required for the drag gesture to work here.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  className = '',
}: BottomSheetProps) {
  const theme = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useSharedValue(screenHeight);
  const [isMounted, setIsMounted] = useState(visible);

  // Synchronizes mount lifecycle + the shared-value-driven slide animation
  // with the `visible` prop — an external-system side effect (animation),
  // exactly the case React's own docs carve out as a legitimate effect (see
  // "Triggering an animation" at https://react.dev/learn/you-might-not-need-an-effect),
  // not a derived-state case. `translateY` is a reanimated shared value — a
  // stable ref mutated from here, `.onUpdate`, and `.onEnd` alike, not React
  // state — so the newer react-hooks compiler rules below don't apply to it
  // the way they do to real component state; disabled with that reasoning,
  // not blindly.
  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mounting is coupled to the animation start, see comment above
      setIsMounted(true);
      translateY.value = withTiming(0, { duration: ANIMATION_MS });
    } else if (isMounted) {
      translateY.value = withTiming(screenHeight, { duration: ANIMATION_MS }, (finished) => {
        if (finished) runOnJS(setIsMounted)(false);
      });
    }
  }, [visible, isMounted, translateY, screenHeight]);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        // eslint-disable-next-line react-hooks/immutability -- reanimated shared value, not React state; see comment above the effect
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        runOnJS(onClose)();
      } else {
        // eslint-disable-next-line react-hooks/immutability -- reanimated shared value, not React state; see comment above the effect
        translateY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isMounted) return null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onPress={onClose}
        />
        <Animated.View
          style={[
            { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '90%' },
            sheetStyle,
          ]}
        >
          <SafeAreaView
            edges={['bottom']}
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: Radius.card,
              borderTopRightRadius: Radius.card,
            }}
          >
            {/* 'padding' on both platforms — see `AuthScreenShell` for why
                Android can't rely on `behavior: undefined` under edge-to-edge. */}
            <KeyboardAvoidingView behavior="padding">
              <GestureDetector gesture={pan}>
                <View className="items-center gap-2 pb-2 pt-3">
                  <View
                    className="h-1 w-10 rounded-full"
                    style={{ backgroundColor: theme.backgroundSelected }}
                  />
                  {title && (
                    <View className="w-full flex-row items-center justify-between px-4">
                      <ThemedText type="sectionHeading">{title}</ThemedText>
                      <Pressable
                        onPress={onClose}
                        hitSlop={16}
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                      >
                        <Icon name={{ ios: 'xmark', android: 'close', web: 'close' }} size="sm" />
                      </Pressable>
                    </View>
                  )}
                </View>
              </GestureDetector>
              <View className={`px-4 pb-6 ${className}`}>{children}</View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
