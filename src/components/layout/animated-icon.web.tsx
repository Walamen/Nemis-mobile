// Web has no native splash screen to hand off from (unlike iOS/Android's
// `expo-splash-screen`), so there's nothing for this overlay to do here —
// `AnimatedSplashOverlay` is only meaningful on native, but every platform
// needs the same export since `app/_layout.tsx` imports it unconditionally.
export function AnimatedSplashOverlay() {
  return null;
}
