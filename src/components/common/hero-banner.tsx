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
 * (both roles) — real title/subtitle text over a background photo. The
 * source image is a placeholder (`assets/images/splash-screen.jpg`, the
 * app's existing splash asset, reused rather than shipping unlicensed
 * stock photography) — swap `IMAGE_SOURCE` for real campus photography
 * whenever that's available. See docs/PRODUCT_DECISIONS.md.
 */
const IMAGE_SOURCE = require('@/assets/images/splash-screen.jpg');

export function HeroBanner({ title, subtitle, className }: HeroBannerProps) {
  return (
    <View className={`overflow-hidden rounded-card ${className ?? ''}`} style={styles.container}>
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
    minHeight: 110,
    justifyContent: 'flex-end',
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
  },
  subtitle: {
    color: '#E6F4FA',
    lineHeight: 19,
  },
});
