---
name: code-refactor
description: Simplifica e melhora qualquer código existente do projeto sem criar features, sem criar regras de negócio e sem alterar comportamento. Remove redundâncias, código morto e complexidade desnecessária. Aplica SOLID, DRY, nomenclatura clara e performance. Código confuso ou mal escrito é reescrito. Aplicado quando o agent code-refactor é acionado.
---

# Skill: Code Refactor e Simplificação

Guia escalável para simplificar e melhorar **qualquer código** do projeto — utils, componentes, hooks, tipos, services, configurações.

**Regra fundamental**: o código resultante deve ser mais simples, mais claro e mais fácil de manter que o original, sem alterar o comportamento.

---

## Contrato do Refactor

```
✅ PODE:                          ❌ NUNCA:
  Simplificar código verboso         Criar feature nova
  Remover código morto               Criar regra de negócio
  Extrair funções puras              Alterar comportamento
  Eliminar duplicação                Alterar contrato de API
  Aplicar tipagem explícita          Alterar auth/permissões
  Renomear para clareza              Introduzir novos bugs
  Reorganizar responsabilidades      Entregar código confuso
  Otimizar performance               Aceitar código mal escrito
```

---

## Workflow Obrigatório

### 1. Analisar e classificar

Antes de qualquer mudança, analisar o código e classificar os problemas:

```
ANÁLISE:
  🔴 Crítico (refatorar agora):
    - [problema + localização]

  🟡 Sugestão (melhoria relevante):
    - [problema + localização]

  Comportamento preservado:
    - [o que não muda]
```

### 2. Aplicar o refactor

- **Seguro (aplicar sem perguntar)**: renomear, remover morto, extrair função pura, organizar imports, tipar, remover `console.log`
- **Requer confirmação**: mudança que pode afetar comportamento, reorganização de arquivos com impacto externo, alteração de assinatura exportada

### 3. Confirmar equivalência

- Rodar testes existentes; se passarem, refactor é seguro
- Se não houver testes para a parte refatorada, sinalizar que devem ser criados

### 4. Apresentar resultado

```
REFACTOR:
  Alterado:
    - [o que mudou]
  Preservado:
    - [o que não mudou]
  Testes: [status]
  Pendente de confirmação: [se houver]
```

---

## Padrões de Simplificação

### Tipagem

```typescript
// ❌ Antes: any + tipo duplicado
function processar(dados: any): any { ... }
type MinhaForm = { nome: string; email: string }; // duplicado do zod

// ✅ Depois: tipo explícito + inferência de Zod
function processar(dados: DadosEntrada): DadosSaida { ... }
type MinhaForm = z.infer<typeof minhaFormZod>; // inferido
```

### Loops manuais → operações nativas

```typescript
// ❌ Antes: loop manual verboso
let resultado = "";
for (let i = 0; i < valor.length; i++) {
  if (valor[i] >= "0" && valor[i] <= "9") {
    resultado += valor[i];
  }
}

// ✅ Depois: operação nativa clara
const resultado = valor.replace(/\D/g, "");
```

### Funções com múltiplas responsabilidades → funções puras focadas

```typescript
// ❌ Antes: tudo misturado em uma função
function processarEExibirDado(entrada: any) {
  // limpar, validar, formatar, logar e retornar tudo aqui
}

// ✅ Depois: uma função = uma responsabilidade
function limparEntrada(valor: string): string { ... }
function validarEntrada(valor: string): boolean { ... }
function formatarParaExibicao(valor: string): string { ... }
```

### Duplicação → extração

```typescript
// ❌ Antes: lógica repetida em dois lugares
// arquivo A: const numeros = valor.split("").filter(c => /\d/.test(c)).join("");
// arquivo B: const numeros = valor.split("").filter(c => /\d/.test(c)).join("");

// ✅ Depois: extraída para utils compartilhado
// src/utils/string.utils.ts
export function manterApenasNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}
```

### Nomenclatura genérica → explícita

```typescript
// ❌ Antes: genérico
function process(x: any) { ... }
const data = await getData();
const handler = () => { ... };

// ✅ Depois: explícito
function formatarMoedaParaReal(valor: number): string { ... }
const listaDeRacas = await fetchRacasDoSupabase();
const handleBreedFormSubmit = () => { ... };
```

### Componente com múltiplas responsabilidades → decomposição

```typescript
// ❌ Antes: um componente faz tudo
function MeuComponente() {
  // busca dados
  // filtra dados
  // ordena dados
  // renderiza lista
  // controla paginação
  // controla modal
}

// ✅ Depois: cada parte tem propósito único
function useBuscarDados() { ... }           // hook: busca
function filtrarEOrdenar(dados, filtros) {} // util pura: filtro + ordem
function MeuComponente() { ... }           // componente: orquestra
function ListaDeItens({ itens }) { ... }   // componente: renderiza lista
function ControlePaginacao({ ... }) { ... } // componente: paginação
```

---

## Checklist de Refactor (por arquivo)

- [ ] Há `any`? → Substituir por tipo explícito
- [ ] Há tipo duplicado do Zod? → Usar `z.infer<typeof>`
- [ ] Há `console.log`? → Remover
- [ ] Há código comentado? → Remover
- [ ] Há imports não usados? → Remover
- [ ] Há variáveis declaradas e não usadas? → Remover
- [ ] Há loop manual substituível por operação nativa? → Substituir
- [ ] Há lógica duplicada em outro arquivo? → Extrair para utils
- [ ] Há função com 3+ responsabilidades? → Separar
- [ ] Há nome genérico? → Renomear para nome explícito
- [ ] Há `useState` + `useEffect` para dados async? → Sinalizar React Query
- [ ] Classes Tailwind desorganizadas? → Organizar com `cn()`
- [ ] Há operação N+1? → Otimizar para batch/join

---

## Quando Pedir Confirmação

**Pare e pergunte se**:
- A mudança pode alterar comportamento visível
- A assinatura de uma função exportada vai mudar
- A reorganização de arquivos impacta imports externos
- Uma lógica parece morta mas pode ter propósito não óbvio
- Um schema Zod ou tipo exportado vai ser alterado

**Aplique sem perguntar**:
- Renomear variáveis locais para clareza
- Remover imports/variáveis não usados
- Remover `console.log` e código comentado
- Extrair função pura sem alterar assinatura
- Substituir `any` por tipo explícito
- Organizar imports e Tailwind

---

## Referências

- Playbook de micro-padrões (antes/depois por categoria): `reference.md`
- Exemplos genéricos de refactor completo: `examples.md`
- Regra de nomenclatura: `.cursor/rules/nomenclaturas.mdc`
- Padrões do projeto: `.cursor/skills/code-review/SKILL.md`
