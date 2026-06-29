# Design System Quick Reference

## Colors

### Primary Brand (Green)

```
50: #f0fdf4  |  100: #dcfce7  |  200: #bbf7d0  |  300: #86efac
400: #4ade80 |  500: #22c55e  |  600: #16a34a  |  700: #15803d
```

### Secondary (Purple)

```
50: #f5f3ff  |  100: #ede9fe  |  200: #ddd6fe  |  300: #c4b5fd
400: #a78bfa |  500: #8b5cf6  |  600: #7c3aed  |  700: #6d28d9
```

### Accent (Teal)

```
50: #f0fdfa  |  100: #ccfbf1  |  200: #99f6e4  |  300: #5eead4
400: #2dd4bf |  500: #14b8a6  |  600: #0d9488  |  700: #0f766e
```

### Semantic

```
Success: #10b981   |  Warning: #f59e0b   |  Error: #ef4444   |  Info: #3b82f6
```

## Component Imports

### Buttons

```tsx
import StyledButton from '@/components/ui/StyledButton';

// Usage
<StyledButton variant="primary" size="md">Click me</StyledButton>
<StyledButton variant="secondary" isLoading={loading} size="lg">Loading...</StyledButton>
<StyledButton variant="outline" leftIcon={<Icon />}>With Icon</StyledButton>
```

### Cards

```tsx
import StyledCard from '@/components/ui/StyledCard';

// Usage
<StyledCard variant="default">Default card</StyledCard>
<StyledCard variant="interactive">Clickable card</StyledCard>
<StyledCard variant="hover">Hoverable card</StyledCard>
```

### Badges

```tsx
import StyledBadge from '@/components/ui/StyledBadge';

// Usage
<StyledBadge variant="success">Active</StyledBadge>
<StyledBadge variant="warning" size="lg">Important</StyledBadge>
<StyledBadge icon={<Icon />}>With Icon</StyledBadge>
```

### Animations

```tsx
import {
  FadeInMotion,
  FadeInUpMotion,
  ScaleInMotion,
  StaggerContainer,
  StaggerItem
} from '@/components';

// Simple animations
<FadeInMotion><div>Fades in</div></FadeInMotion>
<ScaleInMotion delay={0.2}><div>Scales in</div></ScaleInMotion>

// List animations
<StaggerContainer>
  {items.map(item => (
    <StaggerItem key={item.id}><div>{item}</div></StaggerItem>
  ))}
</StaggerContainer>
```

## CSS Variables

### Colors

```css
--color-primary-600: #16a34a --color-secondary-500: #8b5cf6
  --color-accent-400: #2dd4bf --color-neutral-900: #111827;
```

### Theme

```css
--bg-primary: var(--color-neutral-0) /* Main background */
  --bg-secondary: var(--color-neutral-50) /* Secondary background */
  --text-primary: var(--color-neutral-900) /* Main text */
  --text-secondary: var(--color-neutral-600) /* Secondary text */
  --border-color: var(--color-neutral-200) /* Borders */;
```

### Spacing

```css
--spacing-xs: 0.25rem /* 4px */ --spacing-sm: 0.5rem /* 8px */
  --spacing-md: 1rem /* 16px */ --spacing-lg: 1.5rem /* 24px */
  --spacing-xl: 2rem /* 32px */ --spacing-2xl: 3rem /* 48px */;
```

### Shadows

```css
--shadow-sm:
  0 1px 3px 0 rgba(0, 0, 0, 0.1),
  ... --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  ... --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), ...;
```

### Border Radius

```css
--radius-xs: 0.25rem /* 4px */ --radius-sm: 0.375rem /* 6px */
  --radius-md: 0.5rem /* 8px */ --radius-lg: 0.75rem /* 12px */
  --radius-xl: 1rem /* 16px */ --radius-full: 9999px /* Fully rounded */;
```

## Tailwind Utility Classes

### Text Styling

```html
<p class="text-xs text-gray-500">Small text</p>
<h1 class="text-4xl font-bold text-gray-900">Large heading</h1>
<p class="text-base font-medium leading-relaxed">Body text</p>
```

### Cards & Containers

```html
<div class="card">Standard card</div>
<div class="card-hover">Hover effect card</div>
<div class="card-interactive">Interactive card</div>
<div class="container-app">Full-width container</div>
```

### Colors

```html
<button class="bg-primary-600 hover:bg-primary-700 text-white">Primary</button>
<div class="bg-secondary-100 text-secondary-700">Secondary</div>
<span class="text-accent-600">Accent text</span>
```

### Spacing

```html
<div class="p-4 md:p-6">Responsive padding</div>
<div class="mb-4 mt-8">Margin utilities</div>
<div class="gap-4">Gap between items</div>
```

### Animations

```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-up">Slides up</div>
<div class="animate-scale-in">Scales in</div>
```

## Common Patterns

### Button Group

```tsx
<div class="flex gap-3">
  <StyledButton variant="primary">Save</StyledButton>
  <StyledButton variant="outline">Cancel</StyledButton>
</div>
```

### Card with Badge

```tsx
<StyledCard variant="hover">
  <div class="flex justify-between items-start mb-4">
    <h3 class="text-lg font-semibold">Title</h3>
    <StyledBadge variant="success">New</StyledBadge>
  </div>
  <p>Content here</p>
</StyledCard>
```

### Animated List

```tsx
<StaggerContainer>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <StyledCard variant="hover">
        <p>{item.title}</p>
      </StyledCard>
    </StaggerItem>
  ))}
</StaggerContainer>
```

### Form Section

```tsx
<div class="space-y-6">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Field Label
    </label>
    <input type="text" class="input" placeholder="Enter value" />
  </div>
  <StyledButton variant="primary" size="lg" class="w-full">
    Submit
  </StyledButton>
</div>
```

## Dark Mode

Components automatically adapt to dark mode:

```tsx
// HTML element with 'dark' class
<html class="dark">{/* All components automatically use dark colors */}</html>
```

CSS variables automatically switch in dark mode:

```css
/* Light mode (default) */
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --text-primary: #ffffff;
  }
}
```

## TypeScript Types

### Button Props

```typescript
interface StyledButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
```

### Card Props

```typescript
interface StyledCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "hover";
}
```

### Badge Props

```typescript
interface StyledBadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "info";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}
```

---

## Resources

- Design Tokens: `src/lib/designTokens.ts`
- Animation Presets: `src/lib/animationPresets.ts`
- CSS Variables: `src/index.css`
- Component Guide: `DESIGN_SYSTEM.md`
