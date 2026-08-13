# NEMIS Mobile — Project Blueprint

> Source of truth for what this app is, how it's structured, and how the pieces fit
> together. This document describes the codebase as it exists today; it is not a
> spec for a rewrite. See [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) for the
> rules that govern how new work gets added.

## 1. What this is

NEMIS Mobile is the React Native (Expo) companion to the existing NEMIS web
Student Information System (SIS). It gives two audiences native access to the
same backend the web dashboards already use:

- **Students** — dashboard, subjects, timetable, attendance, grades,
  assignments, resources, fees, messages, notifications, settings.
- **Parents** — dashboard, a child switcher, academics (assignments,
  attendance, report card, results), finance, communication, resources,
  profile/settings.

The parent module intentionally mirrors the student module's architecture and
UI patterns wherever the underlying data/permissions allow — see
[SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md).

## 2. Tech stack

| Concern | Choice |
|---|---|
| Framework | Expo (SDK 57) + Expo Router (file-based routing) |
| Language | TypeScript (strict) |
| State (client) | Redux Toolkit |
| State (server/cache) | RTK Query |
| Forms | React Hook Form + Zod |
| Styling | NativeWind v5 (Tailwind for React Native) + `react-native-css` |
| Secure storage | `expo-secure-store` |
| Icons | `expo-symbols` (`SymbolView`), wrapped by `Icon` |
| Animation | `react-native-reanimated` / `react-native-worklets` |

Package manifest: [package.json](../package.json). Always check the
[versioned Expo SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/) before
using any Expo API — the API surface has changed across SDKs.

## 3. Architectural layers

Strict separation is maintained between:

```
UI (screens, components)
   → hooks (use-auth, use-selected-child, use-theme, form hooks)
      → services (secure storage, token storage)
      → api (RTK Query slices)
         → backend (existing NEMIS API, not owned by this repo)
state (Redux store: auth session via RTK Query cache, selected-child slice)
```

Business logic does not live in screen components — it lives in hooks,
services, and API slices. Screens compose components and read
hooks/query-state.

## 4. Folder structure

```
src/
├── api/               RTK Query slices, one folder per domain
│   ├── api-slice.ts       base createApi (tagTypes, empty endpoints)
│   ├── fetch-base-query.ts  baseQuery + 401 refresh-and-retry logic
│   ├── auth/, attendance/, fees/, grades/, messages/, notifications/,
│   │   profile/, student/, tasks/, timetable/   (student-facing)
│   └── parent/         parent-facing endpoints (children, dashboard,
│                        academics, assignments, attendance, fees,
│                        messages, notifications, resources)
├── app/                Expo Router file-based routes (see below)
├── components/
│   ├── auth/           login/reset-password screen shell + fields
│   ├── buttons/        Button
│   ├── common/         Icon, ThemedView, MenuList, QueryState,
│   │                    ComingSoon, ChildSwitcher, Collapsible, etc.
│   ├── forms/          TextField
│   ├── layout/         AnimatedSplashOverlay (native + web variants)
│   ├── profile/        EditProfileForm, ChangePasswordForm
│   └── typography/     ThemedText
├── constants/          api.ts (API_BASE_URL)
├── features/           form schemas + form hooks (auth, profile)
├── hooks/               use-auth, use-selected-child, use-theme,
│                        use-color-scheme, use-app-dispatch/selector
├── services/            secure-storage.ts, auth-token-storage.ts
├── store/               Redux store, selected-child slice
├── theme/               design tokens (Colors, Palette, Typography,
│                        Spacing, Radius) — mirrors global.css `@theme`
├── tw/                  NativeWind-wrapped RN primitives (Text, View,
│                        Pressable, Link, Image, Animated…)
├── types/               shared TypeScript types per domain
├── utils/               api-error.ts
└── global.css           Tailwind v4 `@theme` block (source of truth
                          for design tokens on the CSS side)
```

## 5. Routing model

Expo Router file-based routing, gated by role using `Stack.Protected`
(`src/app/_layout.tsx`):

```
(auth)     — mounted when !isAuthenticated
(student)  — mounted when isAuthenticated && user.role === 'STUDENT'
(parent)   — mounted when isAuthenticated && user.role === 'PARENT'
```

Each group owns its own `/` route, so there's no collision. A `useEffect` in
`RootNavigator` explicitly redirects when the expected group changes (e.g.
after login), since `Stack.Protected` only controls which screens are
*registered*, not force-navigation away from an already-focused screen.

Full route inventory: [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md).

## 6. Authentication model

- Tokens (`accessToken`, `refreshToken`, `sid`) are issued by the backend in
  the response body (not relied on as httpOnly cookies, since React Native's
  `fetch` doesn't reliably persist cookies) and persisted via
  `expo-secure-store` (`src/services/auth-token-storage.ts`).
- `baseQueryWithReauth` (`src/api/fetch-base-query.ts`) attaches the bearer
  token to every request, and on a `401` (for any endpoint other than
  login/register/refresh/logout) transparently calls `/auth/refresh`,
  persists the new tokens, and retries the original request once. Concurrent
  401s share a single in-flight refresh via a module-level promise.
- `useAuth` (`src/hooks/use-auth.ts`) exposes `user`, `isAuthenticated`,
  `isCheckingSession`, `login`, `logout` on top of `authApi`.
- Session restoration is implicit: `useGetMeQuery()` runs on mount; while it
  resolves, `isCheckingSession` gates the root navigator behind a spinner.

Full endpoint inventory: [API_MAPPING.md](./API_MAPPING.md).

## 7. State management

- **Server state**: RTK Query exclusively (one `injectEndpoints` slice per
  domain, all built on the single `apiSlice` in `src/api/api-slice.ts`).
  No manual `fetch` calls outside of `fetch-base-query.ts` itself.
- **Client state**: a single `selected-child-slice` (`src/store/`) tracks
  which child a parent is currently viewing across screens. That's the only
  hand-rolled Redux slice today — everything else is RTK Query cache.

## 8. Design system

Tokens, components, and patterns are documented separately so they can be
updated independently of this blueprint:

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — colors, typography, spacing,
  radius, shadows.
- [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) — every reusable component
  that exists today, plus documented gaps.
- [UI_PATTERNS.md](./UI_PATTERNS.md) — loading/empty/error/refresh patterns
  used across screens.

## 9. Environment configuration

`API_BASE_URL` (`src/constants/api.ts`) reads `EXPO_PUBLIC_API_URL` with a
local-network fallback for device testing. Never hardcode URLs elsewhere —
always import from `@/constants/api`.

## 10. Related documents

- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) — the rules every change
  must follow.
- [API_MAPPING.md](./API_MAPPING.md) — full endpoint-to-screen mapping.
- [CHANGELOG.md](./CHANGELOG.md) — history of what's shipped.
- [ROADMAP.md](./ROADMAP.md) — known gaps and what's next.
- [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) — why the system is shaped
  this way (e.g. no signup screen, no offline mode).
