# Exemplos: Refactor e Simplificação

Exemplos genéricos de refactor completo — antes/depois com análise. Use como modelo de raciocínio para qualquer código que precisar simplificar.

---

## Exemplo 1: Util com Múltiplas Responsabilidades e Loop Manual

### ❌ Antes

```typescript
// utils/documento.ts
export const documentoUtils = {
  limparEVerDocumento: (x: any): any => {
    let a = "";
    let b = x.split("");

    for (let i = 0; i < b.length; i++) {
      if (
        b[i] === "0" || b[i] === "1" || b[i] === "2" || b[i] === "3" ||
        b[i] === "4" || b[i] === "5" || b[i] === "6" || b[i] === "7" ||
        b[i] === "8" || b[i] === "9"
      ) {
        a += b[i];
      }
    }

    if (a.length === 11) {
      console.log("isso é um cpf");
      return { valorOriginal: x, valorLimpo: a, tipo: "CPF", data: new Date(), valido: true };
    }

    if (a.length === 14) {
      console.log("isso é um cnpj");
      return { valorOriginal: x, valorLimpo: a, tipo: "CNPJ", data: new Date(), valido: true };
    }

    console.log("deu ruim");
    return false;
  },
};
```

**Problemas identificados**:
- 🔴 Parâmetro e retorno `any` (sem tipagem)
- 🔴 Uma função com 3 responsabilidades: limpar, identificar e retornar objeto composto
- 🔴 Loop manual substituível por `.replace(/\D/g, "")`
- 🔴 `console.log` em código de produção
- 🔴 Nome genérico `limparEVerDocumento` — "ver" não comunica nada
- 🔴 Retorno inconsistente: objeto no sucesso, `false` no erro (sem tipo)
- 🟡 `data: new Date()` no retorno não tem propósito claro para a função

### ✅ Depois

```typescript
// utils/regex.utils.ts
export const regexUtils = {
  manterApenasNumeros: (valor: string): string => {
    return valor.replace(/\D/g, "");
  },

  manterApenasLetras: (valor: string): string => {
    return valor.replace(/[^a-zA-Z]/g, "");
  },
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

**O que foi aplicado**:
- Tipagem explícita em parâmetros e retornos
- Responsabilidades separadas: limpeza em `regexUtils`, identificação em `documentoUtils`
- Loop manual substituído por `.replace(/\D/g, "")`
- `console.log` removido
- Retorno sempre tipado (`TipoDocumento`) — sem `false` solto
- Nomes explícitos: `manterApenasNumeros`, `identificarTipo`
- Comportamento equivalente preservado

---

## Exemplo 2: Componente com Múltiplas Responsabilidades

### ❌ Antes

```typescript
// components/lista.tsx
"use client";

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

  const handle = (item: any) => {
    setSelected(item);
    setOpen(true);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      {itens.filter(i => i.ativo).map((i: any) => (
        <div key={i.id} onClick={() => handle(i)}>
          <p>{i.nome}</p>
          <p>{i.descricao}</p>
        </div>
      ))}
      {open && <div>{selected?.nome}</div>}
    </div>
  );
}
```

**Problemas identificados**:
- 🔴 `any` em todos os lugares
- 🔴 `useEffect` + `useState` para dados async (React Query existe no projeto)
- 🔴 Componente com 4 responsabilidades: busca, filtragem, renderização e modal
- 🔴 `console.log` de erro sem tratar para o usuário
- 🔴 Nome genérico `handle`, `open`, `loading`, `selected`
- 🔴 Sem tratamento de estado de erro

### ✅ Depois

```typescript
// (main)/itens/types/item.types.ts
export interface Item {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
}

// (main)/itens/utils/filtrar-itens-ativos.utils.ts
export function filtrarItensAtivos(itens: Item[]): Item[] {
  return itens.filter(i => i.ativo);
}

// (main)/itens/components/item-card.component.tsx
interface ItemCardProps {
  item: Item;
  onSelecionar: (item: Item) => void;
}

export function ItemCard({ item, onSelecionar }: ItemCardProps) {
  return (
    <div onClick={() => onSelecionar(item)}>
      <p>{item.nome}</p>
      <p>{item.descricao}</p>
    </div>
  );
}

// (main)/itens/components/item-detalhe-modal.component.tsx
interface ItemDetalheModalProps {
  item: Item | null;
  isOpen: boolean;
}

export function ItemDetalheModal({ item, isOpen }: ItemDetalheModalProps) {
  if (!isOpen || !item) return null;
  return <div>{item.nome}</div>;
}

// (main)/itens/page.tsx
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { filtrarItensAtivos } from "./utils/filtrar-itens-ativos.utils";
import { ItemCard } from "./components/item-card.component";
import { ItemDetalheModal } from "./components/item-detalhe-modal.component";

export default function ItensPage() {
  const [itemSelecionado, setItemSelecionado] = useState<Item | null>(null);
  const [isModalDetalheAberto, setIsModalDetalheAberto] = useState(false);

  const { data: itens, isLoading, error } = useQuery({
    queryKey: ["itens"],
    queryFn: async () => {
      const { data, error } = await supabaseBrowser.from("itens").select("*");
      if (error) throw new Error(error.message);
      return data as Item[];
    },
  });

  const handleSelecionarItem = (item: Item) => {
    setItemSelecionado(item);
    setIsModalDetalheAberto(true);
  };

  if (isLoading) return <SkeletonListagem />;
  if (error) return <ErroListagem />;
  if (!itens?.length) return <ListaVazia />;

  const itensAtivos = filtrarItensAtivos(itens);

  return (
    <div>
      {itensAtivos.map(item => (
        <ItemCard key={item.id} item={item} onSelecionar={handleSelecionarItem} />
      ))}
      <ItemDetalheModal item={itemSelecionado} isOpen={isModalDetalheAberto} />
    </div>
  );
}
```

**O que foi aplicado**:
- Interface `Item` com tipagem explícita
- React Query substituiu `useEffect` + `useState` para dados
- Componente decomposto: `ItemCard`, `ItemDetalheModal`, página orquestra
- Filtro extraído para `filtrarItensAtivos` (função pura testável)
- Nomes explícitos: `itemSelecionado`, `isModalDetalheAberto`, `handleSelecionarItem`
- Estados de loading/erro/vazio tratados
- `console.log` removido — erro lançado e tratado via React Query
- Colocation: tipos, utils e components junto com a feature

---

## Exemplo 3: Hook com Estado Manual → Simplificado

### ❌ Antes

```typescript
// hooks/useData.ts
export function useData(id: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetch_ = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data/${id}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, [id]);

  return { data, loading, error, refresh: fetch_ };
}
```

**Problemas identificados**:
- 🔴 `any` em `data` e `error`
- 🔴 `useState` + `useEffect` para busca de dados (padrão não adotado no projeto)
- 🔴 Nome genérico `data`, `loading`, `useData`, `fetch_`
- 🔴 Sem cache, sem retry, sem invalidação
- 🟡 Função interna `fetch_` tem nome de built-in — confuso

### ✅ Depois

```typescript
// (main)/itens/hooks/use-item-por-id.ts
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { Item } from "../types/item.types";

export function useItemPorId(id: string) {
  return useQuery<Item>({
    queryKey: ["item", id],
    queryFn: async () => {
      const { data, error } = await supabaseBrowser
        .from("itens")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: Boolean(id),
  });
}
```

**O que foi aplicado**:
- React Query eliminou o gerenciamento manual de estado (cache, retry, loading, error)
- Tipagem explícita `Item`
- Nome descritivo `useItemPorId` — claro e específico
- `enabled: Boolean(id)` — não executa sem id válido
- Comportamento equivalente preservado (busca item por id)

---

## Exemplo 4: Classe Tailwind Desorganizada

### ❌ Antes

```typescript
<div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 md:flex-row md:gap-6 md:p-6 cursor-pointer hover:border-primary">
```

### ✅ Depois

```typescript
<div
  className={cn(
    // Layout base
    "flex flex-col gap-4 p-4",
    // Responsive
    "md:flex-row md:gap-6 md:p-6",
    // Aparência
    "rounded-lg border border-gray-200",
    "bg-white dark:bg-gray-900",
    // Interação
    "cursor-pointer transition-all duration-200",
    "shadow-md hover:shadow-lg hover:border-primary"
  )}
>
```

**O que foi aplicado**:
- Classes organizadas por propósito (layout, responsive, aparência, interação)
- `cn()` permite condicionais e legibilidade

---

## Checklist de Refactor Antes de Finalizar

- [ ] Todos os `any` foram substituídos por tipos explícitos?
- [ ] Tipos duplicados de Zod foram removidos (usando `z.infer`)?
- [ ] Todos os `console.log` foram removidos?
- [ ] Todo código comentado foi removido?
- [ ] Todos os imports não usados foram removidos?
- [ ] Loops manuais foram substituídos por operações nativas quando mais claro?
- [ ] Funções com múltiplas responsabilidades foram separadas?
- [ ] Lógica duplicada foi extraída para utils compartilhado?
- [ ] Nomes genéricos foram renomeados para nomes explícitos?
- [ ] Classes Tailwind foram organizadas com `cn()`?
- [ ] O comportamento original foi preservado?
- [ ] Os testes existentes continuam passando?
- [ ] O output de análise e resultado foi apresentado?
