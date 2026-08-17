import { StyleSheet, Text, View } from 'react-native';

import { DisplayFontFamily, Palette } from '@/theme';

export function AuthHeading({ title }: { title: string }) {
  return (
    <>
      <Text style={styles.heading}>{title}</Text>
      <View style={styles.underline} />
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 30,
    fontFamily: DisplayFontFamily,
    color: '#101828',
  },
  underline: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.secondary,
    marginTop: 8,
    marginBottom: 24,
  },
});
