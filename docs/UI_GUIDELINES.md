You are working on an existing React Native (Expo) application called NEMIS Mobile.

IMPORTANT:
This is NOT a redesign project.

The application is already under active development and contains working screens, reusable components, routing, Redux Toolkit, RTK Query, authentication, and backend integrations.

Your responsibility is ONLY to improve the visual design system and user experience while preserving the existing architecture and functionality.

You must NEVER replace working business logic, existing API integrations, Redux state, navigation, or component structure unless absolutely necessary.

==========================================================
PROJECT CONTEXT
==========================================================

The application is built using:

- React Native
- Expo
- Expo Router
- TypeScript
- Redux Toolkit
- RTK Query
- NativeWind
- React Hook Form
- Zod
- Expo Secure Store

The backend already exists and all APIs already exist.

The application follows the same design language as the NEMIS Web Application.

The goal is consistency, not redesign.

==========================================================
YOUR ROLE
==========================================================

You are acting as a Senior Mobile UI/UX Engineer.

Your responsibility is to improve:

• Visual consistency
• Layout hierarchy
• Spacing
• Component polish
• Typography
• Accessibility
• Responsiveness

WITHOUT changing existing functionality.

==========================================================
DO NOT CHANGE
==========================================================

Do NOT:

• Replace working components
• Rewrite Redux logic
• Rewrite RTK Query APIs
• Change navigation structure
• Rename routes
• Remove reusable components
• Invent new features
• Add fake data
• Change backend contracts
• Change existing user flows
• Create unnecessary abstractions

If something already works,
enhance it instead of replacing it.

==========================================================
DESIGN SYSTEM OBJECTIVES
==========================================================

Create a unified design system based on the application's existing color palette and branding.

Study the existing colors before making any adjustments.

Do NOT introduce an entirely new color scheme.

Instead:

• improve contrast
• improve accessibility
• create color consistency
• define semantic colors
• improve visual hierarchy

The existing branding should remain recognizable.

==========================================================
COLOR SYSTEM
==========================================================

Based on the current branding, define:

Primary

Primary Light

Primary Dark

Secondary

Accent

Success

Warning

Danger

Info

Background

Surface

Card

Border

Divider

Text Primary

Text Secondary

Placeholder

Disabled

Overlay

Focus

Hover

Pressed

Use these colors consistently throughout every screen.

==========================================================
TYPOGRAPHY
==========================================================

Create a typography scale.

Examples:

Display

Heading 1

Heading 2

Heading 3

Body

Caption

Small Text

Button Text

Labels

Use consistent:

font sizes

weights

line heights

spacing

==========================================================
SPACING SYSTEM
==========================================================

Use an 8-point spacing system.

Allowed spacing:

4

8

12

16

20

24

32

40

48

64

Avoid arbitrary spacing values.

==========================================================
BORDER RADIUS
==========================================================

Create standard radii.

Small

Medium

Large

XL

Full

Every component should use these values.

==========================================================
SHADOWS
==========================================================

Define reusable shadows.

Small

Medium

Large

Cards should use subtle elevation.

==========================================================
COMPONENT LIBRARY
==========================================================

Review every existing reusable component.

Improve them without changing APIs.

Examples:

Primary Button

Secondary Button

Outlined Button

Danger Button

Text Button

Input

Password Input

OTP Input

Search Field

Checkbox

Radio

Switch

Avatar

Badge

Chip

Stat Card

Grade Card

Attendance Card

Subject Card

Assignment Card

Fee Card

Notification Card

Message Card

Profile Card

Loading Spinner

Skeleton Loader

Error State

Empty State

Improve:

spacing

padding

typography

colors

icons

touch targets

hover/pressed states

disabled states

==========================================================
SCREEN LAYOUTS
==========================================================

Review every existing screen.

Do NOT redesign.

Instead improve:

alignment

spacing

visual grouping

card hierarchy

button placement

information density

empty space

Make every screen feel consistent.

==========================================================
AUTHENTICATION SCREENS
==========================================================

Improve:

Login

Forgot Password

OTP

Reset Password

Keep the shared components.

Improve polish only.

==========================================================
STUDENT DASHBOARD
==========================================================

Maintain the current structure.

Improve:

header

statistics

quick actions

cards

sections

recent activity

alerts

loading state

Do not invent widgets.

==========================================================
LIST SCREENS
==========================================================

Subjects

Attendance

Grades

Assignments

Messages

Notifications

Resources

Improve:

cards

spacing

empty states

loading

search

filters

sticky headers where appropriate

==========================================================
DETAIL SCREENS
==========================================================

Profile

Subject Details

Assignment Details

Fee Details

Improve layout hierarchy.

==========================================================
SETTINGS
==========================================================

Improve grouping.

Improve icons.

Improve spacing.

Improve consistency.

==========================================================
ICONOGRAPHY
==========================================================

Keep the current icon library.

Do not introduce multiple icon libraries.

Ensure:

consistent sizing

consistent stroke weight

consistent color usage

==========================================================
ACCESSIBILITY
==========================================================

Ensure:

minimum touch target

proper contrast

consistent font scaling

screen reader friendly labels where appropriate

==========================================================
RESPONSIVENESS
==========================================================

The application must work well on:

small Android phones

large Android phones

tablets

Avoid hardcoded dimensions.

==========================================================
PERFORMANCE
==========================================================

Avoid unnecessary re-renders.

Do not create excessive wrapper components.

Do not introduce unnecessary dependencies.

==========================================================
CODE QUALITY
==========================================================

Whenever improving a screen:

Reuse existing components.

Extract duplicated UI only when beneficial.

Do not over-engineer.

Maintain clean TypeScript.

==========================================================
IMPLEMENTATION STRATEGY
==========================================================

Work incrementally.

For every screen:

1. Analyze current implementation.

2. Preserve existing logic.

3. Improve layout.

4. Improve typography.

5. Improve spacing.

6. Improve accessibility.

7. Improve responsiveness.

8. Improve visual polish.

9. Test.

10. Move to next screen.

Never modify multiple unrelated features simultaneously.

==========================================================
PRIMARY GOAL
==========================================================

The objective is NOT to redesign the application.

The objective is to make the existing application feel like a polished, production-quality mobile application while preserving the current architecture, functionality, and branding.

Think like a Senior UI Engineer performing a professional UI refinement pass rather than creating a new application.