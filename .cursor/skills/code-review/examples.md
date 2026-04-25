# Code Review Examples

Este documento fornece exemplos concretos de issues encontradas no projeto e como abordar code review.

---

## Example 1: Nomenclature Issue

### ❌ Bad (Reported)

```typescript
// utils/util.ts
export function fmt(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function getData() {
  // fetch data from somewhere?
}
```

**Problems**:
- `fmt` is abbreviated and unclear (format date? format data?)
- `getData()` is too generic—get what data? from where?
- Module name `util.ts` doesn't describe purpose

### ✅ Good (Refactored)

```typescript
// utils/date.utils.ts
export function formatarDataParaPtBr(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

// utils/breed-data.utils.ts
export function fetchBreedDataFromSupabase(breedId: string) {
  // fetch breeds data from Supabase
}
```

**Why better**:
- `formatarDataParaPtBr` clearly states the format and locale (Portuguese domain name is OK for utility helper)
- `fetchBreedDataFromSupabase` explains what data, from where
- Module names describe purpose

---

## Example 2: Component Placement Issue

### ❌ Bad (Reported)

```
src/components/
  ├── BreedForm.tsx           ❌ Feature component mixed with UI primitives
  ├── BreedCard.tsx           ❌ Should be feature-local
  └── ui/
      ├── button.tsx
      └── input.tsx
```

**Problem**: Feature components (`BreedForm`, `BreedCard`) live in `src/components/` instead of being co-located with their feature.

### ✅ Good (Refactored)

```
src/app/(main)/breeds/
  ├── page.tsx
  ├── components/
  │   ├── breed-form.component.tsx      ✅ Co-located with feature
  │   └── breed-card.component.tsx      ✅ Co-located with feature
  ├── types/
  │   └── breed.types.ts
  ├── zod/
  │   └── breeds-form.zod.ts
  └── utils/
      └── classify-breed-size.utils.ts

src/components/
  ├── ui/                              ✅ Only UI primitives
  │   ├── button.tsx
  │   └── input.tsx
  └── header/                           ✅ App chrome (global concern)
      └── header.component.tsx
```

**Why better**: Feature files live next to the feature route. Global UI primitives and app chrome are separate. Easier to find, maintain, and refactor.

---

## Example 3: Duplicate Logic

### ❌ Bad (Reported)

```typescript
// auth/components/login.component.tsx
export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    ),
  });
  return <form>...</form>;
}

// breeds/components/breed-form.component.tsx
export function BreedForm() {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    ),
  });
  return <form>...</form>;
}
```

**Problem**: Same form validation logic duplicated. No DRY principle.

### ✅ Good (Refactored)

```typescript
// src/constants/validation.constant.ts
export const BASE_FORM_RULES = {
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
};

// auth/zod/login.zod.ts
export const loginZod = z.object(BASE_FORM_RULES);

// breeds/zod/breeds-form.zod.ts
export const breedsFormZod = z.object({
  ...BASE_FORM_RULES,
  breedName: z.string().min(1, "Nome é obrigatório"),
});
```

**Why better**: Shared validation rules in constants. Avoid copy-paste. Easier to update validation globally.

---

## Example 4: Missing React Query Usage

### ❌ Bad (Reported)

```typescript
// breeds/components/breed-list.component.tsx
"use client";

export function BreedList() {
  const [breeds, setBreeds] = useState([]);

  useEffect(() => {
    fetch("/api/breeds")
      .then((r) => r.json())
      .then((data) => setBreeds(data));
  }, []);

  return <div>{breeds.map(/* ... */)}</div>;
}
```

**Problems**:
- No error handling
- No loading state
- Manual state management instead of React Query
- No caching or invalidation strategy

### ✅ Good (Refactored)

```typescript
// breeds/components/breed-list.component.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function BreedList() {
  const { data: breeds, isLoading, error } = useQuery({
    queryKey: ["breeds"],
    queryFn: async () => {
      const { data } = await supabaseBrowser
        .from("breeds")
        .select("*");
      return data;
    },
  });

  if (isLoading) return <SkeletonLoader />;
  if (error) return <ErrorDisplay error={error} />;
  if (!breeds?.length) return <EmptyState />;

  return <div>{breeds.map(/* ... */)}</div>;
}
```

**Why better**: React Query handles caching, stale data, retries. Error and loading states explicit. Easier to test and reason about.

---

## Example 5: Broken Import

### ❌ Bad (Reported)

```typescript
// components/sidebar.tsx
import { useMobile } from "@/hooks/use-mobile";  ❌ File doesn't exist!

export function Sidebar() {
  const isMobile = useMobile();
  // ...
}
```

**Problem**: `@/hooks/use-mobile` hook was deleted but import still exists. Build may fail at runtime.

### ✅ Good (Refactored)

**Option A: Restore the hook**
```typescript
// src/hooks/use-mobile.ts
import { useMedia } from "some-library"; // or implement custom logic

export function useMobile() {
  return useMedia("(max-width: 768px)");
}
```

**Option B: Remove the import**
```typescript
// components/sidebar.tsx
export function Sidebar() {
  // Remove useMobile call if not needed
  // Or inline responsive logic with Tailwind classes
}
```

**Why better**: No broken imports. Either restore the hook or remove the import. Keeps the codebase valid.

---

## Example 6: Naming Booleans

### ❌ Bad (Reported)

```typescript
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [valid, setValid] = useState(true);
```

**Problem**: Unclear what is open, loading, or valid. Context-dependent and ambiguous.

### ✅ Good (Refactored)

```typescript
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isFormSubmitting, setIsFormSubmitting] = useState(false);
const [isFormDataValid, setIsFormDataValid] = useState(true);

// Or use React Hook Form's built-in states:
const { isSubmitting, isValid } = useFormState(form);
```

**Why better**: Booleans clearly state what they represent. Verbose is better than ambiguous. Aligns with project style.

---

## Example 7: Error Handling in Forms

### ❌ Bad (Reported)

```typescript
// breeds/components/breed-form.component.tsx
const onSubmit = async (data: BreedFormValues) => {
  const { error } = await supabaseBrowser
    .from("breeds")
    .insert([data]);
  
  // No error handling!
  router.push("/breeds");
};
```

**Problem**: If mutation fails, user gets no feedback. Redirects anyway.

### ✅ Good (Refactored)

```typescript
// breeds/components/breed-form.component.tsx
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const breedMutation = useMutation({
  mutationFn: async (data: BreedFormValues) => {
    const { data: result, error } = await supabaseBrowser
      .from("breeds")
      .insert([data]);
    
    if (error) throw new Error(error.message);
    return result;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["breeds"] });
    toast.success("Raça criada com sucesso!");
    router.push("/breeds");
  },
  onError: (error) => {
    toast.error(`Erro: ${error.message}`);
  },
});

const onSubmit = async (data: BreedFormValues) => {
  breedMutation.mutate(data);
};
```

**Why better**: Error is caught and displayed to user. Success clears stale queries. UX is clear.

---

## Example 8: Type Inference from Zod

### ❌ Bad (Reported)

```typescript
// breeds/zod/breeds-form.zod.ts
export const breedsFormZod = z.object({
  name: z.string(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
});

// breeds/components/breed-form.component.tsx
type BreedFormValues = {
  name: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
};  // ❌ Duplicated from Zod!

const form = useForm<BreedFormValues>({
  resolver: zodResolver(breedsFormZod),
});
```

**Problem**: Type definition duplicated from Zod schema. Any schema change requires manual type update.

### ✅ Good (Refactored)

```typescript
// breeds/zod/breeds-form.zod.ts
export const breedsFormZod = z.object({
  name: z.string(),
  size: z.enum(["PEQUENO", "MÉDIO", "GRANDE"]),
});

export type BreedFormValues = z.infer<typeof breedsFormZod>;

// breeds/components/breed-form.component.tsx
import { breedsFormZod, type BreedFormValues } from "../zod/breeds-form.zod";

const form = useForm<BreedFormValues>({
  resolver: zodResolver(breedsFormZod),
});
```

**Why better**: Type is inferred from schema. Single source of truth. Schema change auto-updates type. Less duplication.

---

## Example 9: Tailwind Class Organization

### ❌ Bad (Reported)

```typescript
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6 lg:flex-row lg:gap-8 lg:p-8 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
  {/* Content */}
</div>
```

**Problem**: Long, hard-to-read class string. Mixes concerns. Inconsistent spacing logic.

### ✅ Good (Refactored)

```typescript
import { cn } from "@/lib/utils";

<div
  className={cn(
    // Layout
    "flex flex-col gap-4 p-4",
    "md:flex-row md:gap-6 md:p-6",
    "lg:gap-8 lg:p-8",
    // Styling
    "rounded-lg border border-gray-200",
    "shadow-lg hover:shadow-xl transition-shadow"
  )}
>
  {/* Content */}
</div>
```

**Why better**: Readable. Responsive logic grouped. Uses `cn()` utility for consistency. Easier to maintain.

---

## Example 10: Configuration Issue (Vitest)

### Issue (Reported in current project)

```typescript
// vitest.config.ts
include: ["src/app/entrar/tests/**/*.test.{ts,tsx}"]  // ❌ Old path!
```

But tests live at:
```
src/app/auth/tests/  // ✅ Current path (route renamed)
```

**Problem**: `npm test` won't discover tests because path is stale.

### Fix

```typescript
// vitest.config.ts
include: ["src/app/auth/tests/**/*.test.{ts,tsx}"]  // ✅ Correct path
```

**Why**: Tests are discoverable and run as expected.

---

## Summary: What to Look For

1. **Naming**: Is it explicit? Does it say what it does?
2. **Placement**: Is the file in the right folder? Can someone find it?
3. **Duplication**: Is this logic repeated elsewhere?
4. **Imports**: Are all imports used? Do they exist?
5. **Patterns**: Does this follow the project's established patterns (breeds, auth)?
6. **Data flow**: Does it use React Query? Is error handling explicit?
7. **Types**: Are they inferred from Zod? Single source of truth?
8. **Tailwind**: Are classes organized with `cn()`? Do they follow conventions?
9. **Dead code**: Is there commented-out code? Unused variables?
10. **Configuration**: Are tools configured correctly (Vitest paths, ESLint)?

When in doubt, check existing files in `breeds/` or `auth/` for the established pattern.
