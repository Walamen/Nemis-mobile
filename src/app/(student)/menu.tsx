import { Redirect } from 'expo-router';

/**
 * Backing route for the "Menu" tab — never actually shown. The tab's
 * `tabBarButton` (see `(student)/_layout.tsx`) intercepts every press and
 * opens the Menu bottom sheet instead of navigating here; this only
 * exists so `Tabs.Screen name="menu"` has a real file to resolve, and as
 * a defensive fallback if this route is ever reached another way (e.g. a
 * stale deep link).
 */
export default function MenuFallbackScreen() {
  return <Redirect href="/" />;
}
