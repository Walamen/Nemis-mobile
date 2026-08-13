# NEMIS Mobile — Product Decisions

> A running log of the "why," not the "what." The other docs describe the
> system as it exists; this one records why it exists that way, so a
> future contributor doesn't re-litigate — or accidentally reverse — a
> decision that was already made deliberately. Log a new entry here
> whenever a non-obvious product, architecture, or scope decision gets
> made or confirmed, per [CLAUDE.md](../CLAUDE.md#documentation).

## Format

```
## Why <question>?

- <context / who asked / constraint that drove it>
- …

**Reason:** <the actual justification>
**Date:** YYYY-MM-DD
**Status:** Decided | Future enhancement | Revisit if <condition>
```

Newest entries at the top. Keep each entry short — this is a decision log,
not a design doc; link out to [ROADMAP.md](./ROADMAP.md) or an issue if the
decision implies future work.

---

## Why no Profile Card, when Attendance/Fee/Resource Card were all built this pass?

- After Subject Details, Fee/Resource Cards, and Phase 8 polish shipped, the
  user asked to "jump into" the remaining gaps: static-screen `AppScreen`
  migration, Attendance/Profile Card extraction, and the (already-deferred)
  test suite.
- `AttendanceCard` had 3 real, already-existing duplicated call sites to
  extract from (student dashboard, `learning/attendance.tsx`,
  `learning/subject/[id].tsx`) — a clear case under the project's "3+
  duplicates" rule.
- Profile Card has none: the only student profile screen
  (`(student)/settings/profile.tsx`) renders `EditProfileForm` directly,
  not a card-shaped summary. There's no second or third place in the app
  showing a compact "profile card" today to justify extracting one.

**Reason:** Building a component with no real consumer would be inventing
UI ahead of need — the same discipline already applied to skipping a fake
"Recent Activity" section and to every other card extraction this session
(each only happened once a genuine 2nd/3rd duplicate existed). Listing it
as a "gap to close" in an earlier checkpoint was itself the mistake to
correct, not a commitment to build it regardless.
**Date:** 2026-08-12
**Status:** Decided. Revisit only if a real screen introduces a repeated
profile-card-shaped UI (e.g. a "See profile" preview elsewhere).

## Why is there no test suite yet?

- Asked directly: set up infra + write initial tests, set up infra only,
  or skip entirely. The user chose to skip entirely for this pass.

**Reason:** Explicit user choice, not an oversight or something quietly
dropped. This project has zero test infrastructure (no Jest, no
`@testing-library/react-native`, no config) — adding it is a real new
capability (new dev dependencies, new config, a new kind of work) rather
than polish on what already exists, so it deserved its own explicit
answer rather than being bundled into a "Phase 8 polish" pass by default.
**Date:** 2026-08-12
**Status:** Future enhancement — tracked on
[ROADMAP.md](./ROADMAP.md#6-subject-details-feeresource-cards-and-phase-8-polish)
as its own dedicated task.

## Why skip `FlatList` conversion and `React.memo` on cards?

- A "performance" polish pass was requested. Both were considered and
  traced through rather than either ignored or applied reflexively.
- `FlatList`: every list in this app is realistically bounded (dozens of
  items — assignments, notifications, conversations — not thousands).
  Converting ~10 `ScrollView`+`.map()` list screens to `FlatList` would be
  a large, invasive rewrite for a virtualization benefit that doesn't
  apply at this scale.
- `React.memo`: nearly every card in a list is given an inline
  `onPress={() => ...}` from its parent screen — a new function reference
  every render. `React.memo`'s shallow prop comparison is all-or-nothing
  per component, so a changed `onPress` reference alone defeats it
  regardless of whether the other props are unchanged. Making it actually
  effective would require stabilizing callbacks across every list
  screen — a separate, real refactor, not a one-line `memo()` wrap.

**Reason:** "Avoid premature optimization" — neither change would help at
current/expected data volumes, and the honest version of `React.memo`
here is a bigger, separate piece of work, not a quick win. Recorded so
this isn't silently revisited as "forgotten" later.
**Date:** 2026-08-12
**Status:** Revisit if real performance issues are observed (e.g. via
profiling on-device with production-scale data) — not speculatively.

## Why `/learning/subject/[id]` (singular), not `/learning/subjects/[id]`?

- Needed a detail route for the existing `/learning/subjects` (plural)
  list screen. Whether Expo Router supports a flat file (`subjects.tsx`)
  and a same-named folder (`subjects/[id].tsx`) coexisting as siblings
  wasn't confirmed either way by the versioned SDK 57 docs.
- This codebase already has a proven, working precedent for a dynamic
  detail route registered directly in a parent `_layout.tsx`'s
  `Stack.Screen` list with no nested layout file of its own:
  `(parent)/communication/conversation/[id].tsx`, a _differently-named_
  folder alongside its flat sibling files.

**Reason:** Mirror the pattern already proven to work in this exact repo
instead of the untested same-name collision case — lower risk, same
outcome (`SubjectCard` → detail screen), no need to restructure the
existing `subjects.tsx` list file at all.
**Date:** 2026-08-12
**Status:** Decided.

## Why did the parent dashboard get redesigned before the rest of the parent module?

- Every checkpoint this session (Cards, Loading skeletons, EmptyState,
  `AppScreen`, `AppHeader`'s rollout) deliberately stayed student-only,
  deferring parent screens as an explicit, repeated policy — see the
  `AppHeader` entry above.
- The user explicitly asked for "parent dashboard redesign" as the next
  task, after the student dashboard redesign shipped. That's a direct
  instruction to touch parent screens now, not an inferred priority call.

**Reason:** Follow the explicit request rather than the general
sequencing default — "student first" was a pacing choice for
undifferentiated checkpoint work, not a rule that overrides a specific ask.
**Date:** 2026-08-12
**Status:** Decided. Scope stayed narrow — only the 2 dashboard screens,
not a blanket "do all of parent now" — see
[ROADMAP.md §5](./ROADMAP.md#5-dashboard-redesign-phase-3) for exactly
what did and didn't move.

## Why extract DashboardHeader/QuickActionCard/SectionState instead of duplicating them for the parent dashboard?

- The parent dashboard redesign needed the exact same gradient
  greeting/bell/avatar header, the same icon-tile quick-action grid, and
  the same compact section loading/error/empty shape that the student
  dashboard already had inline/local to its own file.
- Copy-pasting ~80 lines of header markup, a card component, and a
  loading/error/empty helper a second time would be the kind of
  duplication `DEVELOPMENT_RULES.md`'s "3+ duplicates" threshold exists to
  prevent — and this is the second occurrence, the natural point to stop
  it before a third.

**Reason:** A second real consumer of identical UI is reason enough to
extract, especially when the alternative is knowingly writing a duplicate.
The student dashboard was retrofitted to use the extracted versions too
(verified pixel-equivalent) so there's a single source of truth, not one
new shared copy plus one stale inline original.
**Date:** 2026-08-12
**Status:** Decided.

## Why does the redesigned dashboard have no "Recent Activity" section?

- The user's proposed dashboard structure listed both "Announcements" and
  "Recent Activity" as distinct sections in the flow.
- The only real data source that fits either label is
  `useGetAnnouncementsQuery` (`Announcement[]` — title/content/author/
  date/priority) — there's no separate activity-feed endpoint (no
  aggregated "grade posted / attendance marked / fee paid" event stream
  anywhere in `API_MAPPING.md`).
- Renamed the existing announcements-backed section (previously mislabeled
  "Recent Activity") to **Announcements**, matching what it actually shows,
  and moved it earlier in the flow per the requested order.
- Same call applied to the parent dashboard redesign: `ParentDashboard`
  has its own separate `recentActivity: unknown[]` field — grepping the
  whole codebase found it read/rendered nowhere, genuinely unshaped, not
  just unused-but-documented. Left out of the redesigned parent dashboard
  for the identical reason, not a separate decision.

**Reason:** Showing the same announcements list twice under two different
headings would be either confusing (implies two different things,
delivers one) or require fabricating a second content type — both against
the "never invent features/fake data" rule. Shipping the real
Announcements section in the right position is a better outcome than a
duplicate, hollow "Recent Activity" one.
**Date:** 2026-08-12
**Status:** Decided — revisit if the backend ever adds a real aggregated
activity-feed endpoint distinct from announcements.

## Why is AppHeader on all student stacks but no parent ones?

- "Every screen should use one header component" was the original ask,
  which literally means replacing the native Stack header (title + back
  button) on every nested Stack across both roles — real navigation-chrome
  surgery, not just adding an unused component.
- Step 1: offered the user three options up front (full app-wide
  replacement now, opt-in-only leaving native headers alone, or build it
  fully and pilot on one bounded stack first). They chose the pilot; it
  landed on `(student)/learning/*` (5 screens — a no-back tab root plus
  four pushed detail screens, both shapes that matter, in one place small
  enough to evaluate cleanly).
- Step 2: with the pilot verified (`tsc`/`lint` clean, pattern held up),
  asked again whether to widen to just the remaining student stacks or
  both roles at once. They chose student-only, continuing the same
  "student first" sequencing already applied to Cards/Loading/EmptyState/
  `AppScreen` all session. Widened to
  `(student)/{fees,tasks,communication,settings}` (12 more screens).

**Reason:** Validate the pattern on a bounded slice before wider rollout,
then continue the established "student first" sequencing rather than
silently reversing it — parent screens still lack the `AppScreen`/Card/
skeleton/empty-state treatment `AppHeader` would otherwise be arriving
ahead of.
**Date:** 2026-08-12
**Status:** Future enhancement — parent-side rollout is explicitly on
[ROADMAP.md](./ROADMAP.md), waiting on the parent module's other polish
catching up rather than being blocked by anything technical.

## Why no file attachment on assignment submission?

- Wiring `BottomSheet` into `(student)/tasks/assignments.tsx` activated
  `useSubmitAssignmentMutation` for the first time — it had existed in
  `assignments-api.ts` fully built (multipart `FormData`, optional
  `response` text + optional `file: { uri, name, type }`) but was never
  called from anywhere in the app.
- The `file` field needs a document/image picker, and no such library
  (`expo-document-picker`, `expo-image-picker`, etc.) is installed.
- Adding a new dependency for this wasn't confirmed with the user as part
  of this pass — the text-`response` path alone already turns a completely
  non-functional flow (cards didn't even respond to tap) into a working one.

**Reason:** Ship the part of the real, already-specified feature that
needs no new dependency now; treat "which picker library" as its own
decision rather than choosing one implicitly while doing UI work.
**Date:** 2026-08-12
**Status:** Future enhancement — revisit with the user before adding a
picker dependency; see [ROADMAP.md](./ROADMAP.md).

## Why no swipe-to-dismiss risk mitigation on BottomSheet?

- Building a sheet with drag-to-dismiss requires `react-native-gesture-handler`'s
  Pan gesture plus a root-level `GestureHandlerRootView` (previously absent
  from `src/app/_layout.tsx`) and a second, nested one inside the sheet's
  own `Modal` (since `Modal` spawns a separate native root the app-level
  wrapper doesn't cover).
- This can't be visually verified on-device from this environment — gesture
  interactions are exactly the kind of thing that can look right in code
  and still misbehave at runtime (z-index, Android/iOS quirks).
- Offered the user a lower-risk alternative (tap-backdrop/close-button only,
  no gesture-handler dependency) before building; they chose the full
  gesture version anyway.

**Reason:** User's explicit call, made with the risk trade-off stated
up front.
**Date:** 2026-08-12
**Status:** Decided — if swipe-to-dismiss misbehaves on a real device,
the fallback is dropping the `Gesture.Pan()`/`GestureDetector` usage and
keeping tap-backdrop/close-button dismissal, which needs no root layout
change to revert.

## Why no offline mode?

- Requested by Team Lead.
- The desktop (web) client already handles offline use cases.
- Mobile is scoped as online-first.

**Reason:** Offline sync is already covered by another client; duplicating
it on mobile isn't the priority for this build.
**Date:** Unconfirmed — recorded from verbal direction, needs a date once
confirmed with the team.
**Status:** Future enhancement — revisit if mobile usage patterns show a
real need for offline access (e.g. field use in low-connectivity areas).

## Why no signup screen?

- Students (and their linked parents) are created by schools through the
  existing NEMIS backend/admin flow, not self-service.
- The `(auth)` route group only ever has a login + password-reset screen
  (see [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md#auth--unauthenticated));
  `authApi`'s base query explicitly lists `/auth/register` as a
  no-refresh path even though no screen calls it, and `RootNavigator`
  (`src/app/_layout.tsx`) only ever resolves a user to `STUDENT` or
  `PARENT` — there's no "new account" state to route to.

**Reason:** Matches the backend's existing account-provisioning model —
accounts originate from the school/SIS side, not from the mobile app.
**Date:** 2026-07-25
**Status:** Decided.

---

## Related documents

- [ROADMAP.md](./ROADMAP.md) — open items, including anything flagged
  "Future enhancement" above.
- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) — when to document a
  decision vs. just make the change.
- [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md) — the current-state system
  these decisions shaped.
