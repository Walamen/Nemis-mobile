import { useIsFocused } from 'expo-router';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';

/**
 * A `StatusBar` that only applies while its screen is focused.
 *
 * Tab screens stay mounted after you leave them, and React Native keeps a
 * stack of every mounted `StatusBar` (the most recently rendered wins). An
 * always-mounted `<StatusBar style="light" />` on a dashboard therefore lost
 * to whatever screen was opened next and was never re-applied on returning —
 * leaving dark icons over the blue dashboard header. Rendering only while
 * focused re-pushes the right style every time the screen comes back.
 */
export function FocusAwareStatusBar({ style }: { style: StatusBarStyle }) {
  const isFocused = useIsFocused();
  return isFocused ? <StatusBar style={style} /> : null;
}
