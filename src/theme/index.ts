/**
 * Design system tokens: Colors, Typography, Spacing, Radius, Fonts.
 * Icons live in `@/components/common/icon`; Shadows are applied via Tailwind's
 * `shadow-*` utility classes (react-native-css compiles `box-shadow` to native
 * shadow/elevation props, so no separate JS shadow tokens are needed).
 *
 * `Palette` and the pixel values in `Typography`/`Radius` mirror the `@theme`
 * block in `@/global.css` 1:1. Tailwind v4's CSS custom properties aren't
 * readable from JS at runtime, so anywhere that needs a raw color/number
 * (e.g. `ActivityIndicator`'s `color` prop, `Icon`'s `tintColor`) reads from
 * here instead of a Tailwind class. Keep the two in sync when either changes.
 */

import '@/global.css';

import { Platform, type TextStyle } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** SIS portal brand palette. Keep in sync with the `@theme` block in `@/global.css`. */
export const Palette = {
  primary: '#000e21',
  primary50: '#e6ebf0',
  primary100: '#b3c2cc',
  primary200: '#8099a8',
  primary300: '#4d7085',
  primary400: '#26556a',
  primary500: '#000e21',
  primary600: '#000c1d',
  primary700: '#000a19',
  primary800: '#000815',
  primary900: '#000611',

  secondary: '#121894',
  secondary50: '#e6f4fa',
  secondary100: '#b3d9ed',
  secondary200: '#80bfe0',
  secondary300: '#4da5d3',
  secondary400: '#268fc8',
  secondary500: '#121894',
  secondary600: '#025a8c',
  secondary700: '#024d78',
  secondary800: '#013f64',
  secondary900: '#013250',

  accent: '#1874a8',
  accent50: '#e8f3f9',
  accent100: '#c6e0ef',
  accent200: '#a3cde5',
  accent300: '#80b9db',
  accent400: '#5ea8d2',
  accent500: '#1874a8',
  accent600: '#156896',
  accent700: '#125a82',
  accent800: '#0f4c6e',
  accent900: '#0c3e5a',

  neutralDark: '#000000',
  neutralLight: '#e3e3e5',

  border: '#e3e3e5',
  success: '#065808',
  active: '#146316',
  pending: '#a6731c',
  warning: '#a6731c',
  error: '#d60416',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * Display serif used for the app's most prominent headings (dashboard
 * greetings, section headings) — bundled via `@expo-google-fonts/crete-round`
 * and loaded in the root layout's `useFonts`. Only a 400 (regular) cut is
 * published for this family, so headings that use it render at regular
 * weight regardless of `fontWeight` — matches the source design, which
 * never bolds it either.
 */
export const DisplayFontFamily = 'CreteRound_400Regular';

/**
 * Text scale. Matches the SIS portal's h1-h4/body/small/button tokens
 * (also mirrored as `--text-*` in `@/global.css` for Tailwind classes).
 * `link`/`linkPrimary`/`code` are app-specific additions on top of that scale.
 */
export const Typography = {
  h1: {
    fontSize: 42,
    lineHeight: 42 * 1.2,
    fontWeight: '700',
    fontFamily: DisplayFontFamily,
  } satisfies TextStyle,
  h2: { fontSize: 32, lineHeight: 32 * 1.3, fontWeight: '600' } satisfies TextStyle,
  h3: {
    fontSize: 24,
    lineHeight: 24 * 1.4,
    fontWeight: '600',
    fontFamily: DisplayFontFamily,
  } satisfies TextStyle,
  h4: { fontSize: 20, lineHeight: 20 * 1.4, fontWeight: '600' } satisfies TextStyle,
  body: { fontSize: 16, lineHeight: 16 * 1.6, fontWeight: '400' } satisfies TextStyle,
  small: { fontSize: 14, lineHeight: 14 * 1.5, fontWeight: '400' } satisfies TextStyle,
  smallBold: { fontSize: 14, lineHeight: 14 * 1.5, fontWeight: '700' } satisfies TextStyle,
  button: { fontSize: 15, lineHeight: 15 * 1.5, fontWeight: '500' } satisfies TextStyle,
  link: { fontSize: 14, lineHeight: 30 } satisfies TextStyle,
  linkPrimary: { fontSize: 14, lineHeight: 30, color: Palette.secondary } satisfies TextStyle,
  code: {
    fontFamily: Fonts?.mono,
    fontWeight: Platform.select({ android: '700' as const }) ?? '500',
    fontSize: 12,
  } satisfies TextStyle,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Matches the `--radius-*` tokens in `@/global.css` (used by the `rounded-*` Tailwind classes). */
export const Radius = {
  input: 12,
  card: 16,
  button: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Shared card/stat-box surface across the Student app (Quick Stats, Quick
 * Actions, "My record", Announcements, Recent Grades on Home; every
 * `HubCard`/`SubjectCard`/`GradeCard`/etc. elsewhere) — one consistent gray
 * instead of each screen picking its own. Deliberately a flat constant, not
 * part of the light/dark `Colors` pair — matches how the Home screen has
 * always used it (not theme-aware). Card components that are also used by
 * the Parent app expose this via an optional `backgroundColor` prop rather
 * than adopting it as their own default, so Parent screens are unaffected;
 * only Student call sites pass it explicitly.
 */
export const CardBackgroundColor = '#DEDCDC';
