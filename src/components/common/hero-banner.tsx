import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/typography/themed-text';

export type HeroBannerProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

/**
 * Dark photo banner used at the top of the Home and Academics hub screens
 * (both roles) — real title/subtitle text over a background photo. Renders
 * edge-to-edge full width via a negative horizontal margin that breaks out
 * of the screen's standard 16px side padding (see `styles.container`), the
 * same width as `DashboardHeader` — safe to drop straight into any of
 * those screens' existing padded layout without extra wrapper markup. The
 * source image is a placeholder (`assets/images/splash-screen.jpg`, the
 * app's existing splash asset, reused rather than shipping unlicensed
 * stock photography) — swap `IMAGE_SOURCE` for real campus photography
 * whenever that's available. See docs/PRODUCT_DECISIONS.md.
 */
const IMAGE_SOURCE = require('@/assets/images/hero-1.jpg');

export function HeroBanner({ title, subtitle, className }: HeroBannerProps) {
  return (
    <View className={className} style={styles.container}>
      <Image source={IMAGE_SOURCE} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText type="small" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 150,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    // Breaks out of the screen's standard 16px horizontal padding so the
    // banner spans edge-to-edge, same width as `DashboardHeader` — every
    // screen this is used on has exactly 16px of ambient side padding
    // (`px-4` / `paddingHorizontal: 16`).
    marginHorizontal: -16,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,14,33,0.55)',
  },
  content: {
    padding: 18,
    gap: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: '#E6F4FA',
    fontSize: 9,
    lineHeight: 19,
  },
});
