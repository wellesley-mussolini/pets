# Code Review Quick Reference

Guia de checklist e padrões rápidos para code review do projeto **pets**.

---

## File Placement Quick Ref

### Where to put what?

| What | Where | Example |
|------|-------|---------|
| **Route page** | `src/app/(main)/breeds/page.tsx` | Main view for feature |
| **Feature component** | `breeds/components/*.component.tsx` | `breed-form.component.tsx` |
| **UI primitive** | `src/components/ui/button.tsx` | shadcn components |
| **App chrome** | `src/components/header/` | `header.component.tsx` |
| **Feature types** | `breeds/types/*.types.ts` | `breed.types.ts` |
| **Feature zod schema** | `breeds/zod/*.zod.ts` | `breeds-form.zod.ts` |
| **Feature util** | `breeds/utils/` or `src/utils/` | `classify-breed-size.utils.ts` |
| **Shared constant** | `src/constants/` | `pathnames.constant.ts` |
| **Supabase client** | `src/lib/supabase/` | `browser.ts`, `server.ts` |
| **Hook** | `src/hooks/` | `use-mobile.ts` (restore if missing!) |
| **Context** | `src/context/` | `theme.context.ts` |
| **Test** | Co-located with feature or `src/app/auth/tests/` | Feature test files |

---

## Naming Red Flags 🚩

### Generic names → ✅ Replace with explicit

| Bad | Why | Good |
|-----|-----|------|
| `handler.ts` | Does what? | `submit-breed-form.handler.ts` |
| `utils.ts` | Utility for what? | `breed-size-classification.utils.ts` |
| `data.ts` | What data? | `breed-list-data.utils.ts` |
| `helper.ts` | Helper for what? | `format-date-to-pt-br.ts` |
| `fmt()` | Format what? | `formatarDataParaPtBr()` |
| `getData()` | Get what data? | `fetchBreedFromSupabase()` |
| `isOpen` | What is open? | `isBreedFormDialogOpen` |
| `loading` | What is loading? | `isFormSubmitting` |
| `handleChange` | Change what? | `handleBreedNameChange` |
| `process()` | Process what? | `validateBreedFormData()` |

---

## Patterns Quick Ref

### Route Structure Pattern

```
src/app/(main)/breeds/
  ├── page.tsx                       # "use client", useQuery
  ├── layout.tsx                     # If needed for this route
  ├── components/
  │   ├── breed-list.component.tsx
  │   ├── breed-form.component.tsx
  │   └── breed-card.component.tsx
  ├── types/
  │   └── breed.types.ts
  ├── zod/
  │   └── breeds-form.zod.ts
  └── utils/
      └── classify-breed-size.utils.ts
```

### Form Component Pattern

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { breedsFormZod, type BreedFormValues } from "../zod/breeds-form.zod";

export function BreedForm() {
  const form = useForm<BreedFormValues>({
    resolver: zodResolver(breedsFormZod),
    defaultValues: { /* ... */ },
  });

  const onSubmit = async (data: BreedFormValues) => {
    // Use mutation here
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

### Data Query Pattern

```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function BreedList() {
  const { data: breeds, isLoading, error } = useQuery({
    queryKey: ["breeds"],
    queryFn: async () => {
      const { data } = await supabaseBrowser.from("breeds").select("*");
      return data;
    },
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorUI />;
  if (!breeds?.length) return <EmptyUI />;

  return <>{/* Render breeds */}</>;
}
```

### Mutation Pattern

```typescript
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: async (values: BreedFormValues) => {
    const { data, error } = await supabaseBrowser
      .from("breeds")
      .insert([values]);
    if (error) throw new Error(error.message);
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["breeds"] });
    toast.success("Sucesso!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

mutation.mutate(formData);
```

### Type Inference from Zod

```typescript
export const breedsFormZod = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  size: z.enum(["PEQUENO", "MÉDIO", "GRANDE"]),
});

export type BreedFormValues = z.infer<typeof breedsFormZod>;
```

---

## Common Mistakes Checklist

- [ ] **Generic naming**: `handler`, `util`, `data`, `helper`, `Component` → Rename to be specific
- [ ] **Broken imports**: `@/hooks/use-mobile` doesn't exist → Remove or restore
- [ ] **Feature component in `src/components/`**: Should be co-located → Move to `breeds/components/`
- [ ] **No error handling**: Forms/queries fail silently → Add toast or error boundary
- [ ] **Missing React Query**: Using bare `fetch()` → Wrap with `useQuery`/`useMutation`
- [ ] **Duplicate logic**: Same code in two files → Extract to `utils/` or `hooks/`
- [ ] **No type inference**: Duplicating types from Zod → Use `z.infer<typeof schema>`
- [ ] **Unused imports**: Variables not used → Remove
- [ ] **Class names not using `cn()`**: Long inline string → Organize with `cn()` utility
- [ ] **Dead code**: Commented-out blocks → Remove

---

## Approved Naming Examples ✅

### Functions/Utils
- `formatarDataParaPtBr(date)`
- `fetchBreedFromSupabase(id)`
- `classifyBreedSize(weight)`
- `validateUserEmail(email)`
- `isValidBreedSize(size)`
- `shouldShowBreedForm(userRole)`

### Components
- `BreedForm.component.tsx`
- `BreedCard.component.tsx`
- `BreedList.component.tsx`
- `LoginButton.component.tsx`
- `ErrorBoundary.component.tsx`

### Variables
- `isBreedListEmpty`
- `isFormSubmitting`
- `userCanDeleteBreed`
- `breedNameInputRef`
- `selectedBreedId`

### Files
- `breed.types.ts` (types for breeds)
- `breeds-form.zod.ts` (zod schema for form)
- `classify-breed-size.utils.ts` (util for size logic)
- `auth.zod.ts` (zod schema for auth)

---

## Code Style Quick Ref

### Tailwind Classes with `cn()`

```typescript
// ✅ Good
className={cn(
  "flex flex-col gap-4 p-4",
  "md:flex-row md:gap-6",
  isActive && "bg-primary text-white",
  variant === "destructive" && "bg-destructive text-white"
)}

// ❌ Bad
className={`flex flex-col gap-4 p-4 md:flex-row md:gap-6 ${isActive ? 'bg-primary' : ''}`}
```

### TypeScript Type Annotations

```typescript
// ✅ Good (inferred)
type BreedFormValues = z.infer<typeof breedsFormZod>;

// ❌ Bad (duplicated)
type BreedFormValues = {
  name: string;
  size: string;
};
```

### Booleans

```typescript
// ✅ Good
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isFormSubmitting, setIsFormSubmitting] = useState(false);

// ❌ Bad
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);
```

### Error Handling

```typescript
// ✅ Good
catch (error) {
  toast.error(`Erro: ${error.message}`);
  console.error(error);
}

// ❌ Bad (silent failure)
catch (error) {
  // Do nothing
}
```

---

## When to Ask Before Changing

Ask the author before making changes if:

1. **Behavior might change** (e.g., refactoring logic that touches business rules)
2. **Impact is unclear** (e.g., shared code used in multiple places)
3. **Type safety at risk** (e.g., loosening TypeScript strictness)
4. **Performance unknown** (e.g., splitting a component could affect render cycles)

**Safe to change without asking:**
- Renaming variables for clarity
- Removing dead code
- Fixing broken imports
- Organizing Tailwind classes with `cn()`
- Extracting pure utility functions

---

## Priority Levels

| Severity | Examples | Action |
|----------|----------|--------|
| 🔴 **Must Fix** | Broken imports, no error handling, security issues, logic errors | Block merge |
| 🟡 **Should Fix** | Generic naming, duplicated code, poor organization | Request changes |
| 🟢 **Nice to Have** | Code style, comments, minor refactors | Approve but suggest |

---

## Review Speed Tips

1. **Check placement first** (5 sec): Is file in right folder?
2. **Scan naming** (10 sec): Generic names? Ambiguous vars?
3. **Look for patterns** (15 sec): Does it match `breeds/` or `auth/` structure?
4. **Check imports** (5 sec): All used? Do they exist?
5. **Verify error handling** (10 sec): Forms/queries have error boundaries?
6. **Spot duplication** (15 sec): Can this be extracted?
7. **Quick style pass** (10 sec): Tailwind organized? TypeScript strict?

Total: ~70 seconds for a small file. Scale up for complexity.

---

## Links

- **Nomenclature Rule**: `.cursor/rules/nomenclaturas.mdc`
- **Project Config**: `tsconfig.json`, `tailwind.config.js`, `components.json`
- **Examples**: See `examples.md`
