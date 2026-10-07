import { StyleSheet, Text } from 'react-native';

import { DisplayFontFamily } from '@/theme';

/** Title + one-line subtitle at the top of every (auth) screen's form. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <Text style={styles.heading} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontFamily: DisplayFontFamily,
    color: '#101828',
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    marginTop: 2,
    marginBottom: 20,
  },
});
