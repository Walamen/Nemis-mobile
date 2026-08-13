import { useEffect, useState, type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal as RNModal, Platform } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/theme';
import { Pressable, View } from '@/tw';

const ANIMATION_MS = 200;

export type ModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}>;

/**
 * Centered dialog over a dimming backdrop — for confirmations and short
 * forms, as opposed to `BottomSheet`'s slide-up sheet. Fade + scale via
 * `react-native-reanimated` (same "raw reanimated, `style` not `className`"
 * approach as `Skeleton`/`BottomSheet`); no gesture-handler dependency,
 * since dialogs aren't conventionally swipe-dismissible the way sheets are.
 * Fully controlled — `visible`/`onClose` are the single source of truth;
 * see `BottomSheet`'s doc comment for why the mount-lifecycle effect here
 * is written the way it is (including the two targeted `eslint-disable`s).
 */
export function Modal({ visible, onClose, title, children, className = '' }: ModalProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const [isMounted, setIsMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mounting is coupled to the animation start, see BottomSheet's comment for the same pattern
      setIsMounted(true);
      opacity.value = withTiming(1, { duration: ANIMATION_MS });
      scale.value = withTiming(1, { duration: ANIMATION_MS });
    } else if (isMounted) {
      opacity.value = withTiming(0, { duration: ANIMATION_MS }, (finished) => {
        if (finished) runOnJS(setIsMounted)(false);
      });
      scale.value = withTiming(0.95, { duration: ANIMATION_MS });
    }
  }, [visible, isMounted, opacity, scale]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!isMounted) return null;

  return (
    <RNModal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Animated.View
          style={[
            {
              width: '100%',
              maxWidth: 400,
              gap: 12,
              borderRadius: Radius.card,
              backgroundColor: theme.background,
              padding: 20,
            },
            cardStyle,
          ]}
        >
          {title && (
            <View className="flex-row items-center justify-between">
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
          <View className={className}>{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
