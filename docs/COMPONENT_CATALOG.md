# NEMIS Mobile — Component Catalog

> Inventory of every reusable component that exists in the codebase today,
> grouped by folder. Before building anything new, check here first — reuse
> or extend before creating (see [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)).
> "Gaps" at the end of each section list components referenced as aspirational
> in project guidelines that do **not** exist yet; do not assume they do.

## `src/components/typography/`

### `ThemedText` ([themed-text.tsx](../src/components/typography/themed-text.tsx))

Theme- and scale-aware text primitive. `type` selects a `Typography` token
(`default`, `title`, `small`, `smallBold`, `subtitle`, `sectionHeading`,
`link`, `linkPrimary`, `code`); `themeColor` selects a `Colors` key
(defaults to `text`). Always prefer this over raw `<Text>` for anything
using the type scale.

## `src/components/common/`

### `Icon` ([icon.tsx](../src/components/common/icon.tsx))

Wraps `expo-symbols`' `SymbolView`. `size`: `sm`(14)/`md`(20)/`lg`(28).
`name` takes a per-platform symbol map (`{ ios, android, web }`). Colors
default to the current theme's `text`.

### `ThemedView` ([themed-view.tsx](../src/components/common/themed-view.tsx))

Theme-aware `View`. `type` selects a `Colors` key for `backgroundColor`
(defaults to `background`); common values in use: `backgroundElement`,
`backgroundSelected`.

### `MenuList` ([menu-list.tsx](../src/components/common/menu-list.tsx))

Renders a list of `{ label, href }` rows as tappable `Link`s on a
`backgroundElement` surface with a trailing chevron. Used for
settings/profile-style navigation menus.

### `QueryState` ([query-state.tsx](../src/components/common/query-state.tsx))

The standard loading/error/empty wrapper for any screen driven by an RTK
Query hook. Props: `isLoading`, `isError`, `isEmpty`, `emptyMessage`,
`onRetry`, `loadingFallback` (custom loading UI — e.g. a `SkeletonList` or
`SkeletonProfile` from `src/components/loading/`, below — defaults to
`FullPageLoader` when omitted), `emptyFallback` (custom empty-state UI —
an `EmptyState` with an `icon`/`description` — defaults to a plain
`EmptyState` using `emptyMessage` as its title). Both fallbacks are
additive: every pre-existing call site that doesn't pass them is
unaffected. See [UI_PATTERNS.md](./UI_PATTERNS.md#loadingerrorempty-state--querystate)
for the full usage pattern — **always reach for this before hand-rolling a
loading/error/empty branch in a screen.**

### `EmptyState` ([empty-state.tsx](../src/components/common/empty-state.tsx))

Standard "nothing here" screen: optional `icon` (in a circular
`backgroundElement` badge — reuse an icon already established elsewhere in
the app, e.g. a screen's own quick-action/tab icon, rather than inventing a
new one per screen), `title`, optional `description`, optional
`actionLabel`/`onAction` (renders a `secondary`-variant `Button`).
`QueryState`'s default `isEmpty` rendering; pass a fuller one via its
`emptyFallback` prop for screens that want more than a plain message —
see `(student)/tasks/assignments.tsx` for an example matching the "no
assignments, you're all caught up" case.

### `SectionState` ([section-state.tsx](../src/components/common/section-state.tsx))

Compact loading/error/empty renderer for one section within an
already-loaded screen (e.g. a dashboard card group driven by its own
independent query) — `QueryState`'s full-page `flex-1` fallbacks would
collapse to zero height outside a screen-filling container, so this is
the shape used instead wherever that applies. Props: `isLoading`,
`isError`, `isEmpty`, `emptyMessage`. Originally a local copy inside the
student dashboard file; extracted once the parent dashboard needed the
same shape (both dashboards now import it). See
[UI_PATTERNS.md §2](./UI_PATTERNS.md#2-inline-section-state--dashboardmulti-query-screens).

### `ComingSoon` ([coming-soon.tsx](../src/components/common/coming-soon.tsx))

Full-screen placeholder (`title` + "This is coming soon.") for routes that
exist in navigation but aren't built yet. Currently used by 5 parent
profile screens — see [ROADMAP.md](./ROADMAP.md).

### `ChildSwitcher` ([child-switcher.tsx](../src/components/common/child-switcher.tsx))

Horizontal pill selector for a parent's children, backed by
`useSelectedChild`. Renders nothing when a parent has ≤1 child. Parent-only;
no student equivalent needed.

### `Collapsible` ([collapsible.tsx](../src/components/common/collapsible.tsx))

Expandable section with a rotating chevron and `FadeIn` content reveal.
Currently unused outside of Expo's starter-template affordance — confirm
it's still needed before extending it.

### `HintRow` / `WebBadge` ([hint-row.tsx](../src/components/common/hint-row.tsx), [web-badge.tsx](../src/components/common/web-badge.tsx))

Leftover Expo starter-template components (code-snippet hint row, Expo
version badge). Not part of the product UI — candidates for removal once
confirmed unused (see [ROADMAP.md](./ROADMAP.md) technical debt).

### `ExternalLink` ([external-link.tsx](../src/components/common/external-link.tsx))

Wraps `expo-router`'s `Link` to open external URLs in an in-app browser on
native, new tab on web.

### `Card` ([card.tsx](../src/components/common/card.tsx))

Shared card container: theme `backgroundElement` surface (override via
`backgroundColor`), `rounded-card`, standard `p-4`/`gap-2`, optionally
tappable (`onPress` — renders non-interactive, no `accessibilityRole`, when
omitted). Every card in `src/components/cards/` is built on this — reach
for it directly only when composing a one-off card shape that doesn't
justify its own named component yet (see the 3+ duplicates rule in
[DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)).

### `Badge` ([badge.tsx](../src/components/common/badge.tsx))

Small status pill. `tone`: `neutral` (default, theme-aware) / `success` /
`warning` / `error` / `info` (fixed brand colors, tinted background at 15%
alpha computed by hand — see the file's comment on why not Tailwind's
`/opacity` modifier). Used by `AssignmentCard` (status) and `MessageCard`
(unread count).

## `src/components/cards/`

Domain cards, each built on `Card` (above). All accept `onPress` and
`className`; only render fields the backend actually returns — none of
these fabricate data (no fake trend numbers, no invented copy).

### `StatCard` ([stat-card.tsx](../src/components/cards/stat-card.tsx))

`label` + `value`, optional leading `icon` and optional `trend`
(`{ direction: 'up'|'down', label }`). **Only pass `trend` when the API
actually returns a period-over-period figure** — no endpoint does today
(see [API_MAPPING.md](./API_MAPPING.md)), so no current call site sets it.
Used by the student dashboard's "Summary" (GPA, Fees Due) and "Quick
Stats" (Attendance Rate, Present Days, Unread Messages) rows, and the
parent dashboard's "Quick Stats" (Outstanding Fees, Assignments Due,
Unread Messages).

### `QuickActionCard` ([quick-action-card.tsx](../src/components/cards/quick-action-card.tsx))

`label`, `href`, `icon`, `bg`/`tint` (a pastel background + matching icon
tint per tile — deliberately not the `Palette` ramp, see
[UI_PATTERNS.md §10](./UI_PATTERNS.md#10-dashboard-header-pattern)). One
tile in a dashboard's "Quick Actions" grid. Used by both dashboards; the
parent dashboard's 4 tiles reuse colors from the student set rather than
inventing new ones. Extracted from the student dashboard's original local
component once the parent dashboard needed the same shape.

### `SubjectCard` ([subject-card.tsx](../src/components/cards/subject-card.tsx))

`name`, `teacherName`, `letterGrade`, `attendanceRate`, optional `trend`
(from `SubjectListItem.performance.trend` — real field) and optional
`nextClassLabel` (precomputed by the caller; no utility exists yet to
derive "next class" from `SubjectListItem.schedule` + the current date —
see [ROADMAP.md](./ROADMAP.md)). Used by `(student)/learning/subjects.tsx`.

### `GradeCard` ([grade-card.tsx](../src/components/cards/grade-card.tsx))

`subjectName`, `percentage`, optional `letterGrade` (omit when the source
data has no computed letter grade — e.g. a raw per-assessment history
entry, which the API only sends marks/percentage for; the trailing
percentage renders alone rather than a faked grade being shown), optional
secondary `label` (e.g. an assessment name). Used by the student
dashboard's "Recent Grades", `(student)/learning/grades.tsx`'s
term-average rows, `(student)/learning/subject/[id].tsx`'s "Grade
History" (`letterGrade` omitted there), and
`(parent)/dashboard/my-child.tsx`'s "Recent Grades" preview.

### `AttendanceCard` ([attendance-card.tsx](../src/components/cards/attendance-card.tsx))

Big `percentage` + a `present`/`absent`/`late` breakdown line, plus optional
`excused`/`sick` counts (only shown when passed — `AttendanceSummary`, the
aggregated endpoint response, has `excused` but no `sick`; a client-side
count over raw attendance records can have both). Extracted once the same
"big percentage + breakdown" block existed in 3 real places. Used by the
student dashboard's "Attendance" section, `(student)/learning/attendance.tsx`,
and `(student)/learning/subject/[id].tsx`'s per-subject attendance summary.

### `AssignmentCard` ([assignment-card.tsx](../src/components/cards/assignment-card.tsx))

`title`, `dueDate` (humanized via [`formatDueLabel`](../src/utils/date.ts)
— "Due today"/"Due tomorrow"/"Overdue by N days"), `status`
(`AssignmentStatus`, shared with `ChildAssignment` — the same union backs
both student and parent assignments). Optional `subjectLabel` — omit on a
screen already scoped to one subject (e.g. a subject detail page), where
repeating it on every card would be redundant. Exports
`ASSIGNMENT_STATUS_LABEL` for reuse. Used by
`(student)/tasks/assignments.tsx` (tappable, opens the submission
`BottomSheet`), the student dashboard's "Assignments" section,
`(student)/learning/subject/[id].tsx`'s "Assignments" (status mapped from
that endpoint's lowercase union — see the file's own comment), and
`(parent)/dashboard/my-child.tsx`'s "Assignments" preview.

### `NotificationCard` ([notification-card.tsx](../src/components/cards/notification-card.tsx))

`title`, `message`, `createdAt` (humanized via
[`formatRelativeTime`](../src/utils/date.ts)), `isRead` (switches the
`Card` background between `backgroundElement`/`backgroundSelected`). Used
by `(student)/communication/notifications.tsx`.

### `MessageCard` ([message-card.tsx](../src/components/cards/message-card.tsx))

`senderName`, `lastMessage`, `lastMessageAt` (relative time), optional
`unreadCount` (renders a `Badge`). Used by
`(student)/communication/messages.tsx`.

### `FeeCard` ([fee-card.tsx](../src/components/cards/fee-card.tsx))

`title`, `amount`, `currency`, optional `subtitle`, optional `status`
(`FeeStatus` from `@/types/fees` — renders a `Badge`; omit for a
payment/collection row, which has no status of its own). Flexible enough
for both a fee-rule balance row and a payment-history row rather than
needing two near-identical components. Also exports `FEE_STATUS_LABEL`
and `PAYMENT_METHOD_LABEL` (mapping the verified backend
`PaymentMethod`/`FeeStatus` enums to display copy). Used by
`(student)/fees/balance.tsx` (per fee rule, with `status`) and
`(student)/fees/payment-history.tsx` (per payment, no `status`).

### `ResourceCard` ([resource-card.tsx](../src/components/cards/resource-card.tsx))

`title`, `subjectName`, `category` (`ResourceCategory`, verified against
the real `ClassResource` Prisma enum), `type` (`'FILE'|'LINK'` — picks a
document vs. link leading icon). Also exports
`RESOURCE_CATEGORY_LABEL`. Used by `(student)/tasks/resources.tsx`.

**Not yet done:** `NotificationCard`/`MessageCard` aren't wired into the
_parent_ equivalents (`(parent)/communication/*`) — only the two
dashboards have been redesigned so far; `(parent)/academics/*` and
`(parent)/communication/*` haven't. Per the "student first" sequencing
(now specifically "dashboards done, rest of parent module still
pending"), that migration is deferred, not missed — see
[ROADMAP.md](./ROADMAP.md).

## `src/components/loading/`

Loading placeholders — `QueryState`'s `loadingFallback` slot is the main
entry point for all of these; only `Skeleton` itself is used standalone.

### `Skeleton` ([skeleton.tsx](../src/components/loading/skeleton.tsx))

Base pulsing placeholder block (`width`, `height`, `radius`, `style`).
Built directly on `react-native-reanimated` (`useSharedValue` +
`withRepeat(withTiming(...))`), not `@/tw` — a bare `Animated.View` isn't
css-wrapped, so this takes `style`, not `className`, unlike most other
components in this catalog.

### `SkeletonCard` ([skeleton-card.tsx](../src/components/loading/skeleton-card.tsx))

2-3 `Skeleton` lines inside a `Card`, mimicking the generic shape of the
domain cards above. `lines={3}` for cards with an extra row (e.g.
`AssignmentCard`'s status badge).

### `SkeletonList` ([skeleton-list.tsx](../src/components/loading/skeleton-list.tsx))

Stack of `count` `SkeletonCard`s. `className` should match the real list's
`ScrollView` padding (e.g. `"px-4 pt-4"`) so the placeholder lines up with
the content it's replacing. Used as `loadingFallback` by
`(student)/learning/subjects.tsx`, `learning/grades.tsx`,
`tasks/assignments.tsx`, `communication/notifications.tsx`,
`communication/messages.tsx`.

### `SkeletonProfile` ([skeleton-profile.tsx](../src/components/loading/skeleton-profile.tsx))

Avatar circle (toggle off via `avatar={false}` on forms with no avatar,
e.g. `EditProfileForm`) + `fields` label/input placeholder pairs, sized to
match `TextField`'s label + `rounded-input` rhythm.

### `FullPageLoader` ([full-page-loader.tsx](../src/components/loading/full-page-loader.tsx))

Full-screen centered spinner. `QueryState`'s default `loadingFallback`; also
used directly by `src/app/_layout.tsx`'s session-check screen.

### `InlineLoader` ([inline-loader.tsx](../src/components/loading/inline-loader.tsx))

Compact centered spinner on a `backgroundElement` surface, for inline
section-level loading where `FullPageLoader`'s `flex-1` would collapse to
zero height (see [UI_PATTERNS.md](./UI_PATTERNS.md#2-inline-section-state--dashboardmulti-query-screens)).
Currently only used by the student dashboard's local `SectionState` helper.

## `src/components/buttons/`

### `Button` ([button.tsx](../src/components/buttons/button.tsx))

`variant`: `primary` (default, filled `secondary`) / `secondary`
(outlined) / `text` (minimal, for inline actions) / `danger` (filled
`error`, for logout/delete). Props: `label`, `onPress`, `variant`,
`isLoading` (spinner tinted to match the variant), `disabled`, `icon` +
`iconPosition`, `className`. Fires a light haptic tap on press (native
only, via `expo-haptics`). Disabled/loading apply `opacity-60`; pressed
state is `active:opacity-80`.

## `src/components/forms/`

### `TextField` ([text-field.tsx](../src/components/forms/text-field.tsx))

Standard labeled input: `smallBold` label, `backgroundElement` surface,
`rounded-input`. Props beyond native `TextInput`: `error` (renders on the
`error` token), `helperText` (shown when there's no `error`), `leftIcon`,
`rightIcon` (ignored when `isPassword`/`isLoading` is set), `isPassword`
(adds a show/hide toggle, manages `secureTextEntry` internally), `isLoading`
(spinner takes the right slot), `disabled` (forces non-editable + dims the
field). Used by `EditProfileForm`, `ChangePasswordForm` (password fields
use `isPassword`), and reset-password screens.

**Gap:** no OTP input exists anywhere in the codebase.

## `src/components/auth/`

A separate, visually distinct set of components used only by the `(auth)`
route group (login, reset password). These intentionally use their own
hardcoded style values rather than the shared `Colors`/`Typography` tokens —
**this is a known, pre-existing divergence** from the rest of the design
system, not a bug to silently "fix" by swapping in `ThemedText`/`TextField`
wholesale (that would be a redesign, not a polish pass). If asked to polish
auth screens, reconcile the _specific_ hardcoded hex values
(`#101828`, `#667085`, `#9AA0A6`, `#E4E7EC`, `#C10021`) against the
`DESIGN_SYSTEM.md` palette and replace only where an equivalent token
already exists, flagging any that don't map cleanly.

### `AuthScreenShell` ([auth-screen-shell.tsx](../src/components/auth/auth-screen-shell.tsx))

Layout shell for auth screens: `AuthHeader` + safe-area + keyboard-avoiding

- scroll container. Wrap every `(auth)` screen's content in this.

### `AuthHeader` ([auth-header.tsx](../src/components/auth/auth-header.tsx))

Full-bleed brand image with a curved white "wave" cut into its bottom edge
(a plain circular `View`, no `react-native-svg` in this project — don't
introduce SVG for a similar effect elsewhere without discussion).

### `AuthHeading` ([auth-heading.tsx](../src/components/auth/auth-heading.tsx))

Screen title + short `secondary`-colored underline accent, used under
`AuthHeader` on each auth screen.

### `AuthTextField` ([auth-text-field.tsx](../src/components/auth/auth-text-field.tsx))

Underlined input with a leading `Icon` and, for `isPassword`, a
show/hide toggle. Auth-screen-only visual language (no `backgroundElement`
surface — bottom border instead).

## `src/components/profile/`

### `EditProfileForm` ([edit-profile-form.tsx](../src/components/profile/edit-profile-form.tsx))

Wraps `useUpdateProfileForm` (React Hook Form + Zod) with `QueryState` +
`TextField` × 3 (first/last name, phone) + `Button`. **Shared verbatim by
both student and parent profile screens** — the reference example of the
"parent mirrors student" rule in practice.

### `ChangePasswordForm` ([change-password-form.tsx](../src/components/profile/change-password-form.tsx))

Same pattern as above for `useChangePasswordForm`: current/new/confirm
password fields + `Button`. Also shared verbatim by student and parent.

## `src/components/layout/`

### `AppScreen` ([app-screen.tsx](../src/components/layout/app-screen.tsx))

Standard screen shell: `SafeAreaView` + optional `ScrollView`
(`scroll`, default `true`) with pull-to-refresh (`refreshing`/`onRefresh`)

- optional `KeyboardAvoidingView` (`keyboardAvoiding`) + content padding
  (`contentClassName`, default `"px-4 pt-4"`) + tab-bar-aware bottom spacing
  (`tabBarInset`, default `true` — reserves `BottomTabInset` from
  `src/theme`, see the gap this closed in [ROADMAP.md](./ROADMAP.md)). Also
  caps and centers content at `MaxContentWidth` (`src/theme`, 800px) —
  a no-op on any phone (screens are always narrower), purely additive for
  tablets/large screens; nothing needed to opt in.

**Does not replace `QueryState`'s own `ScrollView`.** Screens that nest
`QueryState` around a `ScrollView` (the dominant list-screen shape — see
[UI_PATTERNS.md](./UI_PATTERNS.md#1-loading--error--empty-state--querystate))
use `AppScreen` with `scroll={false} contentClassName=""` as a pure
shell — `QueryState`'s own loading/error/empty fallbacks still need to sit
directly inside the `SafeAreaView`, not inside a `ScrollView`, or their
`flex-1` centering collapses to zero height (the same reason `SectionState`
can't use `QueryState` directly — see
[UI_PATTERNS.md §2](./UI_PATTERNS.md#2-inline-section-state--dashboardmulti-query-screens)).
Used by 11 student list/detail screens (subjects, subject detail, grades,
timetable, attendance, assignments, resources, fees balance/history,
messages, notifications) with `scroll={false}` as a pure shell around their
own `QueryState`+`ScrollView`, plus 4 static menu screens (`fees/index`,
`tasks/index`, `communication/index`, `settings/index`) using the same
`scroll={false}` shell around a plain padded `View` (no query/scroll of
their own to defer to) — 15 student screens total. See
[ROADMAP.md](./ROADMAP.md) for what's not yet migrated (parent side).

### `SectionHeader` ([section-header.tsx](../src/components/layout/section-header.tsx))

Section title + optional trailing "See all ›" link (`href`, an `expo-router`
`Href` — only pass one when a real fuller-detail screen exists; several
dashboard sections have none and correctly render title-only).
Extracted from a local copy in the student dashboard
(`(student)/index.tsx`); now used there for "Recent Grades" (→
`/learning/grades`), "Attendance" (→ `/learning/attendance`), and
"Assignments" (→ `/tasks/assignments`) — "Summary", "Quick Stats", "Quick
Actions", and "Announcements" stay title-only (no fuller screen to link
to for the latter — see [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)).

### `BottomSheet` ([bottom-sheet.tsx](../src/components/layout/bottom-sheet.tsx))

Slide-up sheet over a dimming backdrop. Fully controlled (`visible`,
`onClose`), optional `title` (renders a close button next to it).
Dismissible by tapping the backdrop, the close button, the Android back
button, or dragging the handle down (far or fast enough — swipe-to-dismiss
via `react-native-gesture-handler`'s `Gesture.Pan()`). Built directly on
`react-native-reanimated` (no bottom-sheet library is installed), same
"raw reanimated, `style` not `className`" approach as `Skeleton`. Requires
`GestureHandlerRootView` — wired at the app root
(`src/app/_layout.tsx`) _and_ nested again inside this component's own
`Modal`, since `Modal` spawns a separate native root the app-level one
doesn't cover. Used by
`(student)/tasks/assignments.tsx` for assignment submission — see
[ROADMAP.md](./ROADMAP.md) for what it doesn't do yet (file attachment).

### `Modal` ([modal.tsx](../src/components/layout/modal.tsx))

Centered dialog over a dimming backdrop — fade + scale via
`react-native-reanimated`, no gesture-handler dependency (dialogs aren't
swipe-dismissible the way `BottomSheet`s are). Fully controlled
(`visible`, `onClose`), optional `title` (renders a close button next to
it). Used by `(student)/settings/index.tsx` and
`(parent)/profile/index.tsx` for a logout confirmation — both previously
called `logout()` immediately on tap with no "are you sure?" step; the
trigger `Button` now just opens the modal, and the loading state moved to
the modal's own "Log out" button.

### `AppHeader` ([app-header.tsx](../src/components/layout/app-header.tsx))

Back button (auto-hidden on a stack's root screen via
`router.canGoBack()`, override with `showBack`) + centered `title` +
optional trailing `actions` (icon buttons, each with an optional unread
`badge` count — capability only; no screen has a real need for one yet,
so none is wired). Meant to replace the native Stack header — pair with
`headerShown: false` on the enclosing `Stack`'s `screenOptions`, and
render as the first child inside `AppScreen`, before any scrollable
content. Relies on `AppScreen`'s `SafeAreaView` for the top inset; doesn't
apply its own.

**All of student, plus the parent dashboard stack.** Piloted on
`(student)/learning/*` (5 screens), widened to the rest of the student
tabs — `(student)/{fees,tasks,communication,settings}/*` (12 more
screens) — then, once the parent dashboard redesign needed a pushed-screen
header for `(parent)/dashboard/my-child.tsx`, used there too (its first
real parent-side usage). `(parent)/{academics,communication,profile}`
still use the native header — not yet redesigned, unlike the dashboard
stack — see [ROADMAP.md](./ROADMAP.md).

### `DashboardHeader` ([dashboard-header.tsx](../src/components/layout/dashboard-header.tsx))

The gradient "home screen" header — greeting, a notification bell with an
unread badge, and an avatar — used by both dashboards' tab-root screen
(`(student)/index.tsx`, `(parent)/dashboard/index.tsx`). This is the
"Dashboard" header variant named in the original design-system plan; a
separate component from `AppHeader` rather than a variant/branch inside it,
since the two are structurally quite different (a tall gradient banner
that scrolls with the page vs. `AppHeader`'s slim fixed bar) — see
[PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md). Props: `greeting`,
`subtitle`, `unreadCount`, `notificationsHref`, `avatarUrl`,
`avatarInitial`, `avatarHref`. Renders as the first child inside the
screen's own `ScrollView` (not `AppScreen`'s fixed-header slot) — the
body below it overlaps it via a negative `marginTop`, unchanged from how
the student dashboard always did this. Extracted from the student
dashboard's original inline markup once the parent dashboard needed the
identical thing a second time.

### `AnimatedSplashOverlay` ([animated-icon.tsx](../src/components/layout/animated-icon.tsx) / `.web.tsx`)

Platform-split splash/launch animation shown over `RootLayout` while fonts
load. Native and web have separate implementations (`.web.tsx` uses CSS
modules — `animated-icon.module.css`). Not a general-purpose component;
don't reuse outside the root layout.

## `src/tw/`

Not components in the reusable-UI sense, but the base primitives everything
else is built on: NativeWind/`react-native-css`-wrapped `Text`, `View`,
`Pressable`, `Link`, `Image`, `Animated`. Import RN primitives from here
(`@/tw`), not directly from `react-native`, so `className` works.

## Known gaps — not yet implemented

The following are referenced as aspirational examples in the project's UI
guidelines but **do not exist in the codebase today**. Do not reference them
as if they do; build them only when a screen actually needs one, reusing
the token system in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md):

- Search field, OTP input.
- Checkbox, Radio, Switch (the login screen's "Remember me" checkbox is
  still a one-off `Pressable` in `(auth)/index.tsx`, not a shared component).
- Avatar, Chip.
- Profile Card — `Fee`/`Resource`/`Attendance` Card now exist too (see
  above), alongside `Stat`/`Subject`/`Grade`/`Assignment`/`Notification`/
  `Message`. Profile Card doesn't, and isn't built speculatively: no
  student screen has a repeated "profile summary card" shape today (the
  one profile screen there is uses `EditProfileForm` directly, not a
  card) — extract only once a real duplicated pattern shows up, per the
  3+ duplicates rule. See [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md).
- Standalone Error State component — `EmptyState` now exists (see
  `src/components/common/`) and is `QueryState`'s default `isEmpty`
  rendering, but the `isError` branch is still an inline `ThemedView` +
  `Button`, not extracted the same way.

## Related documents

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — tokens these components consume.
- [UI_PATTERNS.md](./UI_PATTERNS.md) — how these components compose into
  screen-level patterns (loading/empty/error, pull-to-refresh, forms).
- [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md) — which screens use
  which components.
