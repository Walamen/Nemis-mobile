import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const DURATION = 600;

// Wave divider approximated with a plain View (no react-native-svg in this
// project yet): a circle wide enough to span the screen, whose center sits
// on the flat white block's top edge, so only its bottom arc shows as a
// gentle curve. Swap for an SVG path if a more precise wave shape is needed.
const WAVE_DIAMETER = SCREEN_WIDTH * 1.4;
const WHITE_BLOCK_HEIGHT = SCREEN_HEIGHT * 0.34;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  const content = (
    <>
      <Image
        style={StyleSheet.absoluteFill}
        source={require('@/assets/images/splash-screen.jpg')}
        contentFit="cover"
      />
      <Image
        style={styles.brandIcon}
        source={require('@/assets/images/icon.svg')}
        contentFit="contain"
      />
      <View style={styles.waveCurve} />
      <View style={styles.whiteBlock}>
        <Text style={styles.brandTitle}>Nemis Parent & Student</Text>
      </View>
    </>
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}
    >
      {content}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  brandIcon: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.3 - 48,
    left: (SCREEN_WIDTH - 96) / 2,
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  waveCurve: {
    position: 'absolute',
    top: SCREEN_HEIGHT - WHITE_BLOCK_HEIGHT - WAVE_DIAMETER / 8,
    left: (SCREEN_WIDTH - WAVE_DIAMETER) / 2,
    width: WAVE_DIAMETER,
    height: WAVE_DIAMETER,
    borderRadius: WAVE_DIAMETER / 2,
    backgroundColor: '#FFFFFF',
  },
  whiteBlock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: WHITE_BLOCK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  brandTitle: {
    color: '#262262',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
