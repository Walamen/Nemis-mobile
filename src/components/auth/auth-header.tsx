import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/typography/themed-text';
import { Palette } from '@/theme';

const HEADER_HEIGHT_RATIO = 0.4;
const WAVE_WIDTH_RATIO = 1;

/**
 * Shared wave-divided header for the (auth) screens (login, reset password):
 * the brand image on top — darkened, with the app's seal badge and
 * wordmark centered on it — curving into the white form below. The curve
 * is a plain View (no react-native-svg in this project) — a circle wide
 * enough to span the screen, centered on the header's bottom edge, so only
 * its arc shows.
 */
export function AuthHeader() {
  const { width, height } = useWindowDimensions();
  const headerHeight = height * HEADER_HEIGHT_RATIO;
  const waveDiameter = width * WAVE_WIDTH_RATIO;

  return (
    <>
      <View style={{ height: headerHeight }}>
        <Image
          style={StyleSheet.absoluteFill}
          source={require('@/assets/images/splash-screen.jpg')}
          contentFit="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.brand}>
          <View style={styles.seal}>
            <Image
              style={styles.sealIcon}
              source={require('@/assets/images/icon.png')}
              contentFit="contain"
            />
          </View>
          <ThemedText type="subtitle" style={styles.wordmark}>
            NEMIS
          </ThemedText>
          <ThemedText type="small" style={styles.tagline}>
            Student & Parent Portal
          </ThemedText>
        </View>
      </View>
      <View
        style={[
          styles.waveCurve,
          {
            top: headerHeight - waveDiameter / 8,
            left: (width - waveDiameter) / 2,
            width: waveDiameter,
            height: waveDiameter,
            borderRadius: waveDiameter / 7.2,
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,14,33,0.5)',
  },
  brand: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 60,
  },
  seal: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealIcon: {
    width: 76,
    height: 76,
  },
  wordmark: {
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    color: Palette.secondary50,
  },
  waveCurve: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
