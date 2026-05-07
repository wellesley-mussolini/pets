# Exemplos: Simplificador (Review + Refactor)

Exemplos completos de problemas encontrados e como corrigi-los em um único passo.

---

## Exemplo 1: Util com Múltiplas Responsabilidades e Loop Manual

### ❌ Antes

```typescript
// utils/documento.ts
export const documentoUtils = {
  limparEVerDocumento: (x: any): any => {
    let a = "";
    for (let i = 0; i < x.length; i++) {
      if ("0123456789".includes(x[i])) a += x[i];
    }
    if (a.length === 11) { console.log("cpf"); return { tipo: "CPF", valido: true }; }
    if (a.length === 14) { console.log("cnpj"); return { tipo: "CNPJ", valido: true }; }
    console.log("deu ruim");
    return false;
  },
};
```

**Problemas**:
- 🔴 Parâmetro e retorno `any`
- 🔴 Uma função com 3 responsabilidades: limpar, identificar, retornar
- 🔴 Loop manual substituível por `.replace(/\D/g, "")`
- 🔴 `console.log` em produção
- 🔴 Nome genérico `limparEVerDocumento`
- 🔴 Retorno inconsistente: objeto no sucesso, `false` no erro

### ✅ Depois

```typescript
// utils/regex.utils.ts
export const regexUtils = {
  manterApenasNumeros: (valor: string): string => valor.replace(/\D/g, ""),
};

// utils/documento.utils.ts
export type TipoDocumento = "CPF" | "CNPJ" | "INVALIDO";

export const documentoUtils = {
  identificarTipo: (valor: string): TipoDocumento => {
    const numeros = regexUtils.manterApenasNumeros(valor);
    if (numeros.length === 11) return "CPF";
    if (numeros.length === 14) return "CNPJ";
    return "INVALIDO";
  },
};
```

---

## Exemplo 2: Tipo e Constante Declarados no Componente

### ❌ Antes

```typescript
// auth-form.component.tsx
const CLASSES_INPUT = "h-auto rounded-md bg-white px-3 py-3 text-base shadow-none md:text-sm";
const CLASSES_BOTAO = "absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-gray-400";

type PropriedadesBotaoSenha = {
  senhaVisivelComoTexto: boolean;
  aoClicarAlternar: () => void;
};

function BotaoSenha({ senhaVisivelComoTexto, aoClicarAlternar }: PropriedadesBotaoSenha) {
  ...
}
```

**Problemas**:
- 🔴 Constantes CSS declaradas no componente — devem estar em `constants/`
- 🔴 Tipo de props declarado no componente — deve estar em `types/`

### ✅ Depois

```typescript
// constants/estilos-autenticacao.constants.ts
export const estilosAutenticacao = {
  inputPadrao: "h-auto rounded-md bg-white px-3 py-3 text-base shadow-none md:text-sm",
  botaoAlternarSenha: "absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-gray-400",
} as const;

// types/auth.types.ts
export type PropriedadesBotaoSenha = {
  senhaVisivelComoTexto: boolean;
  aoClicarAlternar: () => void;
};

// auth-form.component.tsx
import { estilosAutenticacao } from "../constants/estilos-autenticacao.constants";
import type { PropriedadesBotaoSenha } from "../types/auth.types";

function BotaoSenha({ senhaVisivelComoTexto, aoClicarAlternar }: PropriedadesBotaoSenha) {
  ...
}
```

---

## Exemplo 3: Componente com Múltiplas Responsabilidades

### ❌ Antes

```typescript
// components/lista.tsx
export function Lista() {
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/itens")
      .then(r => r.json())
      .then(d => { setItens(d); setLoading(false); })
      .catch(e => { console.log(e); setLoading(false); });
  }, []);

  const handle = (item: any) => { setSelected(item); setOpen(true); };

  if (loading) return <p>Carregando...</p>;
  return (
    <div>
      {itens.filter(i => i.ativo).map((i: any) => (
        <div key={i.id} onClick={() => handle(i)}>
          <p>{i.nome}</p>
        </div>
      ))}
      {open && <div>{selected?.nome}</div>}
    </div>
  );
}
```

**Problemas**:
- 🔴 `any` em todos os lugares
- 🔴 `useEffect` + `useState` para dados async
- 🔴 Componente com 4 responsabilidades
- 🔴 `console.log` de erro sem tratar para o usuário
- 🔴 Nomes genéricos: `handle`, `open`, `loading`, `selected`

### ✅ Depois

```typescript
// types/item.types.ts
export interface Item {
  id: string;
  nome: string;
  ativo: boolean;
}

// utils/filtrar-itens-ativos.utils.ts
export function filtrarItensAtivos(itens: Item[]): Item[] {
  return itens.filter(i => i.ativo);
}

// components/item-card.component.tsx
type ItemCardProps = { item: Item; onSelecionar: (item: Item) => void };
export function ItemCard({ item, onSelecionar }: ItemCardProps) {
  return <div onClick={() => onSelecionar(item)}><p>{item.nome}</p></div>;
}

// page.tsx
export default function ItensPage() {
  const [itemSelecionado, setItemSelecionado] = useState<Item | null>(null);
  const [isModalAberto, setIsModalAberto] = useState(false);

  const { data: itens, isLoading, error } = useQuery({
    queryKey: ["itens"],
    queryFn: async () => {
      const { data, error } = await supabase.from("itens").select("*");
      if (error) throw new Error(error.message);
      return data as Item[];
    },
  });

  const handleSelecionarItem = (item: Item) => {
    setItemSelecionado(item);
    setIsModalAberto(true);
  };

  if (isLoading) return <SkeletonListagem />;
  if (error) return <ErroListagem />;
  if (!itens?.length) return <ListaVazia />;

  return (
    <div>
      {filtrarItensAtivos(itens).map(item => (
        <ItemCard key={item.id} item={item} onSelecionar={handleSelecionarItem} />
      ))}
      {isModalAberto && itemSelecionado && <div>{itemSelecionado.nome}</div>}
    </div>
  );
}
```

---

## Exemplo 4: Lógica de Negócio no Componente → Hook

### ❌ Antes

```typescript
// formulario.component.tsx
export function Formulario() {
  const roteador = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const referenciaEnvioDuplicado = useRef(false);

  const handleSubmit = async (valores) => {
    if (referenciaEnvioDuplicado.current) return;
    referenciaEnvioDuplicado.current = true;
    setIsLoading(true);
    try {
      await supabase.auth.signInWithPassword({ ... });
      roteador.push("/");
    } catch {
      setIsLoading(false);
      referenciaEnvioDuplicado.current = false;
    }
  };

  return <form onSubmit={handleSubmit}>{/* 400 linhas de JSX */}</form>;
}
```

**Problema**: Componente mistura lógica de negócio com renderização — viola SRP.

### ✅ Depois

```typescript
// hooks/useFormulario.hook.tsx
export function useFormulario() {
  const roteador = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const referenciaEnvioDuplicado = useRef(false);

  const liberarEnvioEPararCarregamento = () => {
    referenciaEnvioDuplicado.current = false;
    setIsLoading(false);
  };

  const enviarFormulario = async (valores) => {
    if (referenciaEnvioDuplicado.current) return;
    referenciaEnvioDuplicado.current = true;
    setIsLoading(true);
    try {
      await supabase.auth.signInWithPassword({ ... });
      roteador.push("/");
    } catch {
      liberarEnvioEPararCarregamento();
    }
  };

  return { isLoading, enviarFormulario };
}

// formulario.component.tsx
export function Formulario() {
  const { isLoading, enviarFormulario } = useFormulario();
  return <form onSubmit={enviarFormulario}>{/* JSX limpo */}</form>;
}
```

---

## Exemplo 5: Nomeclatura Genérica → Explícita

### ❌ Antes

```typescript
const data = await getData();
function handle(x: any) { ... }
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);
```

### ✅ Depois

```typescript
const racasSalvas = await fetchRacasDoSupabase();
function handleBreedFormSubmit(valores: BreedFormValues) { ... }
const [isBreedFormDialogOpen, setIsBreedFormDialogOpen] = useState(false);
const [isFormSubmitting, setIsFormSubmitting] = useState(false);
```

---

## Exemplo 6: N+1 Queries → Query Única

### ❌ Antes

```typescript
const itens = await buscarItens();
for (const item of itens) {
  item.detalhes = await buscarDetalhes(item.id); // N chamadas extras!
}
```

### ✅ Depois

```typescript
const { data: itensComDetalhes } = await supabase
  .from("itens")
  .select("*, detalhes:item_detalhes(*)");
```

---

## Exemplo 7: Tipos Duplicados → Inferência de Zod

### ❌ Antes

```typescript
// zod/form.zod.ts
export const formZod = z.object({ nome: z.string(), tamanho: z.enum(["P", "M", "G"]) });

// types/form.types.ts — DUPLICADO!
export type FormValues = { nome: string; tamanho: "P" | "M" | "G" };
```

### ✅ Depois

```typescript
// zod/form.zod.ts
export const formZod = z.object({ nome: z.string(), tamanho: z.enum(["P", "M", "G"]) });

// types/form.types.ts — INFERIDO, não duplicado
export type FormValues = z.infer<typeof formZod>;
```

---

## Exemplo 8: Barrel File Proibido

### ❌ Antes

```typescript
// types/auth.types.ts
export type { ValoresFormularioEntrar } from "../zod/auth.zod"; // só reexporta!
export { esquemasValidacao } from "../zod/auth.zod";            // só reexporta!
```

### ✅ Depois

```typescript
// types/auth.types.ts — tipos DEFINIDOS aqui
import type { z } from "zod";
type EsquemasValidacao = typeof import("../zod/auth.zod").esquemasValidacao;
export type ValoresFormularioEntrar = z.infer<EsquemasValidacao["entrar"]>;

// quem precisa do schema importa direto:
import { esquemasValidacao } from "../zod/auth.zod";
```

---

## Exemplo 9: Classes Tailwind Desorganizadas

### ❌ Antes

```typescript
className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow md:flex-row md:gap-6"
```

### ✅ Depois

```typescript
className={cn(
  "flex flex-col gap-4 p-4",
  "md:flex-row md:gap-6",
  "rounded-lg border border-gray-200",
  "bg-white dark:bg-gray-900",
  "shadow-md hover:shadow-lg transition-shadow",
)}
```

---

## Exemplo 10: Componente Gigante → Decomposição

### ❌ Antes

```
MeuFormulario.tsx — 500 linhas
  - 5 useState
  - 3 handlers de submit
  - 2 subcomponentes inline (BotaoA, BotaoB)
  - 2 constantes CSS
  - 1 type de props de subcomponente
  - toda a lógica de negócio
```

### ✅ Depois

```
types/meu-formulario.types.ts     ← tipos dos subcomponentes
constants/estilos-formulario.constants.ts  ← constantes CSS
hooks/useMeuFormulario.hook.tsx   ← toda lógica de negócio
components/botao-a.component.tsx  ← subcomponente A
components/botao-b.component.tsx  ← subcomponente B
components/meu-formulario.component.tsx  ← apenas JSX, consome hook
```

---

## Resumo: O Que Procurar em Cada Review + Refactor

1. **SOLID**: Violações? Múltiplas responsabilidades?
2. **Colocation**: Tipo no componente? Constante no componente? → Mover para gaveta correta
3. **Barrel files**: Arquivo que só reexporta? → Proibido
4. **Performance**: N+1 queries? Loops manuais? Renders desnecessários?
5. **Nomenclatura**: Genérica (`helper`, `data`, `util`)? → Renomear
6. **Tipagem**: `any`? Tipo duplicado do Zod? → Corrigir
7. **Código morto**: `console.log`? Comentários? Imports inúteis? → Remover
8. **Duplicação**: Lógica repetida? → Extrair para utils
9. **React Query**: `useEffect` + `useState` para async? → Migrar
10. **Tailwind**: Classes longas e desorganizadas? → `cn()`
