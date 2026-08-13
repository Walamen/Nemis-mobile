# NEMIS Mobile — Development Rules

> The condensed, project-specific rulebook. This restates
> [CLAUDE.md](../CLAUDE.md) / [AGENTS.md](../AGENTS.md) in terms of *this*
> codebase's actual files and patterns, so a contributor doesn't have to
> cross-reference the abstract guideline every time. Where this document and
> `CLAUDE.md` disagree, `CLAUDE.md` wins — file an update here instead of
> ignoring it.

## 1. Before writing code

For every task, in order:

1. Read the request completely.
2. Inspect the existing implementation — check
   [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md) for the
   equivalent student/parent screen.
3. Search [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) for a reusable
   component before writing a new one.
4. Search `src/hooks/` and `src/features/*/use-*.ts` for a reusable hook.
5. Search `src/services/` for a reusable service.
6. Search [API_MAPPING.md](./API_MAPPING.md) for an existing endpoint —
   **the backend already exists; never invent a new one.**
7. List every file the change will touch.
8. State a short implementation plan before editing.

Never start coding before doing the above. One task = one logical set of
changes; don't touch unrelated files.

## 2. Architecture layering

```
screen (src/app/**)        — composition + local UI state only
  → component (src/components/**)
  → hook (src/hooks/**, src/features/**/use-*.ts)
     → service (src/services/**)
     → api slice (src/api/**, RTK Query)
```

Business logic never lives in a screen component. If a screen file is
growing large, extract logic into a hook, not into more inline functions in
the same file.

## 3. State management

- Server state → **RTK Query only**. One `injectEndpoints` file per domain
  under `src/api/<domain>/`, registered on the single `apiSlice`
  (`src/api/api-slice.ts`). No manual `fetch`/`axios` calls anywhere outside
  `src/api/fetch-base-query.ts`.
- Client state → Redux Toolkit, but sparingly — today there is exactly one
  hand-rolled slice (`selected-child-slice`, for the parent's active-child
  selection). Don't add a new slice for something RTK Query cache already
  covers.
- Prefer RTK Query's tag invalidation (`providesTags`/`invalidatesTags`)
  over manual `refetch()` calls where a mutation should refresh a query —
  see the tag gap noted in [API_MAPPING.md](./API_MAPPING.md#apislice-tag-graph).

## 4. API rules

- Never hardcode a URL — import `API_BASE_URL` from `@/constants/api`, or
  better, add the path to the relevant `src/api/<domain>/*.ts` slice and use
  its generated hook.
- Every endpoint returns an `ApiEnvelope<T>` — unwrap it in
  `transformResponse`, never in the component.
- Auth headers and 401-refresh-and-retry are handled centrally in
  `baseQueryWithReauth` — don't reimplement token attachment or refresh
  logic in an individual slice.

## 5. Authentication

- Tokens live in `expo-secure-store` via `src/services/auth-token-storage.ts`
  — **never** `AsyncStorage`, never a Redux-persisted field, never a plain
  JS variable that survives a reload.
- Session state flows through `useAuth()` (`user`, `isAuthenticated`,
  `isCheckingSession`) — don't read `getMe` directly in a screen.
- Role-based routing is enforced in `src/app/_layout.tsx` via
  `Stack.Protected`; don't add manual role checks/redirects inside
  individual screens for something the root navigator already gates.

## 6. Forms

- React Hook Form + Zod, following the `src/features/<domain>/use-*-form.ts`
  pattern (see `use-update-profile-form.ts`, `use-change-password-form.ts`,
  `use-login-form.ts`). A form hook owns the schema, `useForm` wiring, and
  submit handler; the component only renders `Controller`s.
- Every form must surface: validation errors (`errors.<field>?.message`),
  a submitting state (disable inputs via `editable={!isSubmitting}`, use
  `Button`'s `isLoading`), and a success/failure signal (`errors.root` for
  failure, an `isSaved` flag for success — see `EditProfileForm`).

## 7. Styling

- NativeWind via `@/tw` (not raw `react-native` imports) for anything that
  needs `className`.
- Use `ThemedText`/`ThemedView` for anything that must adapt to light/dark —
  never write `color: '#000000'` inline in new code outside the `(auth)`
  screens' already-established one-off style (see
  [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md#srccomponentsauth)).
- Only use tokens from [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — colors,
  spacing (4/8/12/16/20/24/32/40/48/64), radius (`rounded-input`/
  `rounded-card`/`rounded-button`), shadows (`shadow-sm`/`md`/`lg`). No
  arbitrary Tailwind values (`p-[13px]`, `text-[#123abc]`) without a
  documented reason.

## 8. Screens

Every screen must handle:

- **Loading** — via `QueryState`'s `isLoading` branch, not a hand-rolled
  spinner.
- **Empty** — `QueryState`'s `isEmpty`/`emptyMessage`.
- **Error** — `QueryState`'s `isError`/`onRetry`.
- **Pull-to-refresh** — `RefreshControl` on the scroll container, wired to
  the query's `refetch`, wherever content can go stale (already the
  majority pattern — see [UI_PATTERNS.md](./UI_PATTERNS.md)).

## 9. Parent/student parity

Before building a parent screen, find its student equivalent (or vice
versa) in [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md) and reuse
its components/hooks/layout. `EditProfileForm` and `ChangePasswordForm`
are the model: one component, both roles. Only diverge where the domain
genuinely differs (e.g. parent needs a `childId`, student doesn't) — don't
maintain two copies of otherwise-identical UI.

## 10. Do not

- Replace working components, rewrite RTK Query slices, or change
  navigation/route names without being asked.
- Invent features or fake data.
- Introduce a second icon library, a new state library, or a CSS-in-JS
  system alongside NativeWind.
- Log tokens, passwords, or other sensitive data (check for stray
  `console.log` before finishing a task).
- Leave commented-out code, unused imports, or debugging statements in a
  finished change.

## 11. Verification checklist

Before calling a task done:

1. TypeScript compiles (`npx tsc --noEmit` or equivalent).
2. Lint passes (`npm run lint`).
3. Navigation still resolves (route names/params unchanged unless the task
   required it).
4. The screen behaves reasonably on a small phone, a large phone, and a
   tablet width (no hardcoded pixel widths that would clip content).

## 12. Reporting

After every completed task, report: **Summary**, **Files Changed**,
**Architecture Impact**, **Risks**, **Recommendations** — per
[CLAUDE.md](../CLAUDE.md#reporting).

## 13. Logging decisions

When a task involves a non-obvious product, scope, or architecture call —
"why does this screen have no X," "why did we skip Y" — add an entry to
[PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) using its documented format,
rather than letting the reasoning live only in a commit message or chat
history. This is distinct from the technical-debt notes in
[ROADMAP.md](./ROADMAP.md): a roadmap item is unfinished work, a product
decision is a settled "why."

## Related documents

- [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md) — the "what" this rulebook
  protects.
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md),
  [UI_PATTERNS.md](./UI_PATTERNS.md) — the design-system specifics referenced above.
- [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) — the decision log this
  rule points to.
