# Referência Rápida: Code Refactor

Playbook de micro-padrões — antes/depois para cada categoria de problema. Use como lookup rápido durante o refactor.

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
type MeuTipo = { nome: string; idade: number }; // duplicado!

// ✅ Tipo inferido automaticamente
const meuSchema = z.object({ nome: z.string(), idade: z.number() });
type MeuTipo = z.infer<typeof meuSchema>; // single source of truth
```

### Props de componente com tipo explícito

```typescript
// ❌
function MeuComponente(props: any) { ... }

// ✅
interface MeuComponenteProps {
  titulo: string;
  onConfirmar: () => void;
  itens: Item[];
}
function MeuComponente({ titulo, onConfirmar, itens }: MeuComponenteProps) { ... }
```

---

## Categoria 2: Loops e Operações Nativas

### Loop manual → `.replace()`

```typescript
// ❌ Loop manual para filtrar caracteres
let resultado = "";
for (let i = 0; i < valor.length; i++) {
  if ("0123456789".includes(valor[i])) resultado += valor[i];
}

// ✅
const resultado = valor.replace(/\D/g, "");
```

### Loop `for` → `.map()`

```typescript
// ❌
const nomes: string[] = [];
for (let i = 0; i < usuarios.length; i++) {
  nomes.push(usuarios[i].nome);
}

// ✅
const nomes = usuarios.map(u => u.nome);
```

### Loop `for` → `.filter()`

```typescript
// ❌
const ativos: Usuario[] = [];
for (let i = 0; i < usuarios.length; i++) {
  if (usuarios[i].ativo) ativos.push(usuarios[i]);
}

// ✅
const ativos = usuarios.filter(u => u.ativo);
```

### Loop `for` → `.find()`

```typescript
// ❌
let encontrado: Usuario | undefined;
for (let i = 0; i < usuarios.length; i++) {
  if (usuarios[i].id === id) { encontrado = usuarios[i]; break; }
}

// ✅
const encontrado = usuarios.find(u => u.id === id);
```

### Loop `for` → `.reduce()`

```typescript
// ❌
let total = 0;
for (let i = 0; i < itens.length; i++) {
  total += itens[i].valor;
}

// ✅
const total = itens.reduce((acc, item) => acc + item.valor, 0);
```

### Verificação de existência → `.some()`

```typescript
// ❌
let existeAtivo = false;
for (let i = 0; i < usuarios.length; i++) {
  if (usuarios[i].ativo) { existeAtivo = true; break; }
}

// ✅
const existeAtivo = usuarios.some(u => u.ativo);
```

---

## Categoria 3: Responsabilidades

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
// hook: busca de dados
function useItens() {
  return useQuery({
    queryKey: ["itens"],
    queryFn: async () => {
      const { data } = await supabaseBrowser.from("itens").select("*");
      return data || [];
    },
  });
}

// util: filtro
function filtrarItensAtivos(itens: Item[]): Item[] {
  return itens.filter(i => i.ativo);
}

// componente: somente renderização
function ListagemDeItens() {
  const { data: itens } = useItens();
  const ativos = filtrarItensAtivos(itens || []);
  return <ul>{ativos.map(i => <li key={i.id}>{i.nome}</li>)}</ul>;
}
```

### Separar responsabilidades em uma função util

```typescript
// ❌ Uma função que limpa + valida + classifica + retorna objeto complexo
function processarDocumento(valor: any): any {
  let numeros = "";
  for (let c of valor.split("")) {
    if ("0123456789".includes(c)) numeros += c;
  }
  if (numeros.length === 11) return { tipo: "CPF", numeros, valido: true };
  if (numeros.length === 14) return { tipo: "CNPJ", numeros, valido: true };
  return { tipo: "INVALIDO", numeros, valido: false };
}

// ✅ Cada função tem uma responsabilidade
type TipoDocumento = "CPF" | "CNPJ" | "INVALIDO";

function manterApenasNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

function identificarTipoDocumento(valor: string): TipoDocumento {
  const numeros = manterApenasNumeros(valor);
  if (numeros.length === 11) return "CPF";
  if (numeros.length === 14) return "CNPJ";
  return "INVALIDO";
}
```

---

## Categoria 4: Duplicação

### Extrair lógica duplicada para utils

```typescript
// ❌ Mesma lógica em dois arquivos
// arquivo A: const ativos = lista.filter(i => i.ativo && i.dataCriacao >= limite);
// arquivo B: const ativos = lista.filter(i => i.ativo && i.dataCriacao >= limite);

// ✅ Extraída uma vez
// src/utils/filtrar-itens-ativos-recentes.utils.ts
export function filtrarItensAtivosRecentes(itens: Item[], limite: Date): Item[] {
  return itens.filter(i => i.ativo && i.dataCriacao >= limite);
}
```

### Extrair validação duplicada para constante

```typescript
// ❌ Mesma validação reescrita em múltiplos schemas
// schema A: email: z.string().email("Email inválido")
// schema B: email: z.string().email("Email inválido")

// ✅
// src/constants/validation-rules.constant.ts
export const REGRAS_DE_VALIDACAO = {
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
};

// nos schemas:
const loginSchema = z.object({ ...REGRAS_DE_VALIDACAO });
```

---

## Categoria 5: Nomenclatura

### Nomes genéricos → nomes explícitos

```typescript
// ❌ Genéricos
const data = await getData();
function handle(x: any) { ... }
const util = { fmt: (v: string) => v.trim() };
const handler = () => submitForm();

// ✅ Explícitos
const racasSalvas = await fetchRacasDoSupabase();
function handleBreedFormSubmit(valores: BreedFormValues) { ... }
function removerEspacosDasBordas(valor: string): string { return valor.trim(); }
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

## Categoria 6: Código Morto

### Remover `console.log`

```typescript
// ❌
console.log("isso é um cpf");
console.log("deu ruim");

// ✅ Removidos — logs de debug não pertencem ao código de produção
```

### Remover código comentado

```typescript
// ❌
// const antigaFuncao = () => { ... };
// TODO: isso vai ser removido depois
// const dados = await fetch("/api/antigo");

// ✅ Removidos completamente
```

### Remover imports não usados

```typescript
// ❌
import { useState, useEffect, useCallback, useMemo } from "react";
// useCallback e useMemo não são usados neste arquivo

// ✅
import { useState, useEffect } from "react";
```

---

## Categoria 7: Performance

### N+1 queries → query única

```typescript
// ❌ N+1: busca lista, depois busca cada item
const itens = await buscarItens();
for (const item of itens) {
  item.detalhes = await buscarDetalhes(item.id); // N chamadas extras!
}

// ✅ Uma query única com join
const { data: itensComDetalhes } = await supabaseBrowser
  .from("itens")
  .select("*, detalhes:item_detalhes(*)");
```

### Renders desnecessários → memoização

```typescript
// ❌ Função recriada em todo render
function MeuComponente({ onSalvar }) {
  const handleSalvar = () => onSalvar(dados); // nova referência todo render

  return <BotaoCompleox onClick={handleSalvar} />;
}

// ✅ Memoizado quando o filho é pesado
function MeuComponente({ onSalvar }) {
  const handleSalvar = useCallback(() => onSalvar(dados), [onSalvar, dados]);

  return <BotaoComplexo onClick={handleSalvar} />;
}
```

### Estado async → React Query

```typescript
// ❌ Gerenciamento manual de estado async
const [dados, setDados] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [erro, setErro] = useState(null);

useEffect(() => {
  setIsLoading(true);
  fetch("/api/dados")
    .then(r => r.json())
    .then(setDados)
    .catch(setErro)
    .finally(() => setIsLoading(false));
}, []);

// ✅ React Query gerencia tudo
const { data: dados, isLoading, error: erro } = useQuery({
  queryKey: ["dados"],
  queryFn: () => supabaseBrowser.from("dados").select("*").then(r => r.data),
});
```

---

## Categoria 8: Tailwind e Estilo

### Classes desorganizadas → `cn()` organizado

```typescript
// ❌
className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow md:flex-row md:gap-6"

// ✅
className={cn(
  "flex flex-col gap-4 p-4",
  "rounded-lg border border-gray-200",
  "bg-white dark:bg-gray-900",
  "shadow-md hover:shadow-lg transition-shadow",
  "md:flex-row md:gap-6"
)}
```

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
| Alterar assinatura de função exportada | Perguntar |
| Reorganizar arquivos (impacta imports externos) | Perguntar |
| Alterar schema Zod exportado | Perguntar |
| Alterar lógica condicional complexa | Perguntar |
| Remover código que parece não usado (mas pode ter propósito) | Perguntar |
