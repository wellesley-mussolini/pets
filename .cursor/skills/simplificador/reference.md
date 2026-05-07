# Referência Rápida: Simplificador

Playbook de micro-padrões — antes/depois para cada categoria de problema. Use como lookup rápido durante o review + refactor.

---

## Decisão Rápida: Aplicar ou Perguntar?

| Mudança | Decisão |
|---------|---------|
| Remover `console.log` | Aplicar |
| Remover código comentado | Aplicar |
| Remover import não usado | Aplicar |
| Renomear variável local | Aplicar |
| Extrair função pura (sem alterar assinatura exportada) | Aplicar |
| Substituir `any` por tipo explícito | Aplicar |
| Organizar Tailwind com `cn()` | Aplicar |
| Usar `z.infer<typeof>` para tipo duplicado | Aplicar |
| Substituir loop por operação nativa | Aplicar |
| Mover tipo de componente para `types/` | Aplicar |
| Mover constante para `constants/` | Aplicar |
| Alterar assinatura de função exportada | Perguntar |
| Reorganizar arquivos (impacta imports externos) | Perguntar |
| Alterar schema Zod exportado | Perguntar |
| Alterar lógica condicional complexa | Perguntar |
| Remover código que parece não usado (mas pode ter propósito) | Perguntar |

---

## Categoria 1: Tipagem

### Remover `any`

```typescript
// ❌
function formatar(valor: any): any {
  return valor.toUpperCase();
}

// ✅
function formatarParaMaiusculo(valor: string): string {
  return valor.toUpperCase();
}
```

### Tipo inferido de Zod (não duplicar)

```typescript
// ❌ Tipo declarado manualmente e duplicado
const meuSchema = z.object({ nome: z.string(), idade: z.number() });
type MeuTipo = { nome: string; idade: number };

// ✅ Tipo inferido automaticamente
const meuSchema = z.object({ nome: z.string(), idade: z.number() });
type MeuTipo = z.infer<typeof meuSchema>;
```

### Tipo de componente fora de `types/`

```typescript
// ❌ Tipo declarado no componente
// meu.component.tsx
type PropriedadesBotao = {
  onClick: () => void;
  rotulo: string;
};

// ✅ Tipo declarado em `types/`
// types/meu.types.ts
export type PropriedadesBotao = {
  onClick: () => void;
  rotulo: string;
};
```

### Props de componente com tipo explícito

```typescript
// ❌
function MeuComponente(props: any) { ... }

// ✅
type MeuComponenteProps = {
  titulo: string;
  onConfirmar: () => void;
  itens: Item[];
};
function MeuComponente({ titulo, onConfirmar, itens }: MeuComponenteProps) { ... }
```

---

## Categoria 2: Constantes Fora do Lugar

### Constante CSS no componente → `constants/`

```typescript
// ❌ Constante CSS declarada no componente
// meu.component.tsx
const CLASSES_INPUT = "h-auto rounded-md bg-white px-3 py-3";
const CLASSES_BOTAO = "absolute top-1/2 right-3 rounded-md p-1";

// ✅ Constante em `constants/`
// constants/estilos-formulario.constants.ts
export const estilosFormulario = {
  inputPadrao: "h-auto rounded-md bg-white px-3 py-3",
  botaoAcaoInterna: "absolute top-1/2 right-3 rounded-md p-1",
} as const;
```

---

## Categoria 3: Loops e Operações Nativas

### Loop manual → `.replace()`

```typescript
// ❌
let resultado = "";
for (let i = 0; i < valor.length; i++) {
  if ("0123456789".includes(valor[i])) resultado += valor[i];
}

// ✅
const resultado = valor.replace(/\D/g, "");
```

### Loop `for` → `.map()` / `.filter()` / `.find()` / `.reduce()` / `.some()`

```typescript
// ❌
const nomes: string[] = [];
for (let i = 0; i < usuarios.length; i++) nomes.push(usuarios[i].nome);

// ✅
const nomes = usuarios.map(u => u.nome);
```

```typescript
// ❌
const ativos: Usuario[] = [];
for (let i = 0; i < usuarios.length; i++) {
  if (usuarios[i].ativo) ativos.push(usuarios[i]);
}

// ✅
const ativos = usuarios.filter(u => u.ativo);
```

```typescript
// ❌
let existeAtivo = false;
for (const u of usuarios) { if (u.ativo) { existeAtivo = true; break; } }

// ✅
const existeAtivo = usuarios.some(u => u.ativo);
```

---

## Categoria 4: Responsabilidades

### Separar responsabilidades em um componente

```typescript
// ❌ Componente que faz tudo
function ListagemDeItens() {
  const [dados, setDados] = useState([]);
  useEffect(() => { fetch("/api/itens").then(r => r.json()).then(setDados); }, []);
  const filtrados = dados.filter(d => d.ativo);
  return <ul>{filtrados.map(d => <li key={d.id}>{d.nome}</li>)}</ul>;
}

// ✅ Cada parte com propósito único
function useItens() {
  return useQuery({
    queryKey: ["itens"],
    queryFn: async () => {
      const { data } = await supabase.from("itens").select("*");
      return data || [];
    },
  });
}

function filtrarItensAtivos(itens: Item[]): Item[] {
  return itens.filter(i => i.ativo);
}

function ListagemDeItens() {
  const { data: itens } = useItens();
  const ativos = filtrarItensAtivos(itens || []);
  return <ul>{ativos.map(i => <li key={i.id}>{i.nome}</li>)}</ul>;
}
```

### Lógica de negócio no componente → hook

```typescript
// ❌ Toda lógica dentro do componente
function MeuFormulario() {
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (valores) => {
    setIsLoading(true);
    try { /* lógica de negócio */ } finally { setIsLoading(false); }
  };
  return <form onSubmit={handleSubmit}>{/* JSX */}</form>;
}

// ✅ Lógica no hook, componente só renderiza
function useMeuFormulario() {
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (valores) => { ... };
  return { isLoading, handleSubmit };
}

function MeuFormulario() {
  const { isLoading, handleSubmit } = useMeuFormulario();
  return <form onSubmit={handleSubmit}>{/* JSX */}</form>;
}
```

---

## Categoria 5: Duplicação

### Extrair lógica duplicada para utils

```typescript
// ❌ Mesma lógica em dois arquivos
// arquivo A: const ativos = lista.filter(i => i.ativo && i.dataCriacao >= limite);
// arquivo B: const ativos = lista.filter(i => i.ativo && i.dataCriacao >= limite);

// ✅ Extraída uma vez
export function filtrarItensAtivosRecentes(itens: Item[], limite: Date): Item[] {
  return itens.filter(i => i.ativo && i.dataCriacao >= limite);
}
```

---

## Categoria 6: Nomenclatura

### Nomes genéricos → nomes explícitos

```typescript
// ❌
const data = await getData();
function handle(x: any) { ... }
const handler = () => submitForm();

// ✅
const racasSalvas = await fetchRacasDoSupabase();
function handleBreedFormSubmit(valores: BreedFormValues) { ... }
const handleSalvarRaca = () => submitBreedForm();
```

### Booleans explícitos

```typescript
// ❌
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);

// ✅
const [isBreedFormDialogOpen, setIsBreedFormDialogOpen] = useState(false);
const [isFormSubmitting, setIsFormSubmitting] = useState(false);
```

---

## Categoria 7: Código Morto

```typescript
// ❌
console.log("debug");
// const antigaFuncao = () => { ... };
import { useState, useEffect, useCallback } from "react"; // useCallback não usado

// ✅
import { useState, useEffect } from "react"; // apenas o que é usado
```

---

## Categoria 8: Performance

### N+1 queries → query única

```typescript
// ❌ N+1
const itens = await buscarItens();
for (const item of itens) {
  item.detalhes = await buscarDetalhes(item.id);
}

// ✅ Uma query com join
const { data } = await supabase
  .from("itens")
  .select("*, detalhes:item_detalhes(*)");
```

### Estado async → React Query

```typescript
// ❌
const [dados, setDados] = useState(null);
const [isLoading, setIsLoading] = useState(false);
useEffect(() => { /* fetch manual */ }, []);

// ✅
const { data: dados, isLoading, error } = useQuery({
  queryKey: ["dados"],
  queryFn: () => supabase.from("dados").select("*").then(r => r.data),
});
```

---

## Categoria 9: Tailwind e Estilo

```typescript
// ❌ String longa e ilegível
className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow md:flex-row md:gap-6"

// ✅ Organizado com cn()
className={cn(
  "flex flex-col gap-4 p-4",
  "md:flex-row md:gap-6",
  "rounded-lg border border-gray-200",
  "bg-white dark:bg-gray-900",
  "shadow-md hover:shadow-lg transition-shadow"
)}
```

---

## Tabela: Onde Colocar O Quê

| O Quê | Onde |
|-------|------|
| Tipo de componente/módulo | `src/modules/<nome>/types/` |
| Tipo compartilhado | `src/types/` |
| Constante de módulo (CSS, textos, configs) | `src/modules/<nome>/constants/` |
| Schema Zod | `src/modules/<nome>/zod/` |
| Lógica de negócio (hooks) | `src/modules/<nome>/hooks/` |
| Utilitário de módulo | `src/modules/<nome>/utils/` |
| Componente de feature | `src/app/(main)/<feature>/components/` |
| Primitiva UI | `src/components/ui/` |
| Chrome global | `src/components/<header|sidebar>/` |
| Utilitário global | `src/utils/` |
| Constante global | `src/constants/` |

---

## Checklist de Review + Refactor Antes de Finalizar

- [ ] Todos os `any` foram substituídos por tipos explícitos?
- [ ] Tipos de componente foram movidos para `types/`?
- [ ] Constantes foram movidas para `constants/`?
- [ ] Tipos duplicados de Zod foram removidos (usando `z.infer`)?
- [ ] Todos os `console.log` foram removidos?
- [ ] Todo código comentado foi removido?
- [ ] Todos os imports não usados foram removidos?
- [ ] Loops manuais foram substituídos por operações nativas quando mais claro?
- [ ] Funções com múltiplas responsabilidades foram separadas?
- [ ] Lógica de negócio foi extraída para hooks?
- [ ] Lógica duplicada foi extraída para utils?
- [ ] Nomes genéricos foram renomeados para nomes explícitos?
- [ ] Classes Tailwind foram organizadas com `cn()`?
- [ ] O comportamento original foi preservado?
- [ ] Os testes existentes continuam passando?
- [ ] O output de análise e resultado foi apresentado?
