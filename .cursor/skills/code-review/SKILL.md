---
name: code-review
description: Revisa e padroniza código de qualquer parte do projeto (frontend, backend, utils, tipos, configurações). Identifica desvios de arquitetura, nomenclaturas genéricas, duplicações, código morto, baixa legibilidade, e estruturas mal organizadas. Valida alinhamento com padrões do projeto, reutilização, colocation, e segurança de refatoração. Aplicado automaticamente pelo agent de code-review.
---

# Skill: Code Review e Padronização de Projeto

Guia completo e escalável para revisar **qualquer código** do projeto **pets** (Next.js 16, React 19, TypeScript, Supabase, React Query, Tailwind CSS).

Revise **arquivo por arquivo e módulo por módulo**, identificando desvios de padrão, duplicações, baixa legibilidade, nomenclaturas ruins, código morto, e estruturas mal organizadas. Mantenha o código **limpo, escalável, reutilizável, bem escrito, bem indentado e alinhado com padrões existentes**.

---

## Princípio Fundamental: Nomenclatura Clara

**Referência obrigatória**: `.cursor/rules/nomenclaturas.mdc`

A clareza é **prioridade máxima** em qualquer identificador:

- ✅ **Nomes comunicam exatamente**: o que representa, o que faz, qual responsabilidade possui
- ✅ **Código legível apenas por nomes**: sem ler implementação, deve ser intuitivo
- ✅ **Específico e explícito**: nunca genérico quando alternativa clara existe
- ✅ **Alinhado ao domínio**: português aceitável para helpers de domínio e copy do usuário; código base em English

**Regra de ouro**: Se o nome não responder claramente "O que é isso?", "O que faz?" ou "Qual dado representa?", está errado.

### Red Flags de Nomenclatura

| Errado | Problema | Correto |
|--------|----------|---------|
| `helper.ts` | O que ajuda? | `format-date-to-pt-br.ts` |
| `utils.ts` | Utilidade de quê? | `breed-size-classification.utils.ts` |
| `data.ts` | Qual dado? | `fetch-breeds-from-supabase.ts` |
| `fmt()` | Formata o quê? | `formatarDataParaPtBr()` |
| `getData()` | Obtém qual dado? | `fetchBreedFromSupabase()` |
| `isOpen` | O que está aberto? | `isBreedFormDialogOpen` |
| `Handler` | Manipula o quê? | `SubmitBreedFormHandler` |
| `handle()` | Trata o quê? | `handleBreedSizeChange()` |
| `state` | Qual estado? | `breedFormValues` |
| `component` | Qual componente? | `BreedForm.component.tsx` |

---

## Estrutura e Padrões do Projeto

### Colocation Pattern (Obrigatório para Features)

Cada feature deve conter **seus próprios tipos, schemas, utilidades e componentes**:

```
src/app/(main)/breeds/
  ├── page.tsx                    # Rota principal
  ├── layout.tsx                  # Layout se necessário
  ├── components/                 # Componentes da feature
  │   ├── breed-list.component.tsx
  │   ├── breed-form.component.tsx
  │   └── breed-card.component.tsx
  ├── types/                      # Tipos específicos
  │   └── breed.types.ts
  ├── zod/                        # Validação e schemas
  │   └── breeds-form.zod.ts
  └── utils/                      # Utilidades da feature
      └── classify-breed-size.utils.ts
```

**Regra**: Nunca coloque lógica de uma feature em `src/components/` ou `src/utils/` com o mesmo propósito que seria colocado na feature-local.

**Exceções**:
- Primitivas UI (`src/components/ui/`) → **apenas shadcn**
- Chrome da app (`src/components/header/`, `src/components/sidebar/`) → global
- Utilidades verdadeiramente compartilhadas (`src/utils/`, `src/lib/`, `src/constants/`) → cross-feature

### Planta do Projeto

```
src/
  ├── app/
  │   ├── layout.tsx              # Root: fonts, providers, Sonner
  │   ├── globals.css             # Tailwind imports
  │   ├── (main)/
  │   │   ├── layout.tsx          # Header + main container
  │   │   ├── page.tsx            # Home
  │   │   └── breeds/             # Feature: breeds
  │   ├── auth/                   # Feature: autenticação
  │   ├── middleware.ts           # Auth gate + session refresh
  ├── components/
  │   ├── ui/                     # Primitivas shadcn (não mover)
  │   └── header/                 # Chrome da app
  ├── lib/
  │   ├── utils.ts                # `cn()` do Tailwind
  │   └── supabase/               # Clientes Supabase
  ├── providers/                  # React Query, context
  ├── constants/                  # Rotas, valores globais
  ├── hooks/                      # Custom hooks globais
  ├── context/                    # Context globais
  └── utils/                      # Utilidades cross-feature
```

---

## Dimensões de Revisão

### 1. Nomenclatura e Clareza

**Checklist**:
- [ ] Nomes de arquivos são descritivos e específicos?
- [ ] Variáveis/funções respondem "O que é?" ou "O que faz?"?
- [ ] Evita genéricos: `helper`, `util`, `data`, `handler`, `component`?
- [ ] Booleans são explícitos? (`isBreedListEmpty`, não `isEmpty`)
- [ ] Abreviações foram evitadas? (Spell out domain terms)
- [ ] Nomenclatura alinhada com outros arquivos similares no projeto?

**Ação**: Se encontrar nome genérico, solicite renomeação antes de aprovar.

### 2. Colocation e Organização

**Checklist**:
- [ ] Tipos específicos da feature estão em `types/`?
- [ ] Zod schemas estão em `zod/`?
- [ ] Componentes da feature estão em `components/`?
- [ ] Utilidades específicas estão em `utils/` (local ou global)?
- [ ] UI primitivas **apenas** em `src/components/ui/`?
- [ ] Chrome da app em `src/components/` (não em features)?

**Ação**: Se componente/tipo/util estiver fora do lugar, peça reorganização.

### 3. Duplicação e Reutilização

**Checklist**:
- [ ] Lógica/código não aparece em dois ou mais arquivos?
- [ ] Utilidades compartilhadas estão em `src/utils/` ou `src/lib/`?
- [ ] Schemas/validações compartilhadas vivem em um local único?
- [ ] Componentes não são clones uns dos outros?

**Ação**: Se encontrar duplicação, extraia para utilidade ou hook compartilhado.

### 4. Legibilidade e Complexidade

**Checklist**:
- [ ] Funções são pequenas e focadas em uma responsabilidade?
- [ ] Nível de indentação é raso (≤ 3 níveis)?
- [ ] Lógica condicional é clara, sem nesting profundo?
- [ ] Variáveis temporárias têm nomes explícitos?
- [ ] Blocos de código longos podem ser extraídos em funções?

**Ação**: Refatore para simplificar sem alterar comportamento.

### 5. Importações e Dependências

**Checklist**:
- [ ] Todas importações são usadas?
- [ ] Caminhos `@/` existem (sem quebrados)?
- [ ] Não há imports circulares?
- [ ] Ordem de imports é consistente (ou usa sort automático)?
- [ ] Sem dead code ou imports de arquivos deletados?

**Ação**: Remova imports não usados. Avise sobre imports quebrados.

### 6. Alinhamento com Padrões Existentes

**Checklist**:
- [ ] Segue o padrão de colocation como `breeds/` e `auth/`?
- [ ] Nomes seguem convenção do projeto? (`*.component.tsx`, `*.zod.ts`, `*.utils.ts`)
- [ ] Data fetching usa React Query (não bare `fetch`)?
- [ ] Forms usam `react-hook-form` + `zodResolver` + tipos inferidos?
- [ ] Tipos são inferidos de Zod (`z.infer<typeof schema>`)?
- [ ] Middleware segue padrão de auth gate?
- [ ] Tailwind usa `cn()` e classes, não CSS customizado?

**Ação**: Se desviar, mostre padrão similar no projeto e peça alinhamento.

### 7. Tratamento de Erros e Edge Cases

**Checklist**:
- [ ] Queries têm tratamento de erro (toast, fallback)?
- [ ] Mutations invalidam cache após sucesso?
- [ ] Formulários lidam com loading/error/success?
- [ ] APIs/Supabase têm try-catch ou error handling?
- [ ] Estados vazios são tratados (loading, error, empty)?
- [ ] Sem erros silenciosos ou consoladores vazios?

**Ação**: Exija error handling explícito em mutações/queries.

### 8. Segurança de Refatoração

**Pergunta antes de alterar**:
- Essa mudança altera comportamento?
- Afeta código fora deste arquivo?
- Há testes que cobrem essa lógica?
- Impacto é claro e documentado?

**Se dúvida**: Pause e pergunte ao autor.

### 9. Código Morto

**Checklist**:
- [ ] Sem blocos comentados?
- [ ] Sem variáveis declaradas mas não usadas?
- [ ] Sem funções/componentes exportados mas não importados?
- [ ] Sem condições inalcançáveis?
- [ ] Sem imports de módulos deletados?

**Ação**: Remova sem hesitar.

### 10. Types e Tipagem TypeScript

**Checklist**:
- [ ] Types são explícitos e não `any`?
- [ ] Tipos de formulário são inferidos de Zod?
- [ ] Props de componentes têm interface clara?
- [ ] Retornos de função têm tipos anotados?
- [ ] Sem uso de `as` cast desnecessário?

**Ação**: Fortaleça tipagem onde houver `any` ou tipos débeis.

---

## Workflow de Revisão

Siga esta ordem para review rápido e eficiente:

1. **Nomenclatura** (30 seg): Nomes são claros? Evita genéricos?
2. **Colocation** (20 seg): Arquivo está no lugar certo?
3. **Imports** (20 seg): Todos usados? Nenhum quebrado?
4. **Padrão** (30 seg): Segue pattern do projeto?
5. **Duplicação** (20 seg): Lógica repetida?
6. **Legibilidade** (30 seg): Código é fácil de ler?
7. **Erros** (20 seg): Tratamento explícito?
8. **Código Morto** (10 seg): Comentários? Imports inúteis?

**Tempo total**: ~3 minutos por arquivo pequeno. Escale conforme complexidade.

---

## Padrões Comuns e Verificações Rápidas

### React Query Pattern

```typescript
// ✅ Correto
const { data, isLoading, error } = useQuery({
  queryKey: ["breeds"],
  queryFn: async () => { /* fetch */ },
});

if (isLoading) return <SkeletonLoader />;
if (error) return <ErrorUI />;
```

```typescript
// ❌ Errado (sem pattern de loading/error)
const [breeds, setBreeds] = useState([]);
useEffect(() => {
  fetch("/api/breeds").then(setBreeds);
}, []);
```

**Flag**: Se `useEffect` + `useState` para dados, sugira React Query.

### Zod + React Hook Form

```typescript
// ✅ Correto
export const formZod = z.object({
  name: z.string().min(1, "Campo obrigatório"),
});
export type FormValues = z.infer<typeof formZod>;

const form = useForm<FormValues>({
  resolver: zodResolver(formZod),
});
```

```typescript
// ❌ Errado (tipos duplicados)
type FormValues = { name: string };
const schema = z.object({ name: z.string() });
```

**Flag**: Se tipos forem duplicados, use `z.infer<typeof>`.

### Tailwind com `cn()`

```typescript
// ✅ Correto
className={cn(
  "flex flex-col gap-4 p-4",
  "md:flex-row md:gap-6",
  isActive && "bg-primary"
)}
```

```typescript
// ❌ Errado (long unorganized string)
className="flex flex-col gap-4 p-4 md:flex-row md:gap-6 bg-primary"
```

**Flag**: Se classes forem longas/desorganizadas, organize com `cn()`.

### Componentes vs Primitivas UI

```
src/components/ui/                    # ✅ shadcn only
  ├── button.tsx
  └── dialog.tsx

src/components/                        # ✅ App chrome
  ├── header.component.tsx
  └── sidebar.component.tsx

src/app/(main)/breeds/components/     # ✅ Feature components
  ├── breed-form.component.tsx
  └── breed-card.component.tsx
```

**Flag**: Se componente de feature estiver em `src/components/` (não UI/header/sidebar), mova para feature-local.

### Nomenclatura de Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente | `*.component.tsx` | `breed-form.component.tsx` |
| Hook | `use-*.ts` | `use-breed-form-submit.ts` |
| Utilidade | `*-*.utils.ts` | `format-date-to-pt-br.utils.ts` |
| Tipos | `*.types.ts` | `breed.types.ts` |
| Zod/Validação | `*.zod.ts` | `breeds-form.zod.ts` |
| Constantes | `*.constant.ts` | `pathnames.constant.ts` |
| Primitiva UI | `*.tsx` (no ui/) | `button.tsx` |

**Flag**: Se nomes não seguem padrão, padronize.

---

## Severidade de Issues

| 🔴 Crítico | Bloqueia merge |
|----------|---|
| Nomenclatura genérica (`helper`, `data`, `util`) | Renomear |
| Imports quebrados (arquivo não existe) | Remover ou restaurar |
| Sem error handling em queries/mutations | Adicionar |
| Client/server boundary violado | Refatorar |
| Feature component em `src/components/` | Mover para colocation |

| 🟡 Sugestão | Melhore antes de merge |
|----------|---|
| Lógica duplicada | Extrair para utils |
| Zod schema fora de `zod/` | Mover para colocation |
| Tipos duplicados (não inferindo Zod) | Usar `z.infer<typeof>` |
| Tailwind classes desorganizadas | Organizar com `cn()` |
| Sem edge case handling | Adicionar tratamento |

| 🟢 Nice-to-Have | Opcional |
|----------|---|
| Comentários documentando lógica complexa | Adicionar se ajudar |
| Refatoração cosmética | Okay, but not required |
| Nomes ainda mais descritivos | Approve se already clear |

---

## Quando Pedir Confirmação

**Sempre peça permissão se**:
- Alterar comportamento ou lógica funcional
- Mudança afeta outro módulo/feature
- Tipagem TypeScript ser enfraquecida
- Dúvida sobre regra de negócio
- Performance/impacto unclear
- Migração de padrão (ex: componente class → functional)

**Seguro mudar sem perguntar**:
- Renomear variáveis/funções (clareza)
- Remover código morto
- Adicionar tipos/tipagem
- Organizar imports
- Reformatar Tailwind com `cn()`
- Extrair função/utilidade pura

---

## Checklist Rápida

- [ ] Nomenclatura explícita (sem `helper`, `util`, `data`)?
- [ ] Arquivo no lugar certo (colocation)?
- [ ] Todos imports usados? Nenhum quebrado?
- [ ] Segue padrão do projeto (zod, react-query, tailwind)?
- [ ] Sem duplicação de lógica?
- [ ] Legível e simples (não over-engineered)?
- [ ] Error handling explícito?
- [ ] Sem código morto (comentários, imports inúteis)?
- [ ] TypeScript tipado (sem `any`)?
- [ ] Safe to refactor (ou pedir permissão)?

---

## Referências Rápidas

- **Regra de Nomenclatura**: `.cursor/rules/nomenclaturas.mdc`
- **Agent de Code Review**: `.cursor/agents/code-review.mdc`
- **Padrão de Colocation**: Veja `src/app/(main)/breeds/`
- **TypeScript Config**: `tsconfig.json`
- **Tailwind Config**: `tailwind.config.js`
- **Vitest Config**: `vitest.config.ts`
- **Components Config**: `components.json` (shadcn)

---

## Exemplos Reais de Issues

Veja `examples.md` para 10 exemplos concretos de problemas encontrados e como corrigi-los.

Veja `reference.md` para quick-ref de padrões, red flags e nomes aprovados.
