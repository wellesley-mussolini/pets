# Referência Rápida: Code Review

Checklists, padrões e red flags para review rápido.

---

## Checklist de Review Rápida

Copie e use para cada arquivo:

- [ ] **Nomenclatura**: Nomes explícitos? Sem `helper`, `util`, `data`, `handler`, `component`?
- [ ] **Colocation**: Arquivo está no lugar certo?
- [ ] **Imports**: Todos usados? Nenhum quebrado?
- [ ] **Padrão**: Segue colocation como `breeds/` ou `auth/`?
- [ ] **React Query**: Queries usam `useQuery`? Mutations usam `useMutation` + invalidate?
- [ ] **Zod**: Schemas em `zod/`? Tipos inferidos com `z.infer<typeof>`?
- [ ] **Erros**: Error handling explícito (toast, fallback)?
- [ ] **Tailwind**: Classes organizadas com `cn()`?
- [ ] **Duplicação**: Lógica não aparece em dois arquivos?
- [ ] **Código Morto**: Sem comentários, imports inúteis, variáveis não usadas?

---

## Tabela: Onde Colocar O Quê

| O Quê | Onde | Exemplo |
|-------|------|---------|
| **Rota principal** | `src/app/(main)/breeds/page.tsx` | Feature entry point |
| **Componente feature** | `breeds/components/*.component.tsx` | `breed-form.component.tsx` |
| **Primitiva UI** | `src/components/ui/` | `button.tsx`, `input.tsx` (shadcn) |
| **Chrome global** | `src/components/header/`, `sidebar/` | `header.component.tsx` |
| **Tipo da feature** | `breeds/types/` | `breed.types.ts` |
| **Zod schema** | `breeds/zod/` | `breeds-form.zod.ts` |
| **Utilidade feature** | `breeds/utils/` | `classify-breed-size.utils.ts` |
| **Utilidade global** | `src/utils/` | Cross-feature helpers |
| **Constante global** | `src/constants/` | `pathnames.constant.ts`, `validation-rules.constant.ts` |
| **Hook global** | `src/hooks/` | `use-mobile.ts` |
| **Supabase client** | `src/lib/supabase/` | `browser.ts`, `server.ts` |
| **Context** | `src/context/` | `theme.context.ts` |
| **Provider** | `src/providers/` | `query-client.provider.tsx` |
| **Teste** | Co-located ou `src/app/auth/tests/` | Feature test files |

---

## Red Flags: Nomenclatura

| Errado | Problema | Correto |
|--------|----------|---------|
| `handler.ts` | Handler de quê? | `submit-breed-form.handler.ts` |
| `util.ts` | Utilidade de quê? | `format-date-to-pt-br.utils.ts` |
| `utils.ts` (genérico) | Utilities para quê? | `breed-size-classification.utils.ts` |
| `helper.ts` | Helper para quê? | `validate-breed-email.ts` |
| `data.ts` | Qual dado? | `fetch-breeds-from-supabase.ts` |
| `helpers.ts` | Helpers para quê? | Separe por função real |
| `fmt()` | Formata o quê? | `formatarDataParaPtBr()` |
| `getData()` | Obtém qual dado? | `fetchBreedFromSupabase()` |
| `handleChange()` | Muda o quê? | `handleBreedNameChange()` |
| `process()` | Processa o quê? | `validateBreedFormData()` |
| `isOpen` | O que está aberto? | `isBreedFormDialogOpen` |
| `loading` | O que está carregando? | `isFormSubmitting`, `isBreedsListLoading` |
| `active` | O que está ativo? | `isBreedCardActive`, `isTabSelected` |
| `valid` | O que é válido? | `isFormDataValid`, `isUserEmailValid` |
| `error` | Qual erro? | `loginFormError`, `breadsListError` |
| `Component` | Qual componente? | `BreedForm.component.tsx` |
| `Container` | Container de quê? | `BreedListContainer.component.tsx` |
| `Page` | Qual página? | `BreedListPage.component.tsx` |
| `Wrapper` | Wrapper de quê? | `AuthenticatedLayoutWrapper.component.tsx` |

---

## Padrões Rápidos: React Query

### Query Pattern

```typescript
// ✅ Correto
const { data, isLoading, error } = useQuery({
  queryKey: ["breeds"],
  queryFn: async () => {
    const { data } = await supabaseBrowser.from("breeds").select("*");
    return data;
  },
});

if (isLoading) return <Skeleton />;
if (error) return <Error error={error} />;
if (!data?.length) return <Empty />;
```

### Mutation Pattern

```typescript
// ✅ Correto
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: async (values: FormValues) => {
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
```

---

## Padrões Rápidos: Zod + React Hook Form

### Form Pattern

```typescript
// breeds/zod/breeds-form.zod.ts
export const breedsFormZod = z.object({
  name: z.string().min(1, "Nome obrigatório"),
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

---

## Padrões Rápidos: Tailwind com `cn()`

```typescript
// ✅ Correto: Organizado por concern
className={cn(
  // Layout
  "flex flex-col gap-4 p-4",
  "md:flex-row md:gap-6",
  // Appearance
  "rounded-lg border border-gray-200",
  "bg-white dark:bg-gray-900",
  // Conditional
  isActive && "bg-primary text-white",
  variant === "destructive" && "bg-red-500"
)}
```

---

## Padrões Rápidos: Colocation

```
src/app/(main)/breeds/
  ├── page.tsx                        # "use client", useQuery, main view
  ├── layout.tsx                      # If needed
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

**Regra**: Cada feature é self-contained. Novo tipo? Adicione em `breeds/types/`. Novo schema? Adicione em `breeds/zod/`.

---

## Nomes Aprovados: Exemplos

### Funções/Utilidades
- ✅ `formatarDataParaPtBr(date)`
- ✅ `fetchBreedFromSupabase(id)`
- ✅ `classifyBreedSize(weight)`
- ✅ `validateUserEmail(email)`
- ✅ `shouldShowBreedForm(userRole)`
- ✅ `isBreedsListEmpty(breeds)`

### Componentes
- ✅ `BreedForm.component.tsx`
- ✅ `BreedCard.component.tsx`
- ✅ `BreedList.component.tsx`
- ✅ `LoginButton.component.tsx`
- ✅ `ErrorBoundary.component.tsx`

### Variáveis
- ✅ `isBreedListEmpty`
- ✅ `isFormSubmitting`
- ✅ `userCanDeleteBreed`
- ✅ `breedNameInputRef`
- ✅ `selectedBreedId`

### Arquivos
- ✅ `breed.types.ts` (tipos da feature)
- ✅ `breeds-form.zod.ts` (schema de validação)
- ✅ `classify-breed-size.utils.ts` (utilidade específica)
- ✅ `pathnames.constant.ts` (constantes)

---

## Erros Comuns: Checklist

- [ ] **Nomenclatura genérica**: `helper`, `util`, `data`, `handler` → Renomear
- [ ] **Imports quebrados**: `@/hooks/use-mobile` não existe → Remover ou restaurar
- [ ] **Feature em `src/components/`**: Deveria estar colocada → Mover
- [ ] **Sem error handling**: Forms/queries falham silencioso → Adicionar toast/fallback
- [ ] **Bare `fetch()` sem React Query**: Use `useQuery`/`useMutation`
- [ ] **Lógica duplicada**: Código em dois arquivos → Extrair para utils
- [ ] **Tipos duplicados**: Não usando `z.infer<typeof>` → Usar inferência
- [ ] **Tailwind classes longas**: Sem organização → Organizar com `cn()`
- [ ] **Dead code**: Comentários, imports inúteis → Remover
- [ ] **Client/server boundary**: Hooks em server component → Refatorar

---

## Severidade: Como Responder

### 🔴 Crítico (Bloqueia Merge)

Exija correção antes de aprovar:
- Nomenclatura genérica
- Imports quebrados
- Sem error handling em mutations
- Client/server boundary violado
- Feature component em pasta errada

### 🟡 Sugestão (Melhore Antes)

Solicite mudança:
- Lógica duplicada
- Zod schema fora de `zod/`
- Tipos não inferidos
- Tailwind desorganizado
- Edge cases não tratados

### 🟢 Nice-to-Have (Opcional)

Aprove mas sugira:
- Comentários documentando
- Nomes ainda mais descritivos
- Refatoração cosmética

---

## Quando Pedir Permissão Antes de Mudar

**Sempre pergunte se**:
- Alterar comportamento/lógica funcional
- Mudança afeta outro módulo
- Enfraqucer tipagem TypeScript
- Dúvida sobre regra de negócio
- Performance/impacto unclear

**Seguro mudar sem perguntar**:
- Renomear para clareza
- Remover código morto
- Adicionar tipagem
- Organizar imports
- Reformatar Tailwind

---

## Velocity Tips: Acelere Reviews

1. **Nomenclatura** (30 seg): Nomes claros?
2. **Colocation** (20 seg): Lugar certo?
3. **Imports** (20 seg): Válidos e usados?
4. **Padrão** (30 seg): Segue projeto?
5. **Duplicação** (20 seg): Lógica repetida?
6. **Legibilidade** (30 seg): Simples e claro?
7. **Erros** (20 seg): Tratamento explícito?
8. **Código Morto** (10 seg): Limpo?

**Total**: ~3 minutos por arquivo pequeno.

---

## Colocation vs Global Utils

**Colocation** (feature-local):
- Types específicos da feature
- Zod schemas da feature
- Componentes da feature
- Utilidades que servem apenas essa feature

**Global** (`src/utils/`, `src/lib/`, `src/constants/`):
- Utilidades usadas por 2+ features
- Helpers genéricos (formatação, validação cross-feature)
- Constantes globais (rotas, valores padrão)
- Clientes e configuração

**Regra de ouro**: Quando criar nova utilidade, pergunte: "Isso é específico dessa feature ou é usado em outro lugar?" Se feature-specific, coloque na feature.

---

## Links Importantes

- **Regra de Nomenclatura**: `.cursor/rules/nomenclaturas.mdc`
- **Agent de Code Review**: `.cursor/agents/code-review.mdc`
- **Padrão de Features**: `src/app/(main)/breeds/` (referência)
- **Exemplo de Auth**: `src/app/auth/` (referência)
- **Configurações**:
  - TypeScript: `tsconfig.json`
  - Tailwind: `tailwind.config.js`
  - Vitest: `vitest.config.ts`
  - shadcn: `components.json`

---

## Flow Recomendado para Review

1. Ler arquivo uma vez (contexto geral)
2. Passar na nomenclatura (30 sec)
3. Verificar colocation (20 sec)
4. Verificar imports (20 sec)
5. Comparar com padrão similar (30 sec)
6. Procurar duplicação (20 sec)
7. Avaliar legibilidade (30 sec)
8. Verificar error handling (20 sec)
9. Procurar código morto (10 sec)
10. Decidir: 🔴 🟡 🟢 (10 sec)

Se encontrar 🔴, solicite mudança. Se 🟡, sugira. Se 🟢, aprove.

---

## Comunicação com Autor

**Problema encontrado?**

1. Identifique o problema
2. Explique por que está errado
3. Mostre padrão similar no projeto
4. Sugira solução específica
5. Se dúvida, pergunte antes de alterar

**Exemplo de resposta boa**:

> "Este arquivo usa nomenclatura genérica `utils.ts`. No projeto, usamos nomes específicos como `breed-size-classification.utils.ts`. Vê `src/app/(main)/breeds/utils/` para referência.
> 
> Sugiro renomear para `${WHAT_THIS_DOES}.utils.ts`. O que faz?"

**Exemplo de resposta ruim**:

> "Nomenclatura ruim. Renomeia."

Sempre explique e guie.
