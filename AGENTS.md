# Agent Instructions

This is a Next.js 14 PWA for currency and timezone conversion using TypeScript, Tailwind CSS, and shadcn/ui components.

## Build/Lint/Test Commands

```bash
# Development
pnpm dev              # Start development server on localhost:3000

# Build
pnpm build            # Production build (includes PWA generation)
pnpm start            # Start production server

# Linting
pnpm lint             # Run ESLint (Next.js core-web-vitals config)
```

**Note:** No test framework is currently configured. To add tests, consider installing Vitest or Jest with React Testing Library.

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** - always define types explicitly
- Use `type` imports: `import type { Metadata } from 'next'`
- Prefer interfaces for object shapes, types for unions
- Use `satisfies` keyword for config objects (see tailwind.config.ts)

### Imports
- Use `@/` path alias for all project imports
- Group imports: React/Next → third-party → local
- Example:
```typescript
import * as React from 'react';
import { useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
```

### Component Structure
- Use `'use client'` directive for client components at the top
- Components use PascalCase naming (files and exports)
- Utility files use camelCase
- Forward refs for UI components:
```typescript
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => { ... }
);
Input.displayName = 'Input';
```

### Styling
- Use Tailwind CSS exclusively
- Use `cn()` utility for conditional class merging
- Use CSS variables for theming (`hsl(var(--primary))`)
- Prefer `className` composition over styled-components

### Naming Conventions
- Components: PascalCase (e.g., `CurrencyInput.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useCurrencyContext`)
- Utilities: camelCase (e.g., `lib/utils.ts`)
- Types/Interfaces: PascalCase (e.g., `InputProps`)
- Atoms: camelCase with suffix (e.g., `baseAccordionAtom`)

### Error Handling
- Use early returns for null checks
- Optional chaining for potentially undefined values
- Type guards when narrowing types

### State Management
- Use Jotai atoms for global state
- Create atoms with `atomWithAsyncStorage` for persistence
- Use React Context for dependency injection only when needed

Example atom definition:
```typescript
import { atomWithAsyncStorage } from '@/lib/asyncStorage';

export const baseAccordionAtom = atomWithAsyncStorage(
  'baseAccordion',
  ['currency'] as string[] | string
);
```

### shadcn/ui Conventions
- UI components live in `components/ui/`
- Use Radix UI primitives as base
- Extend with `className` prop for customization
- Keep UI components focused and reusable

### PWA Considerations
- App is PWA-enabled via @ducanh2912/next-pwa
- Service worker auto-generated in `public/` during build
- Icons and manifest configured in `public/`
- Always test PWA functionality in production build

## Project Structure

```
app/                  # Next.js App Router
components/           # React components
  ui/                # shadcn/ui components
lib/                 # Utilities, hooks, contexts, atoms
config/              # Static JSON configuration files
public/              # Static assets, PWA files
```

## File Organization

### Components
- Place shared components in `components/`
- One component per file (except small related components)
- Co-locate component-specific hooks in same folder or `lib/`

### Utilities
- `lib/utils.ts` - cn() and general utilities
- `lib/atoms.ts` - Jotai atoms
- `lib/asyncStorage.ts` - IndexedDB storage helpers

### Configuration
- Static data files go in `config/`
- JSON files for country/currency data

## Key Dependencies

- **Framework:** Next.js 14 (App Router)
- **State:** Jotai
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Utilities:** clsx, tailwind-merge
- **PWA:** @ducanh2912/next-pwa
- **Forms:** Downshift for autocomplete inputs
