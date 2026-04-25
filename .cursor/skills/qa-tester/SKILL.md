---
name: qa-tester
description: Garante cobertura 100% dos cenários de qualquer funcionalidade do projeto. Constrói matriz de cenários obrigatória antes de escrever qualquer teste. Cobre sucesso, erros, campos ausentes, combinações parciais, dados inválidos, edge cases e regressão. Usa Vitest e Testing Library. Testa comportamento, não implementação. Aplicado quando o agent qa-tester é acionado.
---

# Skill: QA Tester e Testes Unitários

Guia escalável para cobrir **100% dos cenários relevantes** de qualquer funcionalidade do projeto **pets** (Vitest, Testing Library, React 19, Supabase, React Query).

**Cobertura 100% significa**: nenhum cenário relevante deixado de fora — não é porcentagem de linhas, é mapa completo de comportamento.

---

## Regra Ouro: Matriz Antes dos Testes

**NUNCA escreva um teste sem antes montar a matriz de cenários.**

A matriz é o mapa de tudo que pode acontecer com a funcionalidade. Se o cenário existe na realidade, ele deve existir na matriz — e ter um teste correspondente.

### Template da Matriz

```
Funcionalidade: [nome]
Entradas: [campos, props, parâmetros]
Saídas: [retorno, render, efeito, estado]
Dependências externas: [API, service, hook, contexto, rota]

CENÁRIOS:
  Sucesso:          [happy path + variações de sucesso]
  Erros:            [validações, permissões, falhas externas]
  Campos ausentes:  [nenhum, só A, só B, A sem C...]
  Dados inválidos:  [formato errado, fora do limite, tipo errado]
  Edge cases:       [vazio, null, undefined, clique duplo, desmontado...]
  Regressão:        [bugs conhecidos que não podem voltar]
```

---

## Workflow Obrigatório

### Passo 1: Ler e entender

- Ler o arquivo/módulo solicitado completo
- Identificar: o que recebe, o que retorna, o que renderiza, o que chama
- Mapear dependências externas (o que precisa ser mockado)
- Verificar se já existem testes

### Passo 2: Montar a matriz

- Listar todos os cenários da funcionalidade
- Agrupar por categoria (sucesso, erro, ausentes, inválidos, edge, regressão)
- Identificar quais já estão cobertos e quais estão faltando

### Passo 3: Implementar os testes

- Seguir o padrão de testes existente no projeto (Vitest + Testing Library)
- Escrever um `it()` por cenário, com nome descritivo em português
- Criar mocks realistas para dependências externas
- Testar comportamento — o que o usuário/sistema vê e recebe
- Não testar detalhes internos de implementação

### Passo 4: Rodar e validar

- Executar `npm test` ou `vitest run` para confirmar que os testes passam
- Corrigir falhas que forem problemas no próprio teste
- Sinalizar bugs reais encontrados na implementação (sem corrigir automaticamente)

### Passo 5: Apresentar cobertura

- Sempre apresentar o output de cobertura ao final
- Listar cenários cobertos e não cobertos com justificativa

---

## Padrão de Testes do Projeto

**Stack**: Vitest + Testing Library + jsdom

**Estrutura de arquivos**:
- Testes colocados em `src/app/<feature>/tests/`
- Nome do arquivo: `<modulo>.test.ts` ou `<modulo>.test.tsx`

**Configuração** (`vitest.config.ts`):
- Ambiente: jsdom
- Setup: `src/tests/setup.ts`
- Alias `@/` disponível

**Padrão de mocks**:
```typescript
// Mock de módulo externo
vi.mock("@/lib/supabase/browser", () => ({
  supabaseBrowser: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    // ...
  },
}));

// Mock de navegação
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
}));

// Mock de toast
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
```

**Estrutura de teste**:
```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("NomeDaFuncionalidade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Sucesso", () => {
    it("deve [comportamento esperado] quando [condição]", async () => {
      // arrange
      // act
      // assert
    });
  });

  describe("Erros", () => {
    it("deve exibir erro quando [condição de falha]", async () => {});
  });

  describe("Edge cases", () => {
    it("deve [comportamento] quando [edge case]", async () => {});
  });
});
```

---

## Princípios de Qualidade

- **Independência**: cada teste funciona sozinho, sem depender de outro
- **Determinismo**: sempre passa ou sempre falha, nunca flaky
- **Legibilidade**: outro dev entende o cenário só pelo nome do `it()`
- **Foco em comportamento**: testa o que o usuário/sistema vê, não como foi implementado
- **Mocks realistas**: representam cenários reais de sucesso e falha
- **Sem dados mágicos**: use constantes nomeadas para valores de teste

---

## Output de Cobertura (obrigatório ao final)

```
COBERTURA: [nome da funcionalidade]
Cenários cobertos: X de Y

✅ Sucesso            → [nomes dos it()]
✅ Erros              → [nomes dos it()]
✅ Campos ausentes    → [nomes dos it()]
✅ Dados inválidos    → [nomes dos it()]
✅ Edge cases         → [nomes dos it()]
✅ Regressão          → [nomes dos it()]
❌ Não cobertos       → [cenário] (motivo: não aplicável / fora de escopo)

Arquivos: [lista de arquivos criados/alterados]
```

---

## Referências

- Convenções e exemplos por tipo: `reference.md`
- Exemplos de matrizes e testes genéricos: `examples.md`
- Config Vitest: `vitest.config.ts`
- Setup de testes: `src/tests/setup.ts`
