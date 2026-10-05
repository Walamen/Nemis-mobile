import { Redirect, type Href } from 'expo-router';

/**
 * Backing route for the "Menu" tab — never actually shown. The tab's
 * `tabBarButton` (see `(parent)/_layout.tsx`) opens the Menu sheet instead;
 * this only exists so `Tabs.Screen name="menu"` resolves, and as a fallback
 * if the route is ever reached another way (e.g. a stale deep link).
 */
export default function MenuFallbackScreen() {
  return <Redirect href={'/dashboard' as Href} />;
}
