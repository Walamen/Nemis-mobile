# NEMIS Mobile — Roadmap

> This roadmap is derived from signals already in the codebase (stub
> screens, documented gaps in the other `docs/` files) — it is **not** a
> product/business roadmap and doesn't assume priorities beyond what the
> code itself implies. Confirm sequencing with the project owner before
> treating any item here as committed.

## 1. Stub screens to implement

Five parent Profile screens currently render `ComingSoon` and have no real
implementation (see [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md#parent--role-parent)):

- [ ] `/profile/manage-children` — manage linked children
- [ ] `/profile/notification-preferences` — notification preferences
- [ ] `/profile/privacy-settings` — privacy settings
- [ ] `/profile/help-support` — help & support
- [ ] `/profile/about` — about

None of these have a corresponding student screen or an existing API
endpoint in [API_MAPPING.md](./API_MAPPING.md) — each will need backend
confirmation (does the endpoint already exist server-side?) before UI work
starts, per the "never invent a new endpoint" rule.

## 2. Design-system gaps (from DESIGN_SYSTEM.md / COMPONENT_CATALOG.md)

Not urgent on their own — address opportunistically when a screen touching
the area is already being worked, per [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md):

- [ ] `warning` and `pending` are the same hex — split them if a screen ever
      needs to distinguish the two states visually.
- [ ] Add a true `info` semantic color if a screen needs one.
- [ ] `border` has no dark-mode counterpart — add one when a dark-mode
      contrast issue is actually observed.
- [ ] `Typography.h4` has no `ThemedText` type — wire it up when a screen
      needs a heading between h3 and body.
- [x] `Button` had only one visual variant — now has `primary`/`secondary`/
      `text`/`danger` via a `variant` prop (see [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#srccomponentsbuttons)).
- [x] No shared card components — `Stat`/`Subject`/`Grade`/`Assignment`/
      `Notification`/`Message`/`QuickAction` Card now exist in
      `src/components/cards/` and are wired into the student dashboard,
      subjects, grades, assignments, notifications, and messages screens, plus
      (as of the dashboard redesign) both dashboards'
      `StatCard`/`QuickActionCard`, and `(parent)/dashboard/my-child.tsx`'s
      `GradeCard`/`AssignmentCard` previews. `Fee`/`Resource` Card (§6) and
      `Attendance` Card (§7) have since been added too. Not yet done:
      `NotificationCard`/`MessageCard` on the parent side (no
      `(parent)/communication/*` redesign yet) and `Profile` Card — no real
      duplicated profile-card shape exists on the student side to extract from,
      see [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md).
- [x] `SectionState` (dashboard inline loading/error/empty) was defined
      locally in `(student)/index.tsx` — now extracted to
      `src/components/common/section-state.tsx`, exactly when the anticipated
      trigger happened: the parent dashboard redesign needed the same shape
      for `(parent)/dashboard/my-child.tsx`'s Attendance/Recent Grades/
      Assignments sections. Both dashboards import the shared component now;
      no local copy remains.
- [x] `QueryState`'s loading branch was a plain spinner — it now takes an
      optional `loadingFallback` prop (defaulting to the new `FullPageLoader`).
      `SkeletonList` is wired into the 5 student list screens (subjects, grades,
      assignments, notifications, messages) and `SkeletonProfile` into
      `EditProfileForm` (shared by both roles). Parent-only screens still fall
      back to `FullPageLoader` by default — not yet given a skeleton, per
      "student first."
- [x] No standalone Empty State component — `EmptyState`
      (`src/components/common/`) now exists (icon + title + description +
      optional action) and is `QueryState`'s default `isEmpty` rendering. The 5
      student list screens pass a fuller one via the new `emptyFallback` prop;
      `isError` is still an inline branch, not extracted the same way.
- [ ] Auth screens (`AuthTextField`, `AuthHeading`, …) use hardcoded hex
      values instead of design tokens — reconcile against `Palette` the next
      time an auth screen is touched (see [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#srccomponentsauth)
      for the specific values and the caution about not over-rewriting).
- [ ] Dashboard quick-action tile colors are inline pastel hex values, not
      tokens — deliberate per the in-code comment; only formalize into
      `Palette` if asked to.
- [x] No shared screen wrapper — `AppScreen` (`src/components/layout/`) now
      exists and is wired into 10 student list/detail screens (subjects,
      timetable, grades, attendance, assignments, resources, fees
      balance/history, messages, notifications). In the process, found and
      fixed a real bug: `BottomTabInset` (`src/theme/index.ts`) had been
      exported but never actually used anywhere, so every one of those screens'
      scroll content could end up hidden behind the bottom tab bar —
      `AppScreen`'s `tabBarInset` (default `true`) now applies it. The 4
      student static menu screens (`fees/index`, `tasks/index`,
      `communication/index`, `settings/index`) have since been migrated too
      (§7). **Not yet done:** the parent-side equivalents (`(parent)/academics/*`,
      `(parent)/communication/*`, `(parent)/dashboard/*`, `(parent)/finance.tsx`,
      `(parent)/resources.tsx` — same tab-bar-clipping bug applies there too),
      and the parent's own static menu/form screens (`Shape B`/`C`/`D` in
      [UI_PATTERNS.md](./UI_PATTERNS.md)).
- [x] `SectionHeader` was defined locally in the student dashboard file with
      no "see more" affordance — it's now `src/components/layout/section-header.tsx`
      with an optional `href` (real destinations only — see §5 below for the
      current set of which dashboard sections link out). Not yet applied to a
      parent dashboard, since one doesn't have the same section layout today.
- [x] No `BottomSheet`/overlay component existed anywhere in the app (a
      from-scratch search found zero precedent — no `Modal`, no `Alert.alert`,
      no third-party sheet library). Built `src/components/layout/bottom-sheet.tsx`
      on `react-native-reanimated` + `react-native-gesture-handler` with
      swipe-to-dismiss, and added the previously-missing `GestureHandlerRootView`
      to `src/app/_layout.tsx` (required for gesture-handler to work at all;
      nested a second one inside `BottomSheet` itself since `Modal` spawns a
      separate native root). Wired into a real, previously-completely-unwired
      flow: `(student)/tasks/assignments.tsx` — `useSubmitAssignmentMutation`
      existed in `assignments-api.ts` and was never called from anywhere, and
      `AssignmentCard` taps did nothing. Tapping a card now opens the sheet
      with a text response field and a working submit. **Not yet done:** the
      `file` field `SubmitAssignmentRequest` already supports — no
      document/image picker is installed, so file attachment needs a
      dependency decision (see [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md));
      and parent-side screens (no equivalent submission flow exists there to
      wire up).
- [x] No centered `Modal` existed (only `BottomSheet`, above) — added
      `src/components/layout/modal.tsx` (fade + scale, no gesture-handler
      dependency) and used it for the logout-confirmation gap found while
      researching `BottomSheet`'s real use cases: `(student)/settings/index.tsx`
      and `(parent)/profile/index.tsx` both used to call `logout()` immediately
      on tap; the "Log out" button now opens a confirm/cancel dialog instead.
- [x] `AppHeader` (`src/components/layout/app-header.tsx`) piloted on the 5
      `(student)/learning/*` screens, then widened to the rest of the student
      tabs: `(student)/{fees,tasks,communication,settings}` (12 more screens,
      4 more `_layout.tsx`s set to `headerShown: false`). Every student nested
      Stack now uses `AppHeader` instead of the native header. As of the
      dashboard redesign (§5), also used on `(parent)/dashboard/my-child.tsx`
      (its first real parent-side usage) and, on the dashboard tab-root
      screens specifically, superseded by the new `DashboardHeader` — see §5.
      **Not yet done:** `(parent)/{academics,communication,profile}` still use
      the native header — the "student first" (now "dashboards first")
      sequencing continues, a deliberate call not an oversight (see
      [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)). Its `actions` prop
      (trailing icon buttons with an optional unread badge) still has no real
      consumer.

## 3. API-layer gaps (from API_MAPPING.md)

- [ ] Most read endpoints don't `provideTags` — fine today since nothing
      needs to invalidate them, but worth adding tags if a future mutation
      needs to refresh dashboard/subjects/timetable/grades/attendance/fees/
      resources data.
- [ ] Parent side has no assignment-submission endpoint (student has
      `submitAssignment`; parent assignments are read-only) — confirm this is
      intentional (parents view, don't submit) rather than a missing feature.

## 4. Housekeeping

- [ ] `HintRow` / `WebBadge` (`src/components/common/`) look like leftover
      Expo starter-template components, not part of the product UI — confirm
      unused and remove, or document why they're kept.
- [ ] `Collapsible` (`src/components/common/`) appears unused outside the
      starter template — confirm before extending or removing.

## 5. Dashboard redesign (Phase 3)

- [x] Student dashboard (`(student)/index.tsx`) reordered and extended
      into the requested information hierarchy — Greeting → Summary → Quick
      Stats → alerts → Quick Actions → Announcements → Recent Grades →
      Attendance → Assignments:
  - New **Summary** section surfaces `StudentDashboard.currentGPA` and
    `.pendingFees` — both real fields the dashboard API already returned
    but that no screen displayed anywhere before this. GPA only renders
    when the API actually returns one (never defaulted to 0, which would
    misrepresent "no grade yet" as "zero GPA").
  - New **Assignments** section (new `useGetAssignmentsQuery` call in this
    screen) shows the 3 soonest-due unsubmitted/late assignments via
    `AssignmentCard`, non-interactive — "See all" links to
    `/tasks/assignments` where they're tappable.
  - "Recent Activity" renamed to **Announcements** (its real data source —
    `useGetAnnouncementsQuery` — always was announcements, not a distinct
    activity feed) and moved earlier, right after Quick Actions.
  - "Attendance Summary" renamed to **Attendance** for consistency with
    the other section names.
  - **Not done, deliberately:** a separate "Recent Activity" section at
    the end of the list, as in the original spec — there's no second real
    data source distinct from Announcements to back it; adding one would
    mean either fabricating content or showing the same announcements
    twice under two headings. See
    [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md).
- [x] Parent dashboard (`(parent)/dashboard/index.tsx` +
      `(parent)/dashboard/my-child.tsx`) redesigned — the first parent-side
      screens touched all session, at the user's explicit request ahead of the
      rest of the parent module. Adapted for the parent mental model ("how are
      my children," not "how am I") rather than cloning the student structure
      1:1:
  - Both files moved onto the full foundation for the first time:
    `AppScreen`, shared `Card`/`StatCard`/`QuickActionCard`/`GradeCard`/
    `AssignmentCard` (replacing a hand-duplicated local `StatCard` and
    inline `ThemedView` cards), `SectionState`, and a real `EmptyState`
    (`my-child.tsx`'s "no children linked" case, previously a plain
    `emptyMessage` string).
  - **`dashboard/index.tsx`** (tab root): `DashboardHeader` (see below) →
    Quick Stats (unchanged content: Outstanding Fees, Assignments Due,
    Unread Messages) → alerts → Quick Actions → "Your Children"
    (`ChildSwitcher` + a tappable child-summary `Card`, "See all" → `my-child`).
  - **`my-child.tsx`** (pushed screen, gets `AppHeader` not
    `DashboardHeader`): identity block + info rows (unchanged) plus three
    **new** sections using real, previously-unpreviewed-here child-scoped
    endpoints — Attendance (`useGetChildAttendanceQuery`), Recent Grades
    (`useGetChildAssessmentGradesQuery`, via `GradeCard`), Assignments
    (`useGetChildAssignmentsQuery`, needs-attention filter, via
    `AssignmentCard`) — each "See all" linking to the matching
    `(parent)/academics/*` screen, which already renders the full list
    from the same query. Dropped the redundant single-line "Attendance: X%"
    info row now that the real Attendance section covers it.
  - Extracted two components in the process rather than duplicating them a
    second time: **`DashboardHeader`** (the gradient greeting/bell/avatar
    banner, pulled out of the student dashboard's inline markup — see
    [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#srccomponentslayout))
    and **`QuickActionCard`** (the icon-tile grid item, same origin). The
    student dashboard was retrofitted to import both instead of its
    original local copies — verified pixel-equivalent, pure dedup.
  - `ParentDashboard.recentActivity` (`unknown[]`, confirmed unused and
    unshaped anywhere in the codebase) dropped for the same reason as the
    student dashboard's equivalent field — see
    [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md).
  - **Not yet done:** the rest of the parent module —
    `(parent)/{academics,communication,profile}` — still on pre-refactor
    patterns (native header, no `AppScreen`/shared Cards/skeletons). The
    dashboard redesign doesn't imply those are next; that's a separate
    call.

## 6. Subject Details, Fee/Resource Cards, and Phase 8 polish

- [x] **Subject Details** (`(student)/learning/subject/[id].tsx`, new) —
      `SubjectCard` taps were previously dead ends despite the backend's
      `getSubjectDetail` endpoint being fully built; verified the real API
      contract against the backend source (`Nemis/apps/Server`, read-only)
      before building against it. Shows teacher/description, current
      grade + attendance rate (via `StatCard`), weekly schedule, an
      attendance summary + 5 most recent records, grade history (via
      `GradeCard`, `letterGrade` omitted — the endpoint only returns raw
      marks/percentage per assessment, no computed letter), and all
      assignments (via `AssignmentCard`, status mapped from the endpoint's
      lowercase `'pending'|'submitted'|'graded'|'missing'` union to the
      shared uppercase `AssignmentStatus`). Route registered as `subject/[id]`
      (singular, distinct from the existing `subjects.tsx` list) mirroring the
      proven working pattern from `(parent)/communication/conversation/[id].tsx`,
      rather than the untested flat-file+same-name-folder collision case (Expo
      Router docs didn't confirm that case either way).
      Also fixed one real type inaccuracy found via the backend check:
      `SubjectTeacher.phoneNumber` can be sent as `null`, not just omitted.
- [x] **Fee Card / Resource Card** — both now exist (see
      [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#srccomponentscards)),
      wired into `(student)/fees/{balance,payment-history}.tsx` and
      `(student)/tasks/resources.tsx`, replacing inline `ThemedView`/`Pressable`
      markup. `FeeRulesStatus`/`FeeRuleStatus`/`FeeCollection` types
      (`src/types/fees.ts`) were verified against the real backend response
      and already matched almost exactly — only tightened `method`/`category`
      from loose `string` to real `PaymentMethod`/`FeeCategory` unions.
- [x] **Responsiveness** — `AppScreen` now caps and centers content at
      `MaxContentWidth` (800px, `src/theme`) — previously an unused exported
      constant. No-op on phones (always narrower), additive for tablets.
- [x] **Accessibility pass** — fixed real gaps: the password-visibility
      toggle in `TextField`/`AuthTextField` had no `accessibilityLabel`/role
      (now "Show/Hide password", `hitSlop` bumped 8→16 to approach the 44pt
      touch-target guideline); `Modal`/`BottomSheet` close buttons got the
      same `hitSlop` bump plus an explicit `accessibilityRole`; `DashboardHeader`'s
      icon-only bell/avatar links had no labels at all (now "Notifications, N
      unread" / "Account"); the login screen's "Remember Me" `Pressable` had
      no `accessibilityRole="checkbox"`/`accessibilityState`.
- [x] **Performance** — reviewed, didn't blindly rewrite. `FlatList`
      conversion: skipped — every list in this app is realistically bounded
      (dozens of items, not thousands), so `ScrollView`+`.map()` is
      appropriate at this scale; converting ~10 screens would be a large,
      risky rewrite for a virtualization benefit that doesn't apply yet.
      `React.memo` on card components: skipped after tracing it through —
      nearly every card is given an inline `onPress={() => ...}` from its
      parent, a new function reference every render, which defeats `memo`'s
      shallow-comparison benefit unless the parent also stabilizes those
      callbacks (a real, separate refactor). Confirmed one genuine item was
      already handled correctly: no raw `react-native` `Image` is used
      anywhere for remote photos — everything goes through `expo-image`
      (auto-caching/downsampling).
- [ ] **Testing** — zero test infrastructure exists in this project
      (no Jest, no `@testing-library/react-native`, no config). Explicitly
      offered three options (set up infra + write initial tests, set up infra
      only, or skip entirely) and the user chose to skip this pass entirely —
      see [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md). Revisit as its own
      dedicated task, not bundled into a polish pass.

## 7. Static screen `AppScreen` migration and Attendance Card extraction

- [x] **Static menu screens migrated to `AppScreen`** — `(student)/fees/index.tsx`,
      `tasks/index.tsx`, `communication/index.tsx`, `settings/index.tsx` swapped
      their raw `SafeAreaView` for `AppScreen scroll={false} contentClassName=""`,
      same shell shape §2 already noted as a good fit for this screen type (no
      `QueryState`-owned scroll container to defer to, just a plain padded
      `View` wrapping `MenuList`). `settings/index.tsx`'s logout-confirmation
      `Modal` sibling was untouched. All 4 now also get `AppScreen`'s
      `tabBarInset`/`MaxContentWidth` handling for free.
- [x] **`AttendanceCard` extracted** (`src/components/cards/attendance-card.tsx`)
      — the "big percentage + present/absent/late breakdown" block existed
      inline in 3 real places (student dashboard, `learning/attendance.tsx`,
      `learning/subject/[id].tsx`), past the 3+ duplicates threshold. Built
      flexible enough for both data shapes in use: `AttendanceSummary`-style
      aggregates (`excused`, no `sick`) and a client-side reduce over raw
      attendance records (`excused` and `sick` both possible, computed in
      `subject/[id].tsx`). All 3 original inline implementations replaced,
      verified pixel-equivalent. `learning/attendance.tsx`'s "By Subject" list
      was also upgraded from a raw `ThemedView` to `SectionHeader`+`Card` while
      touching the file, matching the shape already used everywhere else for a
      simple label/value row list.
- [x] **Profile Card — deliberately not built.** No real duplicated
      profile-summary-card pattern exists on the student side today (the one
      profile screen renders `EditProfileForm` directly); building one now
      would be inventing UI ahead of a real second consumer, against the same
      "3+ duplicates" discipline used to justify every other card extraction
      this session. See [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md).
- [ ] **Testing** — still explicitly deferred, unchanged from §6.

## Related documents

- [CHANGELOG.md](./CHANGELOG.md) — what's already shipped.
- [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md),
  [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md),
  [API_MAPPING.md](./API_MAPPING.md) — the source of each item above.
- [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) — the "no offline mode"
  item above is logged there as a decision, not just a backlog entry.
