import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type IconSize = 'sm' | 'md' | 'lg';

const ICON_SIZES: Record<IconSize, number> = {
  sm: 14,
  md: 20,
  lg: 28,
};

export type IconProps = {
  name: SymbolViewProps['name'];
  /** One of the standard sizes, or a raw pixel number for the rare spot
   * that needs something in between (e.g. a hair larger than `md`). */
  size?: IconSize | number;
  color?: ColorValue;
  weight?: SymbolViewProps['weight'];
  style?: SymbolViewProps['style'];
};

export function Icon({ name, size = 'md', color, weight, style }: IconProps) {
  const theme = useTheme();

  return (
    <SymbolView
      name={name}
      size={typeof size === 'number' ? size : ICON_SIZES[size]}
      tintColor={color ?? theme.text}
      weight={weight}
      style={style}
    />
  );
}
