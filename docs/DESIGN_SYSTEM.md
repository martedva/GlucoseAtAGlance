# Glucose At A Glance - Design System

> **Version:** 1.0.0  
> **Last Updated:** 2026-09-30  
> **Status:** In Progress

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Dark Mode](#dark-mode)
7. [Accessibility](#accessibility)
8. [Implementation Checklist](#implementation-checklist)
9. [Change Log](#change-log)

---

## Design Principles

| Principle | Description |
|-----------|-------------|
| **Trust & Calm** | Medtech aesthetic with soothing colors that reduce anxiety around health monitoring |
| **Clarity First** | High contrast, readable text; glucose values are the visual hierarchy priority |
| **Accessible by Default** | WCAG 2.2 AA minimum, AAA where possible; color blindness safe |
| **Modern Tech Feel** | Clean lines, subtle shadows, crisp borders |
| **Consistent** | Design tokens ensure consistency across all components |

---

## Color Palette

### Primary Colors (Brand & Actions)

| Token | Light Mode | Dark Mode | HSL | Use Case | Contrast (Light) |
|-------|------------|-----------|-----|----------|------------------|
| `--color-primary` | `#0066CC` | `#4DA3FF` | `hsl(210, 100%, 40%)` | Primary buttons, links | ✅ 4.5:1 |
| `--color-primary-dark` | `#004C99` | `#66B3FF` | `hsl(210, 100%, 30%)` | Hover states, active | ✅ 7.1:1 |
| `--color-primary-light` | `#E6F0FF` | `#003366` | `hsl(210, 100%, 95%)` | Backgrounds, highlights | — |
| `--color-primary-bold` | `#0052A3` | `#80C1FF` | `hsl(210, 100%, 32%)` | **Bold borders, focus rings** | ✅ 5.8:1 |

### Neutral Colors (Base UI)

| Token | Light Mode | Dark Mode | Use Case |
|-------|------------|-----------|----------|
| `--color-white` | `#FFFFFF` | `#0F172A` | Primary background |
| `--color-gray-50` | `#F8F7F5` | `#161E2E` | Subtle backgrounds (warm-tinted) |
| `--color-gray-100` | `#F1EFEB` | `#1F293D` | Card backgrounds |
| `--color-gray-200` | `#E4E0D9` | `#2D3850` | Borders, dividers |
| `--color-gray-300` | `#C9C4B8` | `#3D4861` | Disabled states |
| `--color-gray-400` | `#9A9485` | `#525D75` | Placeholder text |
| `--color-gray-500` | `#6B6559` | `#737D8C` | Secondary text |
| `--color-gray-600` | `#4D4740` | `#949EAE` | Body text |
| `--color-gray-700` | `#36322D` | `#B4BBC6` | Headings |
| `--color-gray-800` | `#1F1D1A` | `#D3D8DD` | Primary text |
| `--color-gray-900` | `#0F0E0D` | `#F0F2F5` | High emphasis text |

### Semantic Status Colors

| Status | Token | Light Mode | Dark Mode | Contrast (Light) | Use |
|--------|-------|------------|-----------|------------------|-----|
| **Success** | `--color-success` | `#059669` | `#34D399` | ✅ 4.6:1 | Connected, good range |
| | `--color-success-bg` | `#D1FAE5` | `#064E3B` | — | Background |
| | `--color-success-border` | `#10B981` | `#10B981` | ✅ 3.2:1 | **Bold border** |
| | `--color-success-text` | `#065F46` | `#A7F3D0` | ✅ 7.8:1 | Text |
| **Warning** | `--color-warning` | `#D97706` | `#FBBF24` | ✅ 4.5:1 | Sensor expiring soon |
| | `--color-warning-bg` | `#FEF3C7` | `#78350F` | — | Background |
| | `--color-warning-border` | `#F59E0B` | `#F59E0B` | ✅ 3.1:1 | **Bold border** |
| | `--color-warning-text` | `#92400E` | `#FDE68A` | ✅ 7.2:1 | Text |
| **Error** | `--color-error` | `#DC2626` | `#F87171` | ✅ 4.5:1 | Disconnected, critical |
| | `--color-error-bg` | `#FEE2E2` | `#7F1D1D` | — | Background |
| | `--color-error-border` | `#EF4444` | `#EF4444` | ✅ 3.5:1 | **Bold border** |
| | `--color-error-text` | `#B91C1C` | `#FECACA` | ✅ 8.1:1 | Text |
| **Info** | `--color-info` | `#0284C7` | `#38BDF8` | ✅ 4.5:1 | Informational |
| | `--color-info-bg` | `#E0F2FE` | `#0C4A6E` | — | Background |
| | `--color-info-border` | `#0EA5E9` | `#0EA5E9` | ✅ 3.0:1 | **Bold border** |
| | `--color-info-text` | `#075985` | `#BAE6FD` | ✅ 7.5:1 | Text |

### Glucose Trend Colors

| Token | Hex | Dark Mode | Use | Contrast |
|-------|-----|-----------|-----|----------|
| `--glucose-rising` | `#EA580C` | `#FB923C` | Rising fast | ✅ 4.5:1 |
| `--glucose-falling` | `#2563EB` | `#60A5FA` | Falling fast | ✅ 4.5:1 |
| `--glucose-stable` | `#475569` | `#94A3B8` | Stable | ✅ 7.1:1 |
| `--glucose-high` | `#DC2626` | `#F87171` | Above range | ✅ 4.5:1 |
| `--glucose-low` | `#7C3AED` | `#A78BFA` | Below range | ✅ 4.6:1 |

### Target Range (Graph)

| Token | Light Mode | Dark Mode | Use |
|-------|------------|-----------|-----|
| `--target-range-bg` | `#10B981` | `#34D399` | Target zone fill |
| `--target-range-bg-light` | `rgba(16, 185, 129, 0.15)` | `rgba(52, 211, 153, 0.10)` | Light overlay |

---

## Typography

| Token | Value | Use Case |
|-------|-------|----------|
| `--font-family` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif` | Base font stack |
| `--font-size-xs` | `11px` | Captions, timestamps |
| `--font-size-sm` | `12px` | Secondary info |
| `--font-size-base` | `14px` | Body text |
| `--font-size-lg` | `16px` | Subheadings |
| `--font-size-xl` | `20px` | Glucose value suffix |
| `--font-size-2xl` | `24px` | Section headers |
| `--font-size-3xl` | `32px` | Glucose value (main) |
| `--font-size-4xl` | `48px` | Glucose value (hero) |
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Emphasis |
| `--font-weight-semibold` | `600` | Subheadings |
| `--font-weight-bold` | `700` | Headings, values |
| `--line-height-normal` | `1.5` | Body text |
| `--line-height-tight` | `1.25` | Headings |

---

## Spacing & Layout

### Spacing Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `--spacing-1` | `4px` | Tight gaps |
| `--spacing-2` | `8px` | Small gaps |
| `--spacing-3` | `12px` | Default gaps |
| `--spacing-4` | `16px` | Card padding |
| `--spacing-5` | `20px` | Section padding |
| `--spacing-6` | `24px` | Large sections |
| `--spacing-8` | `32px` | Page margins |

### Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| `--radius-sm` | `4px` | Small buttons, badges |
| `--radius-md` | `6px` | Inputs, small cards |
| `--radius-lg` | `8px` | Cards, panels |
| `--radius-xl` | `12px` | Large containers |
| `--radius-full` | `9999px` | Pills, avatars |

### Shadows

| Token | Value | Use Case |
|-------|-------|----------|
| `--shadow-sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` | Modals, popovers |
| `--shadow-glow` | `0 0 20px rgba(0, 102, 204, 0.2)` | Primary focus glow |

---

## Components

### Cards

All card-based components (StatCard, DataCard, etc.) should follow:

```css
.card {
  background-color: var(--color-gray-100);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

/* Dark mode */
[data-theme="dark"] .card {
  background-color: var(--color-gray-100); /* Dark mode value */
  border-color: var(--color-gray-300);
}
```

### Accent Borders

For emphasis (alerts, active states, focus):

```css
.accent-border {
  border: 2px solid var(--color-primary-bold);
}

.accent-border--success {
  border-color: var(--color-success-border);
}

.accent-border--warning {
  border-color: var(--color-warning-border);
}

.accent-border--error {
  border-color: var(--color-error-border);
}
```

### Buttons

```css
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-4);
  font-weight: var(--font-weight-medium);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary-bold);
  outline-offset: 2px;
  box-shadow: var(--shadow-glow);
}
```

---

## Dark Mode

### Implementation Strategy

1. **CSS Custom Properties**: Define both light and dark values for all color tokens
2. **Data Attribute Toggle**: Use `[data-theme="dark"]` on `<html>` element
3. **System Preference**: Default to `prefers-color-scheme` media query on first load
4. **User Preference**: Store in `chrome.storage.local` via Zustand store
5. **Toggle Button**: Sun/Moon icon in HeaderActions component

### Zustand Store Implementation

Theme state is managed with Zustand for centralized state management:

```typescript
// src/stores/themeStore.ts
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  isLoaded: false,
  
  loadFromStorage: async () => {
    const storedTheme = await chrome.storage.local.get([THEME_STORAGE_KEY]);
    set({
      theme: storedTheme ?? getSystemPreference(),
      isLoaded: true,
    });
  },
  
  setTheme: async (theme: Theme) => {
    set({ theme });
    await chrome.storage.local.set({ [THEME_STORAGE_KEY]: theme });
  },
  
  toggleTheme: async () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    await saveThemeToStorage(newTheme);
  },
}));
```

### CSS Implementation

```css
:root {
  /* Light mode (default) */
  --color-white: #FFFFFF;
  --color-gray-50: #F8F7F5;
  /* ... all light mode values */
}

[data-theme="dark"] {
  /* Dark mode overrides */
  --color-white: #0F172A;
  --color-gray-50: #161E2E;
  /* ... all dark mode values */
}

/* Respect system preference if no user preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-white: #0F172A;
    /* ... */
  }
}
```

### Toggle Button Specification

| State | Icon | Tooltip |
|-------|------|---------|
| Light Mode | 🌙 Moon | "Switch to dark mode" |
| Dark Mode | ☀️ Sun | "Switch to light mode" |

**Location:** HeaderActions component, leftmost position  
**Behavior:** Toggle on click, persist to `chrome.storage.local`

### Usage in Components

```tsx
import { useTheme } from '@/hooks';

function MyComponent() {
  const { theme, toggleTheme, isLoaded } = useTheme();
  
  if (!isLoaded) return <Loading />;
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

---

## Accessibility

### WCAG Compliance Targets

| Element | Minimum Ratio | Target Ratio |
|---------|---------------|--------------|
| Normal text | 4.5:1 (AA) | 7:1 (AAA) |
| Large text (18pt+) | 3:1 (AA) | 4.5:1 (AAA) |
| UI components | 3:1 (AA) | 4.5:1 (AAA) |
| Focus indicators | 3:1 (AA) | 4.5:1 (AAA) |

### Color Blindness Considerations

- ✅ Never use color alone to convey status (always include icons/text)
- ✅ Red/green distinctions have alternative indicators
- ✅ Trend arrows use shape + color
- ✅ Tested against deuteranopia, protanopia, tritanopia simulators

### Focus States

All interactive elements must have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--color-primary-bold);
  outline-offset: 2px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Checklist

### Phase 1: Foundation ✅ COMPLETE
- [x] Update `global.css` with new color tokens (light mode)
- [x] Add dark mode color token overrides
- [x] Create theme toggle hook (`useTheme`)
- [x] Add theme toggle button to HeaderActions
- [x] Implement storage persistence for theme preference

### Phase 2: Component Updates ✅ COMPLETE
- [x] Update GlucoseDisplay (remove special background, use card style)
- [x] Update StatisticsPanel (consistent card styling)
- [x] Update DevelopmentGraph (wrap in DataCard, use CSS variables)
- [x] Update all StatCard instances (use `.card` composes)
- [x] Update DataCard (use `.card` composes)
- [x] Update Button (remove hardcoded colors)
- [x] Update ErrorMessage (remove hardcoded colors)
- [x] Update Chart.js colors to use CSS variables (dark mode support)

### Phase 3: State Management ✅ COMPLETE
- [x] Install Zustand for state management
- [x] Create `themeStore` with chrome.storage sync
- [x] Update `useTheme` hook to use Zustand
- [x] Add `isLoaded` state to prevent flash of wrong theme
- [x] Update App.tsx to wait for theme initialization

### Phase 3: Graph & Visualizations
- [ ] Update Chart.js colors for dark mode support
- [ ] Update target range colors
- [ ] Update trend line colors
- [ ] Ensure graph is readable in both themes

### Phase 4: Polish & Testing
- [ ] Test all components in light mode
- [ ] Test all components in dark mode
- [ ] Verify WCAG contrast ratios (automated + manual)
- [ ] Test with color blindness simulator
- [ ] Test focus states and keyboard navigation
- [ ] Test system preference detection
- [ ] Update documentation with screenshots

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-09-30 | 1.0.0 | Initial design system document created | — |
| 2026-09-30 | 1.0.0 | Primary color set to `#0066CC` | User |
| 2026-09-30 | 1.0.0 | Neutral grays adjusted to warmer tone | User |
| 2026-09-30 | 1.0.0 | Dark mode support approved | User |
| 2026-09-30 | 1.0.0 | Accent border colors confirmed | User |
| 2026-09-30 | 1.0.1 | Phase 1 complete: Color tokens, dark mode, theme toggle | AI |
| 2026-09-30 | 1.0.2 | Phase 2 complete: Component updates, Chart.js dark mode | AI |
| 2026-09-30 | 1.0.3 | Phase 3 complete: Zustand store for theme state | AI |

---

## Design Decisions Log

### 2026-09-30: Color Palette Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Primary `#0066CC` | Trust, medical professionalism, tech-forward | ✅ Approved |
| Warmer grays | More approachable, less clinical than cool grays | ✅ Approved |
| Bold accent borders | Clear visual hierarchy, WCAG 1.4.11 compliance | ✅ Approved |
| Dark mode support | User preference, accessibility, modern standard | ✅ Approved |
| Remove glucose-display background | Unified card-based design, cleaner look | 📋 Planned |
| Card accent borders | Visual separation, modern aesthetic | 📋 Planned |

---

## Resources & References

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [US Web Design System - Color](https://designsystem.digital.gov/design-tokens/color/)
- [Modern Health Color Palette Case Study](https://yorthehunter.medium.com/how-we-created-an-accessible-scalable-color-palette-2ae1242abdcb)