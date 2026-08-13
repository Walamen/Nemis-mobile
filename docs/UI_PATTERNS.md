# NEMIS Mobile — UI Patterns

> The recurring, screen-level patterns already established in the codebase.
> When building or polishing a screen, match one of these rather than
> inventing a new shape — consistency across screens matters more than any
> single screen being "better." Component-level detail lives in
> [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md); tokens in
> [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

## 1. Loading / error / empty state — `QueryState`

The default pattern for any screen whose entire content depends on one
primary query (list screens, detail screens):

```tsx
<AppScreen scroll={false} contentClassName="">
  <QueryState
    isLoading={isLoading}
    isError={isError}
    isEmpty={!data?.items?.length}
    emptyMessage="No X found."
    onRetry={refetch}
  >
    <ScrollView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
      {/* content */}
    </ScrollView>
  </QueryState>
</AppScreen>
```

Reference: [`(student)/learning/subjects.tsx`](../src/app/(student)/learning/subjects.tsx).

- `isLoading` (not `isFetching`) gates the full-screen spinner — it's only
  true on the very first load, so pull-to-refresh doesn't flash it.
- `isFetching` drives `RefreshControl`'s `refreshing` prop instead.
- `isEmpty` is computed by the screen (`!data?.field?.length`), not by
  `QueryState` — pass the already-evaluated boolean.
- `AppScreen` is used with `scroll={false} contentClassName=""` here — it's
  a pure `SafeAreaView` shell in this shape, since `QueryState` owns the
  `ScrollView` itself (see [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#srccomponentslayout)
  for why the two can't be merged into one scroll container).

By default the loading branch is a full-page spinner
(`FullPageLoader`). For list/detail screens, pass a matching skeleton via
`loadingFallback` instead — it should mirror the real content's padding and
row shape:

```tsx
<QueryState
  isLoading={isLoading}
  isError={isError}
  isEmpty={!data?.items?.length}
  onRetry={refetch}
  loadingFallback={<SkeletonList count={4} lines={3} className="px-4 pt-4" />}
  emptyFallback={
    <EmptyState
      icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
      title="No X yet"
      description="Short, specific reason — not just a repeat of the title."
    />
  }
>
```

Reference: [`(student)/learning/subjects.tsx`](../src/app/(student)/learning/subjects.tsx)
(`SkeletonList`), [`EditProfileForm`](../src/components/profile/edit-profile-form.tsx)
(`SkeletonProfile`), [`(student)/tasks/assignments.tsx`](../src/app/(student)/tasks/assignments.tsx)
(`EmptyState`). Reuse an icon already established elsewhere in the app
(e.g. the screen's own tab/quick-action icon) rather than inventing a new
one. See [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#srccomponentsloading)
for the full set of loading components and which screens use which.

## 2. Inline section state — dashboard/multi-query screens

Screens that compose several independent queries into sections (dashboards)
can't use `QueryState` per-section, because its loading/error/empty
branches are `flex-1` and collapse to zero height outside a screen-filling
container. Use `SectionState` — a compact version of `QueryState` for this
shape:

```tsx
<SectionState isLoading={isX} isError={isXError} isEmpty={x?.length === 0} emptyMessage="…">
  {/* section content */}
</SectionState>
```

Reference: both dashboards —
[`(student)/index.tsx`](../src/app/(student)/index.tsx) (Announcements /
Recent Grades / Attendance / Assignments) and
[`(parent)/dashboard/my-child.tsx`](../src/app/(parent)/dashboard/my-child.tsx)
(Attendance / Recent Grades / Assignments) — wrap each independent section
in it, while the screen's outer `QueryState` only gates the primary query
(dashboard summary / selected child). See
[COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#srccomponentscommon) for the
component itself — originally a local copy inside the student dashboard
file, extracted to `src/components/common/section-state.tsx` once the
parent dashboard needed the identical shape.

## 3. Pull-to-refresh

Any screen whose data can go stale wraps its scroll container in
`RefreshControl`, bound to the primary query's `isFetching`/`refetch`:

```tsx
<ScrollView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
```

This is already the dominant pattern (21 of the ~50 screens). Apply it to
any list/detail screen that doesn't have it yet, unless the screen is a
static form (auth, settings menus) where there's nothing to refresh.

## 4. Card pattern

The de facto "card" is not a component — it's a `ThemedView` with a fixed
class combination, repeated per-screen:

```tsx
<ThemedView type="backgroundElement" className="gap-2 rounded-card p-4">
```

Used for subject rows, grade rows, alert banners, section bodies, etc. See
the gap noted in
[COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#known-gaps--not-yet-implemented) —
this is intentionally not yet extracted into named card components
(`SubjectCard`, `GradeCard`, …); do so only once a specific card shape
repeats 3+ times with the same structure.

## 5. List screen shell

```
AppScreen (scroll={false} contentClassName="") — SafeAreaView + tab-bar inset
  └─ QueryState (loading/error/empty)
       └─ ScrollView (or FlatList for long homogeneous lists)
            with RefreshControl
            → mapped `ThemedView` cards (§4)
```

Used by subjects, timetable, grades, attendance, assignments, resources,
fee balance/history, messages, notifications — student side migrated to
`AppScreen`; the parent equivalents still use the raw `SafeAreaView` this
replaced (see [ROADMAP.md](./ROADMAP.md)).

## 6. Detail/section-landing screens

Section "index" screens (`learning/index.tsx`, `tasks/index.tsx`,
`fees/index.tsx`, `academics/index.tsx`, `settings/index.tsx`,
`profile/index.tsx`, `communication/index.tsx`) are typically thin
navigation menus built on `MenuList` — no query, no `QueryState`, just a
list of `{ label, href }` entries. Don't add data-fetching to one of these
unless the design genuinely calls for a summary at that level.

## 7. Forms

```tsx
<Controller
  control={control}
  name="fieldName"
  render={({ field: { onChange, onBlur, value } }) => (
    <TextField label="…" value={value} onChangeText={onChange} onBlur={onBlur}
      editable={!isSubmitting} error={errors.fieldName?.message} />
  )}
/>
{errors.root?.message && <Text className="mb-2 text-center text-sm text-red-600">{errors.root.message}</Text>}
{isSaved && <Text className="mb-2 text-center text-sm text-green-600">Saved.</Text>}
<Button label="Save" onPress={onSubmit} isLoading={isSubmitting} className="mt-2" />
```

Reference: [`EditProfileForm`](../src/components/profile/edit-profile-form.tsx),
[`ChangePasswordForm`](../src/components/profile/change-password-form.tsx).
The form hook (`src/features/<domain>/use-*-form.ts`) owns validation and
submission; the component only wires `Controller`s. See
[DEVELOPMENT_RULES.md §6](./DEVELOPMENT_RULES.md#6-forms).

**Known gap:** success/error text uses raw Tailwind (`text-red-600`,
`text-green-600`) rather than the `error`/`success` design tokens — align
with [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) tokens when next touched.

## 8. Settings/menu screens

```tsx
<MenuList items={[{ label: 'Profile', href: '/profile/edit-profile' }, …]} />
```

Used for Settings (student) and Profile (parent) landing screens. Keep new
entries alphabetized or logically grouped as the existing list already is —
don't reorder unrelated existing items when adding one.

## 9. Stub screens — `ComingSoon`

```tsx
<ComingSoon title="Manage Children" />
```

The 5 not-yet-built parent profile screens (see
[ROADMAP.md](./ROADMAP.md)) all use this. When one of them gets a real
implementation, mirror the list-screen or form pattern above as
appropriate — don't leave a hybrid half-`ComingSoon` state.

## 10. Dashboard header pattern

Both dashboards' tab-root screen (`(student)/index.tsx`,
`(parent)/dashboard/index.tsx`) use `DashboardHeader` — a colored header
band (`Palette.secondary` background, rounded bottom corners, greeting +
notification bell + avatar) rendered as the first child inside the
screen's `ScrollView`, overlapping the content below it (`marginTop: -16`
on the body). See
[COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#srccomponentslayout) for the
component itself — originally inline in the student dashboard, extracted
once the parent dashboard needed the identical thing.

Quick-action tiles below the header (`QuickActionCard`) use **per-action
pastel background + tint colors passed in as props** (`bg: '#EAF2FF',
tint: '#0367A0'`, etc.), explicitly *not* the `Palette` ramp — see the
comment in `(student)/index.tsx`: this follows a separate app mockup's
color choices, kept in-brand but not literally re-deriving each tile's
colors from `Palette`. The parent dashboard's 4 tiles reuse colors from
the student set rather than inventing new ones. When touching either
dashboard, preserve that intent — don't "fix" the quick-action colors into
`Palette` tokens without confirming that's actually wanted, since it's a
documented deliberate choice, not an oversight.

## Related documents

- [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) — the components these
  patterns are built from.
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — tokens referenced above.
- [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md) — which screens use
  which pattern.
