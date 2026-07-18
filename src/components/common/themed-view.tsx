import { View, type ViewProps } from 'react-native';
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

  return useCssElement(
    View,
    { style: [{ backgroundColor: theme[type ?? 'background'] }, style], className, ...otherProps },
    { className: 'style' },
  );
}
