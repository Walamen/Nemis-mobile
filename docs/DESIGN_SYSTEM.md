# NEMIS Mobile — Design System

> This document mirrors the tokens that actually exist in code today. The two
> sources of truth are [`src/theme/index.ts`](../src/theme/index.ts) (JS,
> for anywhere a raw value is needed at runtime) and
> [`src/global.css`](../src/global.css) (the Tailwind v4 `@theme` block, for
> `className` usage). **They must be kept in sync by hand** — Tailwind v4's
> CSS custom properties aren't readable from JS at runtime, so there is no
> single generated source. If you change one, change the other.

This is a refinement reference, not a new palette. Do not add colors outside
this system without updating both files and this document in the same
change.

## 1. Color system

### 1.1 Brand palette (`Palette`, `--color-*`)

The SIS portal brand palette, each with a 50–900 tint/shade ramp:

| Token | Hex | Usage today |
|---|---|---|
| `primary` (500) | `#000e21` | Deep navy — brand anchor, currently underused in UI (see §1.4) |
| `secondary` (500) | `#0367a0` | Primary interactive color — buttons (`bg-secondary`), links (`linkPrimary`) |
| `accent` (500) | `#1874a8` | Reserved accent, adjacent to secondary |
| `neutralDark` | `#000000` | — |
| `neutralLight` | `#e3e3e5` | Same value as `border` |

Each of `primary`, `secondary`, `accent` has `50/100/200/300/400/500/600/700/
800/900` tints defined in both `Palette` and `@theme` (`--color-primary-*`,
etc.). Use the ramp (e.g. `bg-primary-50` for a tinted surface) instead of
hand-mixing opacity on the base color.

### 1.2 Semantic status colors

| Token | Hex | Meaning |
|---|---|---|
| `success` | `#065808` | Positive status (e.g. paid, on-track) |
| `active` | `#146316` | "Active" status badges |
| `pending` | `#a6731c` | Pending/awaiting-action status |
| `warning` | `#a6731c` | **Same hex as `pending`** — see gap below |
| `error` | `#c10021` | Errors, destructive actions, danger text |

> **Known gap:** there is no `info` token, and `warning`/`pending` are
> identical colors serving different semantic purposes. When touching a
> screen that needs a true "informational" or a visually distinct "warning"
> state, flag it rather than inventing a new hex ad hoc — extend `Palette`
> and `@theme` together, matching the existing hue family (ambers/blues
> already in the accent ramp).

### 1.3 Structural colors (light/dark, `Colors.light` / `Colors.dark`)

These are the tokens screens actually consume via `useTheme()`:

| Token | Light | Dark | Usage |
|---|---|---|---|
| `text` | `#000000` | `#ffffff` | Primary text, default `ThemedText` color |
| `background` | `#ffffff` | `#000000` | Screen background (`ThemedView`) |
| `backgroundElement` | `#F0F0F3` | `#212225` | Card/input surface (e.g. `TextField`, `MenuList` rows) |
| `backgroundSelected` | `#E0E1E6` | `#2E3135` | Selected/active row state |
| `textSecondary` | `#60646C` | `#B0B4BA` | Secondary/muted text, placeholders |

Plus one theme-agnostic structural token:

| Token | Hex | Usage |
|---|---|---|
| `border` | `#e3e3e5` | Dividers, outlines (not yet theme-aware — see gap below) |

> **Known gap:** `border` does not have a dark-mode counterpart the way
> `Colors.light`/`Colors.dark` do. On dark screens it will read as
> low-contrast. When polishing a screen with visible dividers/borders in
> dark mode, add a themed border pair to `Colors` rather than hardcoding a
> new gray.

> **Known gap — semantic tokens not yet defined:** `surface`/`card` (use
> `backgroundElement`), `disabled` (use `opacity-60`, e.g. `Button`),
> `placeholder` (use `textSecondary`), `overlay`, `focus`, `hover`,
> `pressed` (use `active:opacity-80`) do not exist as named tokens — they're
> expressed ad hoc via opacity modifiers on existing colors. This is
> acceptable for now; only formalize a token if three or more screens need
> the exact same non-obvious value.

### 1.4 Applying color consistently

- Interactive elements (primary buttons, active links) → `secondary`.
- Brand/deep-navy (`primary`) is not yet used broadly in the UI beyond being
  available — when adding a header, splash, or emphasis surface, prefer it
  over introducing a new dark color.
- Status text/badges → `success` / `pending` / `error` (see gap re:
  `warning`/`info` above).
- Never use raw Tailwind palette colors (`text-red-600`, `bg-gray-100`,
  etc.) for anything the design system already names. `TextField`'s error
  text (`text-red-600`) is a known pre-existing exception — prefer
  `error` (`text-error` / `Palette.error`) in new/touched code.

## 2. Typography

Scale lives in `Typography` (JS) and mirrored `--text-*` tokens (CSS). Only
the tokens below currently have a CSS mirror — `link`, `linkPrimary`, and
`code` are JS-only additions layered on top for `ThemedText`.

| Token | Size | Line height | Weight | Maps to `ThemedText type=` |
|---|---|---|---|---|
| `h1` | 42 | ×1.2 | 700 | `title` |
| `h2` | 32 | ×1.3 | 600 | `subtitle` |
| `h3` | 24 | ×1.4 | 600 | `sectionHeading` |
| `h4` | 20 | ×1.4 | 600 | *(not yet wired to a `ThemedText` type — see gap)* |
| `body` | 16 | ×1.6 | 400 | `default` |
| `small` | 14 | ×1.5 | 400 | `small` |
| `smallBold` | 14 | ×1.5 | 700 | `smallBold` |
| `button` | 15 | ×1.5 | 500 | *(used directly in `Button`, not via `ThemedText`)* |
| `link` | 14 | 30 | — | `link` |
| `linkPrimary` | 14 | 30 | — (color: `secondary`) | `linkPrimary` |
| `code` | 12 | default | 500/700 (Android) | `code` |

> **Known gap:** `Typography.h4` exists in the token set but has no
> corresponding `ThemedText` `type`. If a screen needs a heading between
> `sectionHeading` (h3) and `body`, add a `heading4` type to `ThemedText`
> rather than hardcoding `style={Typography.h4}` inline.

Font family: `Fonts` (platform-selected — SF system fonts on iOS, `Spline
Sans`/`Inter` stack on web via `--font-display`, platform default on
Android). Android has no explicit custom font wired up yet — it falls
through to `default.sans: 'normal'`.

**Usage rule:** always use `<ThemedText type="…">`, never inline
`style={{fontSize: …}}`. If a screen needs a size not in the scale, that's a
signal to extend the scale, not to hardcode a one-off value.

## 3. Spacing

8-point system, defined as named steps in `Spacing` (JS) — Tailwind spacing
classes (`p-4`, `gap-2`, etc.) use Tailwind's own default scale, which is
already 4px-based and compatible:

| Token | px |
|---|---|
| `half` | 2 |
| `one` | 4 |
| `two` | 8 |
| `three` | 16 |
| `four` | 24 |
| `five` | 32 |
| `six` | 64 |

Allowed spacing values project-wide: **4, 8, 12, 16, 20, 24, 32, 40, 48,
64**. There's also one component-specific spacing token, `--spacing-card:
32px` (`@theme`), used as the outer padding for card-shaped containers.

**Usage rule:** use Tailwind spacing utilities (`p-4`, `gap-4`, `px-6`, …)
mapped to the allowed values above. Don't pass arbitrary values
(`p-[13px]`) except for a documented, unavoidable platform-specific reason.

## 4. Border radius

| Token | px | Usage |
|---|---|---|
| `input` (`rounded-input`) | 12 | Text inputs |
| `card` (`rounded-card`) | 16 | Cards, `MenuList` rows |
| `button` (`rounded-button`) | 9999 (full) | Buttons |

> **Known gap:** there is no small/xl radius step — only the three
> component-specific ones above exist. If a new component genuinely needs a
> different radius (e.g. a small chip), add a named token
> (`--radius-chip`/`Radius.chip`) rather than an arbitrary value, and update
> this table.

## 5. Shadows

No JS shadow tokens exist by design: `react-native-css` compiles Tailwind's
`box-shadow` utilities (`shadow-sm`, `shadow-md`, `shadow-lg`) to native
`shadow-*`/`elevation` props, so shadows are applied via `className` only
(see `Button`'s `shadow-sm`). Use Tailwind's standard shadow scale:

| Class | Usage |
|---|---|
| `shadow-sm` | Buttons, subtle card elevation |
| `shadow-md` | Elevated cards, modals/sheets |
| `shadow-lg` | Rare — floating elements above other elevated content |

Cards should default to `shadow-sm`; reserve `shadow-md`/`shadow-lg` for
content that visually floats above the base layer.

## 6. Iconography

Single icon library: `expo-symbols` (`SymbolView`), wrapped by
[`Icon`](../src/components/common/icon.tsx). Do not introduce a second icon
library (no `@expo/vector-icons`, no custom SVG icon set) without updating
this document.

| Size token | px |
|---|---|
| `sm` | 14 |
| `md` | 20 (default) |
| `lg` | 28 |

Color defaults to the current theme's `text` color unless overridden.
`SymbolViewProps['name']` accepts per-platform symbol names
(`{ ios, android, web }`), since SF Symbols don't exist on
Android/web — always provide all three when adding a new icon usage (see
`MenuList`'s `chevron.right` / `chevron_right` mapping).

## 7. Related documents

- [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) — how these tokens are
  consumed by each existing component.
- [UI_PATTERNS.md](./UI_PATTERNS.md) — loading/empty/error patterns built on
  top of these tokens.
