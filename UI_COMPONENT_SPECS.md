# UI Component Specifications

## Layout Grid

```
Desktop (>1024px):
┌────────────────────────────────────────────────┐
│  Header (Full Width - Sticky)                  │
│  h: 96px, bg: white, border-b                 │
├────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┬────────────────────────────────┐ │
│  │ Sidebar  │  Main Content                  │ │
│  │ 3/12     │  9/12                          │ │
│  │ cols     │  cols                          │ │
│  │          │                                │ │
│  │ Sticky   │  Scrollable                    │ │
│  │ top-6    │                                │ │
│  └──────────┴────────────────────────────────┘ │
│                                                 │
└────────────────────────────────────────────────┘
```

## Color Palette

```css
/* Backgrounds */
--bg-page: #F9FAFB;        /* gray-50 */
--bg-card: #FFFFFF;        /* white */
--bg-selected: #111827;    /* gray-900 */

/* Status Colors */
--status-completed-bg: #D1FAE5;     /* green-100 */
--status-completed-text: #065F46;   /* green-700 */
--status-progress-bg: #DBEAFE;      /* blue-100 */
--status-progress-text: #1E40AF;    /* blue-700 */
--status-blocked-bg: #FEE2E2;       /* red-100 */
--status-blocked-text: #991B1B;     /* red-700 */
--status-pending-bg: #E5E7EB;       /* gray-200 */
--status-pending-text: #374151;     /* gray-700 */

/* Text Colors */
--text-primary: #111827;    /* gray-900 */
--text-secondary: #6B7280;  /* gray-500 */
--text-tertiary: #9CA3AF;   /* gray-400 */

/* Borders */
--border-light: #E5E7EB;    /* gray-200 */
--border-medium: #D1D5DB;   /* gray-300 */
--border-dark: #111827;     /* gray-900 */
```

## Typography

```css
/* Headers */
h1 { font-size: 24px; font-weight: 700; line-height: 32px; }  /* Project title */
h2 { font-size: 24px; font-weight: 700; line-height: 32px; }  /* Milestone name */
h3 { font-size: 18px; font-weight: 600; line-height: 28px; }  /* Section titles */
h4 { font-size: 16px; font-weight: 500; line-height: 24px; }  /* Card titles */

/* Body Text */
.body-base { font-size: 14px; line-height: 20px; }
.body-sm { font-size: 12px; line-height: 16px; }
.body-xs { font-size: 11px; line-height: 16px; }
```

## Spacing System

```css
/* Padding/Margin Scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

## Component Specs

### Header
```css
.header {
  height: 96px;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 10;
}
```

### Sidebar
```css
.sidebar {
  grid-column: span 3;
  padding: 24px;
  position: sticky;
  top: 24px;
  height: fit-content;
}

.sidebar-button {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.sidebar-button:hover {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### Milestone Card (Sidebar)
```css
.milestone-card {
  padding: 12px;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.milestone-card:hover {
  border-color: var(--border-medium);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.milestone-card.selected {
  border-color: var(--border-dark);
  background: var(--bg-selected);
  color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Milestone Details Card
```css
.milestone-details {
  padding: 24px;
  border-radius: 8px;
  background: white;
  border: 1px solid var(--border-light);
}

.milestone-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
```

### Deliverable Card
```css
.deliverable-card {
  padding: 16px;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deliverable-card:hover {
  border-color: var(--border-medium);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.deliverable-card.selected {
  border-color: #3B82F6; /* blue-500 */
  background: #EFF6FF;   /* blue-50 */
}
```

### Task Card
```css
.task-card {
  padding: 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: white;
}

.task-card:hover {
  border-color: var(--border-medium);
}
```

### Status Badge
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.small {
  font-size: 11px;
  padding: 2px 6px;
}

.status-badge.selected {
  /* Uses selectedBg/selectedText colors */
}
```

## Animation Specs

```css
/* Transitions */
.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.2s ease;
}

.transition-all {
  transition: all 0.2s ease;
}

/* Framer Motion Variants */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2 }
}
```

## Shadow System

```css
/* Elevation Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

/* Usage */
.card { box-shadow: var(--shadow-sm); }
.card-hover { box-shadow: var(--shadow-md); }
.modal { box-shadow: var(--shadow-xl); }
```

## Border Radius

```css
--radius-sm: 4px;   /* Small elements */
--radius-md: 6px;   /* Badges, chips */
--radius-lg: 8px;   /* Cards, buttons */
--radius-xl: 12px;  /* Large cards */
--radius-2xl: 16px; /* Modals */
```

## Icon Sizes

```css
--icon-xs: 12px;   /* Small badges */
--icon-sm: 14px;   /* Status badges */
--icon-md: 16px;   /* Buttons, cards */
--icon-lg: 20px;   /* Headers */
--icon-xl: 24px;   /* Empty states */
```

## Button Variants

### Primary
```css
.btn-primary {
  background: #111827;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary:hover {
  background: #1F2937;
}
```

### Outline
```css
.btn-outline {
  background: transparent;
  border: 1px solid #E5E7EB;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
}

.btn-outline:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}
```

### Ghost
```css
.btn-ghost {
  background: transparent;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
}

.btn-ghost:hover {
  background: #F3F4F6;
}
```

## Empty States

```css
.empty-state {
  padding: 96px 0;
  text-align: center;
  color: #9CA3AF;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  opacity: 0.3;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
  margin-bottom: 24px;
}
```

## Loading States

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F3F4F6 25%,
    #E5E7EB 50%,
    #F3F4F6 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Breakpoints

```css
/* Tailwind Breakpoints */
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;

/* Usage in Grid */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { grid-column: span 12; }
}
```

## Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 10;
--z-sticky: 20;
--z-modal-backdrop: 40;
--z-modal: 50;
--z-tooltip: 60;
--z-notification: 70;
```

## Focus States

```css
.focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible,
a:focus-visible {
  @apply focus-visible;
}
```

---

**These specs ensure consistency across the entire application.**
