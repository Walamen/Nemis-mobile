/**
 * `rgba(...)` from a `#rrggbb` hex + alpha. `react-native-css` doesn't
 * reliably resolve Tailwind's `bg-color/opacity` modifier for custom
 * `@theme` colors, so tinted backgrounds are built by hand — matching how
 * the rest of the app already handles translucent color (see the dashboard
 * header's hardcoded `rgba(255,255,255,0.15)` icon buttons).
 */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
