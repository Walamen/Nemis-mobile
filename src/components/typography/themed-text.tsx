import { StyleSheet, Text, type TextProps } from 'react-native';
import { useCssElement } from 'react-native-css';

import { ThemeColor, Typography } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  className?: string;
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'sectionHeading'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

const TYPE_STYLES = {
  default: Typography.body,
  title: Typography.h1,
  small: Typography.small,
  smallBold: Typography.smallBold,
  subtitle: Typography.h2,
  sectionHeading: Typography.h3,
  link: Typography.link,
  linkPrimary: Typography.linkPrimary,
  code: Typography.code,
} as const;

export function ThemedText({
  style,
  className,
  type = 'default',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  // Flattened to a single object, not an array — keeps this on the same simple
  // merge path react-native-css takes for plain inline styles.
  const flatStyle = StyleSheet.flatten([
    { color: theme[themeColor ?? 'text'] },
    TYPE_STYLES[type],
    style,
  ]);

  return useCssElement(
    Text,
    {
      style: flatStyle,
      className,
      ...rest,
    },
    { className: 'style' },
  );
}
