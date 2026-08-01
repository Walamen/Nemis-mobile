import { StyleSheet, View, type ViewProps } from 'react-native';
import { useCssElement } from 'react-native-css';

import { ThemeColor } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  className?: string;
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({
  style,
  className,
  lightColor,
  darkColor,
  type,
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();
  // Flattened to a single object, not an array — keeps this on the same simple
  // merge path react-native-css takes for plain inline styles.
  const flatStyle = StyleSheet.flatten([{ backgroundColor: theme[type ?? 'background'] }, style]);

  return useCssElement(
    View,
    { style: flatStyle, className, ...otherProps },
    { className: 'style' },
  );
}
