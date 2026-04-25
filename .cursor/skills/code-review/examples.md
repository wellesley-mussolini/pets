# Exemplos de Code Review

Exemplos reais de problemas encontrados no projeto e como corrigi-los.

---

## 1. Nomenclatura Genérica → Explícita

### ❌ Problema

```typescript
// utils/util.ts
export function fmt(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function getData() {
  // fetch data from where?
}

// helpers/handler.ts
export function handle(data: any) {
  // handle what?
}
```

**Por que está errado**:
- `fmt` é abreviado e ambíguo (formata data? formata qualquer coisa?)
- `getData()` é genérico demais (qual dado? de onde?)
- `handler.ts` não diz o que trata
- `handle()` não explica qual ação realiza

### ✅ Solução

```typescript
// utils/format-date-to-pt-br.utils.ts
export function formatarDataParaPtBr(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

// utils/fetch-breed-from-supabase.utils.ts
export async function fetchBreedFromSupabase(breedId: string) {
  const { data, error } = await supabaseBrowser
    .from("breeds")
    .select("*")
    .eq("id", breedId);
  
  if (error) throw new Error(error.message);
  return data;
}

// breeds/handlers/submit-breed-form.handler.ts
export async function submitBreedForm(values: BreedFormValues) {
  // submit logic
}
```

**Por que está melhor**:
- Cada função/arquivo tem propósito claro e explícito
- Nomes respondem: "O que é?", "O que faz?", "Qual dado?"
- Escalável: novos devs entendem sem ler código

---

## 2. Componentes no Lugar Errado → Colocation Correta

### ❌ Problema

```
src/components/
  ├── BreedForm.tsx           ❌ Feature logic misturada com UI
  ├── BreedCard.tsx           ❌ Deveria estar com a feature
  ├── BreedList.tsx           ❌ Idem
  └── ui/
      ├── button.tsx          ✅ Correto (primitiva)
      └── input.tsx           ✅ Correto (primitiva)
```

**Impacto**:
- Difícil encontrar código da feature
- Mistura feature logic com UI primitivas
- Não escalável para múltiplas features

### ✅ Solução

```
src/app/(main)/breeds/
  ├── page.tsx
  ├── components/
  │   ├── breed-list.component.tsx      ✅ Feature components
  │   ├── breed-form.component.tsx      ✅ Colocados com feature
  │   └── breed-card.component.tsx      ✅ Idem
  ├── types/
  │   └── breed.types.ts
  ├── zod/
  │   └── breeds-form.zod.ts
  └── utils/
      └── classify-breed-size.utils.ts

src/components/
  ├── ui/                              ✅ Apenas primitivas
  │   ├── button.tsx
  │   └── input.tsx
  └── header/                          ✅ Chrome global
      └── header.component.tsx
```

**Por que está melhor**:
- Feature components vivem com a feature
- Fácil encontrar tudo relacionado a "breeds"
- Primitivas UI claramente separadas
- Escalável: adicione nova feature, siga padrão

---

## 3. Lógica Duplicada → Extração para Utils

### ❌ Problema

```typescript
// auth/components/login.component.tsx
export function LoginForm() {
  const validationRules = {
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
  };
  
  const form = useForm({
    resolver: zodResolver(z.object(validationRules)),
  });
  
  return <form>{/* ... */}</form>;
}

// breeds/components/breed-form.component.tsx
export function BreedForm() {
  const validationRules = {
    email: z.string().email("Email inválido"),           // ❌ Duplicado!
    password: z.string().min(6, "Mínimo 6 caracteres"), // ❌ Duplicado!
  };
  
  const form = useForm({
    resolver: zodResolver(z.object(validationRules)),
  });
  
  return <form>{/* ... */}</form>;
}
```

**Por que está errado**:
- Regras de validação duplicadas
- Mudança em uma não atualiza outra
- Inconsistência futura garantida

### ✅ Solução

```typescript
// src/constants/validation-rules.constant.ts
export const VALIDATION_RULES = {
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
};

// auth/zod/login.zod.ts
export const loginZod = z.object({
  ...VALIDATION_RULES,
});

// breeds/zod/breeds-form.zod.ts
export const breedsFormZod = z.object({
  ...VALIDATION_RULES,
  breedName: z.string().min(1, "Nome é obrigatório"),
});
```

**Por que está melhor**:
- Single source of truth
- Mudança em um lugar = tudo atualizado
- DRY principle respeitado
- Mantível e escalável

---

## 4. Fetch Manual → React Query Pattern

### ❌ Problema

```typescript
// breeds/page.tsx
"use client";

export function BreedListPage() {
  const [breeds, setBreeds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // ❌ Falta estado de erro!

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/breeds")
      .then((r) => r.json())
      .then((data) => setBreeds(data))
      .catch((error) => console.error(error));  // ❌ Silencioso!
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      {isLoading && <p>Carregando...</p>}
      {breeds.map(/* ... */)}
      {/* ❌ Sem estado vazio, sem erro visível */}
    </div>
  );
}
```

**Problemas**:
- Sem caching, sem retry automático
- Erro é silencioso (console.error)
- Sem invalidação de cache
- Código manual e repetitivo

### ✅ Solução

```typescript
// breeds/page.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { toast } from "sonner";

export function BreedListPage() {
  const { data: breeds, isLoading, error } = useQuery({
    queryKey: ["breeds"],
    queryFn: async () => {
      const { data, error } = await supabaseBrowser
        .from("breeds")
        .select("*")
        .order("name");
      
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  if (isLoading) return <BreedListSkeleton />;
  
  if (error) {
    toast.error("Erro ao carregar raças");
    return <ErrorState error={error} />;
  }
  
  if (!breeds?.length) return <EmptyState />;

  return <BreedGrid breeds={breeds} />;
}
```

**Por que está melhor**:
- React Query handle caching, retry, background refetch
- Erros explícitos (toast visível)
- Loading, error, empty states tratados
- Escalável com `useQuery` padrão
- Invalidação fácil com `useQueryClient()`

---

## 5. Importação Quebrada → Restauração ou Remoção

### ❌ Problema

```typescript
// components/sidebar.tsx
import { useMobile } from "@/hooks/use-mobile";  // ❌ Não existe!

export function Sidebar() {
  const isMobile = useMobile();
  // ...
}
```

**Resultado**: Build falha ou runtime error.

### ✅ Solução A: Restaurar o Hook

```typescript
// src/hooks/use-mobile.ts
import { useMediaQuery } from "./use-media-query";

export function useMobile() {
  return useMediaQuery("(max-width: 768px)");
}
```

### ✅ Solução B: Remover o Import

```typescript
// components/sidebar.tsx
export function Sidebar() {
  // Se useMobile não é necessário, remova o import
  // Ou use Tailwind hidden/flex utilities
  return (
    <nav className="hidden md:flex">
      {/* ... */}
    </nav>
  );
}
```

**Por que está melhor**:
- Sem imports quebrados
- Build/runtime funciona
- Código válido e executável

---

## 6. Nomenclatura de Booleans Confusa → Explícita

### ❌ Problema

```typescript
const [open, setOpen] = useState(false);        // ✅ Abrir o quê?
const [loading, setLoading] = useState(false);  // ✅ Carregando o quê?
const [valid, setValid] = useState(true);       // ✅ Válido o quê?
const [active, setActive] = useState(false);    // ✅ Ativo o quê?
```

**Impacto**: Ambíguo quando lendo código fora de contexto.

### ✅ Solução

```typescript
const [isBreedFormDialogOpen, setIsBreedFormDialogOpen] = useState(false);
const [isFormSubmitting, setIsFormSubmitting] = useState(false);
const [isFormDataValid, setIsFormDataValid] = useState(true);
const [isUserAuthenticatedAndOnAuthPage, setIsUserAuthenticatedAndOnAuthPage] = useState(false);

// Ou use React Hook Form built-in states:
const { isSubmitting, isValid } = useFormState(form);
```

**Por que está melhor**:
- Cada boolean deixa claro o que controla
- Alinha com style verbose do projeto
- Legível em qualquer contexto

---

## 7. Sem Tratamento de Erro → Error Handling Explícito

### ❌ Problema

```typescript
// breeds/components/breed-form.component.tsx
const onSubmit = async (data: BreedFormValues) => {
  const { error } = await supabaseBrowser
    .from("breeds")
    .insert([data]);
  
  // ❌ Sem tratamento de erro!
  router.push("/breeds");  // Redireciona sempre
};
```

**Resultado**: Usuário não sabe se funcionou ou falhou.

### ✅ Solução

```typescript
// breeds/components/breed-form.component.tsx
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const queryClient = useQueryClient();
const router = useRouter();

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
    console.error("Mutation error:", error);
  },
});

const onSubmit = async (data: BreedFormValues) => {
  breedMutation.mutate(data);
};
```

**Por que está melhor**:
- Erro é capturado e mostrado ao usuário
- Cache é invalidado após sucesso
- Loading e error states gerenciados
- UX transparente

---

## 8. Tipos Duplicados → Inferência de Zod

### ❌ Problema

```typescript
// breeds/zod/breeds-form.zod.ts
export const breedsFormZod = z.object({
  name: z.string(),
  size: z.enum(["PEQUENO", "MÉDIO", "GRANDE"]),
});

// breeds/types/breed-form.types.ts
export type BreedFormValues = {
  name: string;
  size: "PEQUENO" | "MÉDIO" | "GRANDE";
};  // ❌ Duplicado do zod!

// breeds/components/breed-form.component.tsx
const form = useForm<BreedFormValues>({
  resolver: zodResolver(breedsFormZod),
});
```

**Problema**: Mudança em um place não atualiza o outro.

### ✅ Solução

```typescript
// breeds/zod/breeds-form.zod.ts
export const breedsFormZod = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  size: z.enum(["PEQUENO", "MÉDIO", "GRANDE"]),
});

// ✅ Tipo inferido = single source of truth
export type BreedFormValues = z.infer<typeof breedsFormZod>;

// breeds/components/breed-form.component.tsx
import { breedsFormZod, type BreedFormValues } from "../zod/breeds-form.zod";

const form = useForm<BreedFormValues>({
  resolver: zodResolver(breedsFormZod),
});
```

**Por que está melhor**:
- Type é derivado do schema automaticamente
- Mudança no schema = tipo atualizado
- Single source of truth
- Menos código, menos erros

---

## 9. Classes Tailwind Desorganizadas → Organização com `cn()`

### ❌ Problema

```typescript
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6 lg:flex-row lg:gap-8 lg:p-8 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow bg-white dark:bg-gray-900">
  {/* Content */}
</div>
```

**Problema**:
- String longa e ilegível
- Difícil de manter
- Ordem arbitrária
- Confuso

### ✅ Solução

```typescript
import { cn } from "@/lib/utils";

<div
  className={cn(
    // Layout base
    "flex flex-col gap-4 p-4",
    // Responsive layout
    "md:flex-row md:gap-6 md:p-6",
    "lg:gap-8 lg:p-8",
    // Appearance
    "rounded-lg border border-gray-200",
    "bg-white dark:bg-gray-900",
    // Interactivity
    "shadow-lg hover:shadow-xl transition-shadow"
  )}
>
  {/* Content */}
</div>
```

**Por que está melhor**:
- Legível e organizado
- Responsive logic agrupada
- Appearance separada
- Fácil manutenção
- Consistente com projeto

---

## 10. Configuração Desatualizada → Ajuste

### ❌ Problema

```typescript
// vitest.config.ts
export default defineConfig({
  // ...
  include: ["src/app/entrar/tests/**/*.test.{ts,tsx}"]  // ❌ Rota antiga!
});

// Mas testes estão em:
// src/app/auth/tests/  ✅ Nova rota
```

**Resultado**: `npm test` não encontra testes.

### ✅ Solução

```typescript
// vitest.config.ts
export default defineConfig({
  // ...
  include: ["src/app/auth/tests/**/*.test.{ts,tsx}"]  // ✅ Rota correta
});
```

**Por que está melhor**:
- Testes são descobertos
- CI/CD funciona
- Não há surpresas em produção

---

## Resumo: O Que Procurar

1. **Nomenclatura**: Explícita ou genérica?
2. **Colocation**: Arquivo no lugar certo?
3. **Duplicação**: Lógica repetida?
4. **Padrão**: Segue padrão do projeto?
5. **Imports**: Válidos e usados?
6. **Legibilidade**: Fácil de entender?
7. **Erros**: Tratamento explícito?
8. **Tipos**: Inferidos de Zod?
9. **Tailwind**: Organizado com `cn()`?
10. **Config**: Atualizada e correta?

Quando encontrar qualquer um desses padrões, aplique a solução correspondente.
