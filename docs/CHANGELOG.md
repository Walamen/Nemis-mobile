# Changelog

All notable changes to NEMIS Mobile. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); entries are grouped by the
commit history in `git log`, summarized rather than reproduced verbatim.

## [Unreleased]

Working tree currently has uncommitted changes on top of `7fc058f`,
consistent with an in-progress UI/branding pass:

- New `src/components/auth/` component set and `src/services/auth-token-storage.ts`.
- App icon/splash assets replaced (`assets/images/icon.svg`,
  `assets/images/splash-screen.jpg` added; several old PNG icons/tab icons
  removed).
- Modifications across auth, parent academics/dashboard/finance screens,
  several API slices, `constants/api.ts`, and shared components
  (`child-switcher`, `animated-icon`, `edit-profile-form`).
- This `docs/` set (blueprint, design system, component catalog, screen
  specs, API mapping, development rules, UI patterns, roadmap) added.

Run `git status` for the exact current diff — this section is a summary,
not a substitute for it, and should be replaced with a dated entry (and
trimmed back to empty) at the next commit.

## 2026-08-10 — `7fc058f` Started with the ui design already

First pass at applying visual/UI design work on top of the existing
student + parent implementation.

## 2026-08-06 — `aadaca6` Add the parent side of the app

Parent module: dashboard, academics (assignments/attendance/report
card/results), finance, communication (messages/notifications/conversation
detail), resources, profile (including the still-stub settings screens),
child-switching. Parent-facing API slices under `src/api/parent/`.

## 2026-08-01 — `99c3313` Have fix the blank screen issue

Bug fix for a blank-screen regression (student portal).

## 2026-07-25 — `0f5a564` Add most of the students side screen of the app

Student module: dashboard, learning (subjects/timetable/grades/attendance),
tasks (assignments/resources), fees (balance/payment history),
communication (messages/notifications), settings (profile/change
password). Student-facing API slices.

## 2026-07-18 — `d91e786` Add the auth and basic student portal logic and screens

Authentication flow (login, token storage, session restoration) and the
initial student portal scaffolding.

## 2026-07-17 — `ea05538` The app setup and a basic login screen

Initial Expo app setup with a first login screen.

## 2026-07-13 — `1295f3f` Initial commit

Project created from the Expo `default` template.

## Related documents

- [ROADMAP.md](./ROADMAP.md) — what's planned next.
- [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md) — current-state overview.
