---
name: frontend-code-review
description: Review frontend code in this Next.js 16/React 19 project for architecture, naming clarity, component organization, data flows, code reuse, and alignment with project standards. Use when reviewing code changes, identifying refactoring opportunities, checking nomenclature against the project rule, or assessing component placement and responsibility. Automatically applied by the code-review agent.
---

# Frontend Code Review Skill

This skill guides comprehensive code review for the **pets** project (Next.js 16 App Router, React 19, TypeScript, Supabase, React Query, Tailwind CSS).

Review code **module by module and file by file**, identifying deviations from standard, duplications, low readability, poor naming, dead code, and misplaced structures. Keep code **clean, scalable, reusable, well-written, properly indented, and aligned with existing project patterns**.

---

## Project Architecture Overview

**Stack**: Next.js 16 App Router, React 19, TypeScript (strict), Supabase (auth + data), React Query, Tailwind CSS v4, shadcn/ui, Vitest.

**Layer structure**:
- **App Router** (`src/app/`): Route segments with colocation pattern
- **Middleware** (`src/middleware.ts`): Auth gate + session refresh
- **Lib** (`src/lib/`): Supabase clients and shared utilities
- **Providers** (`src/providers/`): React Query, context
- **Components** (`src/components/`): UI primitives and app chrome
- **Route-local** colocation: Each feature folder contains its own types, zod schemas, utils, and components (e.g. `(main)/breeds/` has `components/`, `types/`, `utils/`, `zod/`)

**Entry point**: `src/app/layout.tsx` (fonts, QueryClient, Sonner), then `(main)/layout.tsx` (Header + main), or `auth/layout.tsx` (auth pages).

---

## Nomenclature Rule

**Always enforce clarity first.** Reference `.cursor/rules/nomenclaturas.mdc`:

- ✅ Names must communicate exactly what they represent, do, or hold
- ✅ Code structure readable **by name alone**, without reading implementation
- ✅ Prefer explicit, domain-aligned names over generic ones
- ✅ **Portuguese is acceptable** for user-facing copy and domain-specific helpers; keep **code identifiers in English** where it follows conventions (React, Next.js, libraries)
- ✅ Follow language/ecosystem conventions (casing, file patterns) **without sacrificing clarity**

**Red flags**:
- Generic names: `helper`, `utils`, `data`, `handler`, `component`
- Ambiguous abbreviations: `fmt`, `msg`, `val`, `comp`
- Mixed naming styles within related files
- Inconsistent use of Portuguese vs English in the same domain

**Examples**:
- ✅ `formatarDataParaPtBr` (domain helper, Portuguese OK)
- ✅ `LogoutButton.component.tsx` (clear action, explicit suffix)
- ✅ `userIsAuthenticatedAndOnAuthPage` (verbose boolean, aligns with project style)
- ❌ `formatDate` (ambiguous: what format? locale?)
- ❌ `Handler.tsx` (does what?)
- ❌ `util.ts` (what utility?)

---

## Key Review Dimensions

### 1. Architecture and Responsibility

**Check**:
- Is this file in the right place? (routes in `src/app/`, primitives in `src/components/ui/`, app components in route-local `components/`, types in route-local `types/` or `*.types.ts`)
- Is responsibility single and clear? (no god components, no mixed concerns)
- Are Supabase clients used correctly? (browser client from `"use client"`, server from server components or middleware)
- Are there unnecessary dependencies on external files when values could be co-located?

**Examples**:
- ✅ `breeds/components/breed-form.component.tsx` with local `../zod/breeds-form.zod.ts` and `../types/breed.types.ts`
- ❌ Sharing zod schemas across distant routes; import from `src/utils/shared-zod.ts` instead of co-location

### 2. Naming Clarity

**Check**:
- Do variable/function/component names describe their role exactly?
- Is naming consistent across the project? (check similar patterns in `breeds/`, `auth/`, etc.)
- Are booleans verbose? (e.g. `isLoading`, `userCanDelete`, not just `can`, `ready`)
- Are abbreviations avoided? (spell out domain terms)
- Does the name answer: What is this? What does it do? What data does it hold?

**Apply the nomenclature rule**: unclear = wrong.

**Examples**:
- ✅ `useBreedFormSubmit()` (what form, what action)
- ✅ `BreedFormValues` (inferred from Zod, clear type)
- ✅ `isBreedListEmpty` (boolean state, explicit)
- ❌ `useSubmit()` (submit what?)
- ❌ `FormValues` (values of which form?)
- ❌ `isEmpty` (what is empty? where?)

### 3. Component Organization

**Colocation pattern**: Features must own their shape.

**Correct structure**:
```
src/app/(main)/breeds/
  ├── page.tsx                        # Main route
  ├── components/
  │   ├── breed-list.component.tsx
  │   ├── breed-card.component.tsx
  │   └── breed-form.component.tsx
  ├── types/
  │   └── breed.types.ts
  ├── zod/
  │   └── breeds-form.zod.ts          # Inferred: BreedFormValues, etc.
  └── utils/
      └── classify-breed-size.utils.ts
```

**Check**:
- Feature components in `components/` (not scattered in `src/components/`)
- Feature types in local `types/` (not in global `types/`)
- Feature zod in local `zod/` (not mixed with UI in page)
- Feature utils in local `utils/` (or `src/utils/` if truly cross-feature)
- Global primitives (buttons, inputs, dialogs) **only** in `src/components/ui/`
- App chrome (header, sidebar) in `src/components/` top level

### 4. Client vs Server Boundaries

**Check**:
- Pages that read from Supabase or use React Query have `"use client"` and import browser client
- Server components don't use hooks or event handlers
- Middleware correctly gates auth routes (check `src/middleware.ts` pattern)
- No client-side data fetching without React Query wrapper (consistency)

**Current pattern**:
- `(main)/breeds/page.tsx` is `"use client"`, uses `useQuery` from React Query
- `auth/page.tsx` is `"use client"`, uses Supabase browser client
- Forms are `"use client"` with `useForm` + `useMutation` pattern

### 5. Data Flow and React Query

**Check**:
- Reads use `useQuery` with a stable key: `['breeds']`, `['breeds', breedId]`
- Mutations use `useMutation` and call `useQueryClient().invalidateQueries()`
- Error handling is explicit (toast, redirect, or render fallback)
- Loading states are managed (skeleton or spinner)
- No inline `fetch()` without React Query; always use wrapper

**Examples**:
- ✅ Mutation invalidates after success: `queryClient.invalidateQueries({ queryKey: ['breeds'] })`
- ❌ Forgetting to invalidate after form submission (stale data)

### 6. Form Validation and Types

**Check**:
- Zod schemas colocated in `zod/` folder within the feature
- Inferred types exported: `type BreedFormValues = z.infer<typeof breedsFormZod>`
- react-hook-form uses `zodResolver` from Zod schema
- Validation messages in Portuguese (user-facing), schema definitions clear

**Example pattern**:
```typescript
// breeds/zod/breeds-form.zod.ts
export const breedsFormZod = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  size: z.enum(["PEQUENO", "MÉDIO", "GRANDE"]),
});

export type BreedFormValues = z.infer<typeof breedsFormZod>;

// breeds/components/breed-form.component.tsx
"use client";
import { breedsFormZod, type BreedFormValues } from "../zod/breeds-form.zod";

const form = useForm<BreedFormValues>({
  resolver: zodResolver(breedsFormZod),
});
```

### 7. Styling and Tailwind

**Check**:
- Use Tailwind classes directly (no custom CSS unless absolutely necessary)
- Organize long class lists with `clsx` or the project's `cn` utility (from `src/lib/utils.ts`)
- Responsive classes follow Tailwind conventions (mobile-first: `text-sm md:text-base lg:text-lg`)
- No hardcoded colors; use theme tokens (primary, destructive, etc.)

**Example**:
```typescript
// ✅ Good
className={cn(
  "flex flex-col gap-4 p-4",
  "md:flex-row md:gap-6",
  isActive && "bg-primary text-white"
)}

// ❌ Bad
className="flex flex-col gap-4 p-4 md:flex-row md:gap-6 {isActive && 'bg-blue-500 text-white'}"
```

### 8. Code Reuse and DRY

**Check**:
- Repeated logic extracted to utilities or hooks
- Duplicate component trees consolidated
- Shared constants in `src/constants/` (e.g. `pathnames.constant.ts`)
- No copy-paste components; use props and composition

**Red flags**:
- Same filter logic in two files → extract to `utils/`
- Identical forms in two routes → extract to a reusable component
- Hard-coded values repeated → move to constants

### 9. Dead Code and Imports

**Check**:
- All imports are used; no unused variable declarations
- No commented-out code blocks
- **CRITICAL**: `@/hooks/use-mobile` is imported but the hook doesn't exist (check `sidebar.tsx`); flag broken imports

**Current known issues**:
- `src/hooks/use-mobile.ts` is deleted but `sidebar.tsx` still imports it → remove import or restore hook

### 10. Configuration and Test Setup

**Check vitest.config.ts**:
- `include` path is currently `src/app/entrar/tests/**/*.test.{ts,tsx}` but tests live at `src/app/auth/tests/`
- When reviewing, note this mismatch; tests won't run unless CLI specifies path or config is fixed

**Check eslint.config.mjs**:
- ESLint 9 flat config with next/core-web-vitals + typescript
- Ignores `.next`, `out`, `build`

---

## Review Workflow

When reviewing a file or changeset:

1. **Verify placement**: Is this file in the right directory? Should types be co-located? Is a component in the right folder?

2. **Check naming**: Apply the nomenclature rule strictly. Every identifier should be unambiguous.

3. **Scan for duplicates**: Does this logic exist elsewhere? Can it be extracted?

4. **Verify imports**: 
   - Are all imports actually used?
   - Does `@/` path match the filesystem?
   - No broken imports from deleted files?

5. **Check architecture boundaries**:
   - Client/server boundary respected?
   - Data fetching via React Query (not bare fetch)?
   - Proper separation of concerns?

6. **Validate forms/zod**: Schemas colocated? Types inferred? Validation messages clear?

7. **Assess code quality**:
   - Is code readable without mental overhead?
   - Are functions small and focused?
   - Is error handling explicit?
   - Are edge cases handled?

8. **Look for dead code**: Commented-out blocks, unused variables, unreachable conditions.

9. **Verify patterns match the project**: Does this follow the pattern in `breeds/` or `auth/`? If not, why?

10. **Safe to refactor?**: If you spot an improvement, ensure it doesn't change behavior. Ask if unsure.

---

## Common Issues to Flag

| Issue | Severity | Action |
|-------|----------|--------|
| Generic naming (e.g. `helper`, `utils`, `data`) | 🔴 Critical | Reject until renamed to be explicit |
| Broken imports (e.g. missing `@/hooks/use-mobile`) | 🔴 Critical | Remove or restore the import target |
| Zod schema in page file instead of `zod/` folder | 🟡 Suggestion | Move to co-located `zod/` folder for clarity |
| Data fetching without React Query | 🔴 Critical | Refactor to use `useQuery` + `useMutation` |
| Component in wrong folder (feature logic in `src/components/ui/`) | 🔴 Critical | Move to feature-local `components/` or `src/components/` |
| Unused imports or dead code | 🟡 Suggestion | Remove unless there's a reason to keep |
| No error handling in forms or queries | 🔴 Critical | Add toast, redirect, or error boundary |
| Client/server boundary violated | 🔴 Critical | Separate concerns; mark with `"use client"` if needed |
| Repeated logic across files | 🟡 Suggestion | Extract to `utils/` or shared hook |
| Hard-coded values instead of constants | 🟡 Suggestion | Move to `src/constants/` or feature-local constants |
| Class names not using `cn()` utility or Tailwind conventions | 🟡 Suggestion | Refactor for consistency |

---

## Additional Resources

- **Nomenclature Rule**: `.cursor/rules/nomenclaturas.mdc` (applies to all identifiers; clarity is priority)
- **TSConfig**: `tsconfig.json` with strict mode and `@/*` alias
- **Tailwind**: `tailwind.config.js` with theme overrides (primary, destructive, not-found keyframes)
- **Components**: `components.json` references `base-nova` style, RSC-friendly
- **Supabase Pattern**: `src/lib/supabase/` contains browser and server clients; middleware refreshes session

---

## Quick Checklist for Reviewers

- [ ] Naming is explicit and follows project style (Portuguese for domain/UI, English for code)
- [ ] File placement matches the colocation pattern (types, zod, utils, components with feature)
- [ ] No broken imports or dead code
- [ ] Component responsibility is single and clear
- [ ] Data flows via React Query (no bare fetch)
- [ ] Forms use zod + react-hook-form + zodResolver, schemas co-located
- [ ] Client/server boundaries respected (`"use client"` where needed)
- [ ] Error handling is explicit (toast, fallback, redirect)
- [ ] No repeated logic (extract to utils or hooks)
- [ ] Tailwind classes use `cn()` and follow conventions
- [ ] All changes align with existing project patterns

---

## When in Doubt

1. **Is this change safe?** (Does it alter behavior? Will tests catch it?)
   - Yes → proceed with refactoring suggestion
   - No → ask the author before changing
2. **Does naming match the pattern?** (Check similar files in `breeds/`, `auth/`, `components/ui/`)
   - Yes → approve
   - No → request clarification or rename
3. **Is placement correct?** (Would someone unfamiliar with the codebase find this file intuitively?)
   - Yes → approve
   - No → suggest moving or restructuring
