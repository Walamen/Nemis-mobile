# NEMIS Mobile — Screen Specifications

> Full route inventory for the app, grouped the way `Stack.Protected` groups
> them (see [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md#5-routing-model)).
> "Data source" links to the RTK Query endpoint(s) the screen reads —
> full detail in [API_MAPPING.md](./API_MAPPING.md). Screens marked
> **(stub)** render `ComingSoon` and have no real implementation yet.

## `(auth)` — unauthenticated

| Route | File | Purpose |
|---|---|---|
| `/` | [(auth)/index.tsx](../src/app/(auth)/index.tsx) | Login (email/password via `AuthScreenShell` + `AuthTextField`) |
| `/reset_password` | [(auth)/reset_password.tsx](../src/app/(auth)/reset_password.tsx) | Combined request-reset / confirm-reset flow |

Data source: `authApi` (`login`, `requestPasswordReset`, `confirmPasswordReset`).

## `(student)` — role `STUDENT`

Bottom tabs (`_layout.tsx`): **Overview · Learning · Fees · Tasks ·
Communication · Settings**.

| Tab | Route | File | Purpose | Data source |
|---|---|---|---|---|
| Overview | `/` | [index.tsx](../src/app/(student)/index.tsx) | Dashboard — summary stats, quick actions | `studentDashboardApi` |
| Learning | `/learning` | [learning/index.tsx](../src/app/(student)/learning/index.tsx) | Learning section landing (links to subjects/timetable/grades/attendance) | — |
| | `/learning/subjects` | [learning/subjects.tsx](../src/app/(student)/learning/subjects.tsx) | Subject list → subject detail (tap a `SubjectCard`) | `subjectsApi` |
| | `/learning/subject/[id]` | [learning/subject/\[id\].tsx](<../src/app/(student)/learning/subject/[id].tsx>) | Subject detail — teacher/description, grade + attendance stats, schedule, attendance records, grade history, all assignments | `subjectsApi.getSubjectDetail` |
| | `/learning/timetable` | [learning/timetable.tsx](../src/app/(student)/learning/timetable.tsx) | Weekly timetable | `timetableApi` |
| | `/learning/grades` | [learning/grades.tsx](../src/app/(student)/learning/grades.tsx) | Report card + per-assessment grades | `gradesApi` |
| | `/learning/attendance` | [learning/attendance.tsx](../src/app/(student)/learning/attendance.tsx) | Attendance record | `attendanceApi` |
| Fees | `/fees` | [fees/index.tsx](../src/app/(student)/fees/index.tsx) | Fees section landing | — |
| | `/fees/balance` | [fees/balance.tsx](../src/app/(student)/fees/balance.tsx) | Current fee-rule balance | `feesApi` |
| | `/fees/payment-history` | [fees/payment-history.tsx](../src/app/(student)/fees/payment-history.tsx) | Payment history | `feesApi` |
| Tasks | `/tasks` | [tasks/index.tsx](../src/app/(student)/tasks/index.tsx) | Tasks section landing | — |
| | `/tasks/assignments` | [tasks/assignments.tsx](../src/app/(student)/tasks/assignments.tsx) | Assignment list → detail → submission | `assignmentsApi` |
| | `/tasks/resources` | [tasks/resources.tsx](../src/app/(student)/tasks/resources.tsx) | Class resources (per subject) | `resourcesApi` (tasks) |
| Communication | `/communication` | [communication/index.tsx](../src/app/(student)/communication/index.tsx) | Communication section landing | — |
| | `/communication/notifications` | [communication/notifications.tsx](../src/app/(student)/communication/notifications.tsx) | Notification list, mark read/read-all | `notificationsApi` |
| | `/communication/messages` | [communication/messages.tsx](../src/app/(student)/communication/messages.tsx) | Announcements + conversations, send message | `messagesApi` |
| Settings | `/settings` | [settings/index.tsx](../src/app/(student)/settings/index.tsx) | Settings landing (→ `MenuList`) | — |
| | `/settings/profile` | [settings/profile.tsx](../src/app/(student)/settings/profile.tsx) | Edit profile | `profileApi` via `EditProfileForm` |
| | `/settings/change-password` | [settings/change-password.tsx](../src/app/(student)/settings/change-password.tsx) | Change password | `profileApi` via `ChangePasswordForm` |

## `(parent)` — role `PARENT`

Bottom tabs (`_layout.tsx`): **Dashboard · Academics · Finance · Resources ·
Communication · Profile**.

| Tab | Route | File | Purpose | Data source |
|---|---|---|---|---|
| Dashboard | `/dashboard` | [dashboard/index.tsx](../src/app/(parent)/dashboard/index.tsx) | Multi-child summary dashboard, `ChildSwitcher` | `parentDashboardApi`, `childrenApi` |
| | `/dashboard/my-child` | [dashboard/my-child.tsx](../src/app/(parent)/dashboard/my-child.tsx) | Single-child detail view | `parentDashboardApi` / `childrenApi` |
| Academics | `/academics` | [academics/index.tsx](../src/app/(parent)/academics/index.tsx) | Academics section landing | — |
| | `/academics/results` | [academics/results.tsx](../src/app/(parent)/academics/results.tsx) | Term results for selected child | `parentAcademicsApi` |
| | `/academics/report-card` | [academics/report-card.tsx](../src/app/(parent)/academics/report-card.tsx) | Report card for selected child | `parentAcademicsApi.getChildReportCard` |
| | `/academics/attendance` | [academics/attendance.tsx](../src/app/(parent)/academics/attendance.tsx) | Attendance for selected child | `parentAttendanceApi` |
| | `/academics/assignments` | [academics/assignments.tsx](../src/app/(parent)/academics/assignments.tsx) | Assignments for selected child | `parentAssignmentsApi` |
| Finance | `/finance` | [finance.tsx](../src/app/(parent)/finance.tsx) | Fee status for selected child (no sub-routes — single screen tab) | `parentFeesApi` |
| Resources | `/resources` | [resources.tsx](../src/app/(parent)/resources.tsx) | School + class resources for selected child (single screen tab) | `parentResourcesApi` |
| Communication | `/communication` | [communication/index.tsx](../src/app/(parent)/communication/index.tsx) | Communication section landing | — |
| | `/communication/messages` | [communication/messages.tsx](../src/app/(parent)/communication/messages.tsx) | Conversation list | `parentMessagesApi` |
| | `/communication/conversation/[id]` | [communication/conversation/[id].tsx](<../src/app/(parent)/communication/conversation/[id].tsx>) | Individual conversation thread, send message | `parentMessagesApi` |
| | `/communication/notifications` | [communication/notifications.tsx](../src/app/(parent)/communication/notifications.tsx) | Notification list | `parentNotificationsApi` |
| Profile | `/profile` | [profile/index.tsx](../src/app/(parent)/profile/index.tsx) | Profile landing (→ `MenuList`) | — |
| | `/profile/edit-profile` | [profile/edit-profile.tsx](../src/app/(parent)/profile/edit-profile.tsx) | Edit profile | `profileApi` via `EditProfileForm` |
| | `/profile/change-password` | [profile/change-password.tsx](../src/app/(parent)/profile/change-password.tsx) | Change password | `profileApi` via `ChangePasswordForm` |
| | `/profile/manage-children` | [profile/manage-children.tsx](../src/app/(parent)/profile/manage-children.tsx) | **(stub)** Manage linked children | — |
| | `/profile/notification-preferences` | [profile/notification-preferences.tsx](../src/app/(parent)/profile/notification-preferences.tsx) | **(stub)** Notification preferences | — |
| | `/profile/privacy-settings` | [profile/privacy-settings.tsx](../src/app/(parent)/profile/privacy-settings.tsx) | **(stub)** Privacy settings | — |
| | `/profile/help-support` | [profile/help-support.tsx](../src/app/(parent)/profile/help-support.tsx) | **(stub)** Help & support | — |
| | `/profile/about` | [profile/about.tsx](../src/app/(parent)/profile/about.tsx) | **(stub)** About | — |

Selected-child state (`useSelectedChild`, backed by `selected-child-slice`)
is shared across every parent tab that needs "which child am I looking at" —
`ChildSwitcher` is the only UI for changing it, and it's expected to appear
consistently anywhere a parent screen scopes data to one child.

## Parent/student parity

Per [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md), the parent module
mirrors the student module wherever the domain allows:

| Student | Parent equivalent | Parity |
|---|---|---|
| Learning (subjects/timetable/grades/attendance) | Academics (results/report-card/attendance/assignments) | Partial — parent has no subjects/timetable views, student has no results/report-card split |
| Fees | Finance | Same domain, parent is single-screen vs. student's balance+history split |
| Tasks (assignments/resources) | Academics/assignments + Resources tab | Split differently — parent resources is a top-level tab, student resources is nested under Tasks |
| Communication | Communication | Same shape; parent additionally has a dedicated `conversation/[id]` route, student's messages screen handles conversations inline |
| Settings | Profile | Parent has 5 additional stub screens student doesn't have |

These divergences are intentional per-role differences, not inconsistency —
but worth knowing before assuming a component built for one side will drop
into the other unchanged.

## Related documents

- [API_MAPPING.md](./API_MAPPING.md) — endpoint-level detail per screen.
- [UI_PATTERNS.md](./UI_PATTERNS.md) — the loading/empty/error/refresh
  patterns every screen above should follow.
- [ROADMAP.md](./ROADMAP.md) — stub screens and other known gaps.
