@AGENTS.md

# CLAUDE.md

# NEMIS Student & Parent Mobile Application

This file contains the working instructions for Claude Code. It complements the project's Software Architecture, Development Blueprint & Implementation Guide and should be followed for every task.

---

# Primary Rule

The architecture document is the single source of truth for the project.

Do not rewrite, replace, or deviate from it unless explicitly instructed.

If implementation details are unclear, ask for clarification instead of making assumptions.

---

# Project Goal

Develop a production-ready React Native application using Expo that integrates with the existing NEMIS backend while maintaining a clean, scalable, secure, and maintainable architecture.

This project serves:

- Students
- Parents

The parent module should closely mirror the student experience where applicable while respecting differences in functionality and permissions. Before implementing any parent feature, inspect the existing student implementation and reuse the same architectural patterns whenever possible.

---

# Development Workflow

For every task:

1. Read the request completely.
2. Inspect the existing implementation.
3. Search the project for reusable components.
4. Search for reusable hooks.
5. Search for reusable services.
6. Search for reusable API endpoints.
7. Identify all affected files.
8. Produce a short implementation plan.
9. Implement the feature.
10. Verify TypeScript.
11. Verify linting.
12. Verify navigation.
13. Verify responsiveness.
14. Summarize completed work.

Never begin coding immediately.

---

# Project Initialization

Use the official Expo tooling.

Project creation:

```bash
npx create-expo-app@latest --template default@sdk-57
```

Install the official Claude Expo plugin:

```bash
/plugin install expo@claude-plugins-official
```

Install Expo skills:

```bash
npx skills add expo/skills
```

Always follow the latest official Expo documentation before implementing Expo-specific functionality.

---

# Architecture Rules

Maintain strict separation between:

- UI
- Business Logic
- API
- State
- Utilities

Business logic should never live inside screen components.

Avoid large screen files.

Split reusable logic into:

- hooks
- services
- utilities
- reusable components

---

# Folder Rules

Respect the existing folder structure.

Do not create unnecessary folders.

Before creating a new file:

- Search for an existing implementation.
- Extend existing modules whenever appropriate.
- Avoid duplicate components.

---

# Component Rules

Components should be:

- reusable
- configurable
- typed
- accessible
- responsive

Avoid component duplication.

If a component becomes too large, recommend splitting it.

---

# Screen Rules

Each screen should contain:

- Loading state
- Empty state
- Error state
- Pull-to-refresh where appropriate
- Skeleton loading for long requests

Avoid putting business logic inside screens.

---

# API Rules

The backend already exists.

Never recreate backend logic.

Consume existing APIs only.

Before creating a new endpoint:

- verify it doesn't already exist
- reuse existing services

Never hardcode URLs.

Always use centralized API configuration.

---

# State Management

Use:

- Redux Toolkit
- RTK Query

Avoid manual fetch requests unless absolutely necessary.

Avoid duplicate server state.

Use RTK Query caching whenever possible.

---

# Authentication

Authentication must remain secure.

Always use:

- Expo Secure Store

Never store authentication tokens in AsyncStorage.

Handle:

- login
- logout
- session restoration
- expired tokens
- unauthorized requests

---

# Forms

Use:

- React Hook Form
- Zod

Every form should include:

- validation
- loading state
- error handling
- success handling

---

# Styling

Use:

- NativeWind

Avoid inline styles.

Keep spacing consistent.

Use shared theme values.

---

# Performance

Always consider:

- unnecessary renders
- expensive computations
- duplicated API calls
- oversized FlatLists
- image optimization

Use:

- React.memo
- useMemo
- useCallback

only when appropriate.

Avoid premature optimization.

---

# Security

Never weaken security.

Protect:

- authentication
- authorization
- API communication
- secure storage

Never expose:

- secrets
- API keys
- tokens

Do not log sensitive information.

---

# Error Handling

Every feature should gracefully handle:

- loading
- empty data
- validation errors
- API errors
- network failures

Avoid silent failures.

---

# Parent Module

The parent module should reuse as much of the student architecture as possible.

Before implementing a parent screen:

1. Locate the equivalent student screen.
2. Reuse shared components.
3. Reuse layouts.
4. Reuse hooks where appropriate.
5. Only create parent-specific logic where required.

Avoid maintaining two independent implementations of identical functionality.

---

# Code Quality

Maintain:

- strict TypeScript
- clean imports
- meaningful naming
- small functions
- reusable code

Avoid:

- dead code
- duplicated code
- commented-out code
- unused imports
- magic numbers

Remove debugging statements before completing tasks.

---

# Refactoring

While working:

- improve readability where practical
- preserve existing behavior
- avoid unnecessary rewrites

If unrelated technical debt is discovered:

Document it instead of fixing it unless it blocks the task.

---

# Git

Keep changes focused.

One task = one logical set of changes.

Avoid modifying unrelated files.

Keep commits clean and meaningful.

---

# Documentation

Document architectural decisions when introducing:

- reusable hooks
- shared services
- utilities
- navigation changes
- state management changes

Keep comments concise and useful.

---

# Reporting

After every completed task provide:

## Summary

What was implemented.

## Files Changed

List every modified file.

## Architecture Impact

Explain how the implementation fits into the project.

## Risks

Potential issues.

## Recommendations

Optional improvements.

---

# Decision Making

When multiple implementation options exist:

Choose the one that is:

- simplest
- scalable
- maintainable
- consistent with the existing architecture

Do not over-engineer solutions.

---

# Priority Order

When making technical decisions, prioritize:

1. Correctness
2. Security
3. Maintainability
4. Reusability
5. Performance
6. Developer Experience

---

# Final Rule

Treat this project as a long-term enterprise application.

Every implementation should be production-ready, thoroughly considered, and aligned with the architecture document.

If uncertain, stop and ask rather than making assumptions.