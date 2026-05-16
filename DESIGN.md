# Design

## Theme

Light mode default. Dark mode via `.dark` class. Grayscale-forward palette with semantic colors for feedback states.

### Light Theme Scene

Office or home office, desk environment, ambient overhead lighting. Clean, professional, no-nonsense. User is focused on getting work done, not admiring the interface.

### Dark Theme Scene

Evening work, dim room, screen is the primary light source. Reduced eye strain, high contrast for readability. User may be in flow state for extended periods.

## Color Palette

### Neutral Scale (grayscale)

- Uses Tailwind's neutral palette (`neutral-50` through `neutral-950`)
- Foreground text: `neutral-800` (light) / `neutral-100` (dark)
- Background: `white` (light) / `neutral-950` at 96% (dark)
- Borders: black at 8% opacity (light) / white at 6% (dark)
- Muted surfaces: black at 4% (light) / white at 4% (dark)

### Semantic Colors

| Role | Light | Dark |
|------|-------|------|
| Success | `emerald-500` | `emerald-500` |
| Warning | `amber-500` | `amber-500` |
| Error/Destructive | `red-500` | `red-500` at 90% mix |
| Info | `blue-500` | `blue-500` |

### Chart Colors

- `chart-1`: `orange-600` / `blue-700`
- `chart-2`: `teal-600` / `emerald-500`
- `chart-3`: `cyan-900` / `amber-500`
- `chart-4`: `amber-400` / `purple-500`
- `chart-5`: `amber-500` / `rose-500`

## Typography

### Font Stack

- **Body**: `"Cal Sans UI"`, system-ui fallback. Weight range 300-700.
- **Headings**: `"Cal Sans Heading"`, 600 weight only.
- **Code/Mono**: `"Paper Mono"`, 400 weight.

### Scale

- Body: ~0.95rem (15px), line-height ~1.7
- Headings: 1.02rem-1.24rem, tighter line-height ~1.26, letter-spacing -0.02em

### Heading Hierarchy

- h1: 1.24rem, semibold
- h2: 1.12rem, semibold
- h3: 1.02rem, semibold

## Spacing & Layout

### Base Unit

- Tailwind default (1 unit = 0.25rem / 4px)
- Radius: `0.625rem` (10px) base
  - sm: calc(radius - 4px) = 6px
  - md: calc(radius - 2px) = 8px
  - lg: 10px
  - xl: calc(radius + 4px) = 14px

### Sidebar

- Dedicated color variables for sidebar context
- Light: `neutral-50` background
- Dark: `neutral-950` at 97%

### Motion

- Skeleton animation: 2s duration, linear timing
- Transitions: 0.12s-0.18s ease for interactive elements
- No bounce or elastic curves

## Components

### Design System

- Radix UI primitives (headless accessibility)
- Custom styling via Tailwind CSS v4
- No pre-built component library (hand-rolled components)

### Component Patterns

- Border radius: consistent 0.45-0.6rem range
- Interactive states: border color shift, subtle background tint
- Focus: ring-based with color-mix for subtle visibility
- Cards: white background, subtle border, no shadow by default

### Editor Components (TiPtap)

- Bubble menu, slash menu, markdown support
- Task lists with checkbox integration
- Code blocks with syntax highlighting
- Embedded content (links, images, tables)

## Accessibility

- `outline-ring/50` for focus states
- Scrollbar styling with thin width
- Respects `prefers-reduced-motion` via animation definitions
- Contrast ratios meet WCAG AA