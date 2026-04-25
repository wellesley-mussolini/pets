# Referência Rápida: QA Tester

Checklists de cenários por tipo de módulo e convenções do projeto.

---

## Checklist por Tipo de Módulo

### Componente / Formulário (UI)

**Renderização**:
- [ ] Renderiza corretamente com dados válidos
- [ ] Renderiza corretamente no estado inicial (sem dados)
- [ ] Todos os campos/elementos importantes aparecem na tela

**Interação do usuário**:
- [ ] Campos aceitam entrada corretamente
- [ ] Submit com todos os campos válidos dispara a ação esperada
- [ ] Botão/ação é chamada com os parâmetros corretos
- [ ] Usuário consegue completar o fluxo do início ao fim

**Validações**:
- [ ] Erro aparece quando campo obrigatório está vazio
- [ ] Erro aparece quando dado tem formato inválido
- [ ] Submit não ocorre quando o formulário tem erro
- [ ] Mensagem de validação é clara e visível

**Estados**:
- [ ] Loading aparece durante operação assíncrona
- [ ] Loading desaparece após conclusão
- [ ] Estado de sucesso é exibido (mensagem, redirect, etc.)
- [ ] Estado de erro é exibido quando API/service falha
- [ ] Estado vazio é tratado (sem dados para exibir)
- [ ] Botão fica desabilitado durante loading

**Combinações parciais**:
- [ ] Envio sem nenhum campo
- [ ] Envio somente com campo A
- [ ] Envio somente com campo B
- [ ] Envio com campos obrigatórios, sem opcionais
- [ ] Envio com opcionais, sem obrigatórios

**Edge cases**:
- [ ] Clique duplo no botão de submit
- [ ] Submit repetido em sequência rápida
- [ ] Campos com apenas espaços em branco
- [ ] Campos com caracteres especiais
- [ ] Componente desmontado durante operação async

---

### Hook

**Estado inicial**:
- [ ] Valores iniciais estão corretos
- [ ] Funções expostas existem e são chamáveis

**Fluxo de sucesso**:
- [ ] Estado muda corretamente após operação
- [ ] Loading é `true` durante operação async
- [ ] Loading volta para `false` após conclusão
- [ ] Dado é retornado corretamente

**Fluxo de erro**:
- [ ] Estado de erro é setado quando operação falha
- [ ] Loading volta para `false` mesmo em caso de erro
- [ ] Error é acessível no retorno do hook

**Limpeza**:
- [ ] Efeitos são limpos quando o hook é desmontado
- [ ] Chamadas assíncronas pendentes são canceladas

**Edge cases**:
- [ ] Chamada com parâmetros nulos/indefinidos
- [ ] Chamada múltipla em sequência rápida
- [ ] Dependências do hook mudam durante execução

---

### Util / Função Pura

**Entradas válidas**:
- [ ] Entrada padrão retorna resultado correto
- [ ] Variações de formato retornam resultado correto
- [ ] Limites mínimos e máximos funcionam

**Entradas inválidas**:
- [ ] `null` não quebra
- [ ] `undefined` não quebra
- [ ] String vazia é tratada
- [ ] Tipo incorreto é tratado (se TypeScript não pegar)
- [ ] Valor fora do limite esperado

**Edge cases**:
- [ ] Caracteres especiais e acentos
- [ ] Strings só com espaços
- [ ] Número zero
- [ ] Número negativo
- [ ] Array vazio
- [ ] Objeto vazio

**Pureza**:
- [ ] Não modifica a entrada (sem mutação)
- [ ] Sem efeitos colaterais (sem chamadas externas)
- [ ] Retorno consistente para a mesma entrada

---

### Service / Integração com API

**Chamada correta**:
- [ ] Endpoint correto é chamado
- [ ] Método HTTP correto (GET, POST, PUT, DELETE, PATCH)
- [ ] Headers necessários estão presentes
- [ ] Query params estão corretos
- [ ] Body/payload está correto e completo

**Tratamento de sucesso**:
- [ ] Resposta é normalizada corretamente
- [ ] Retorno do service está no formato esperado

**Tratamento de erro**:
- [ ] Erro 400 (bad request) é tratado
- [ ] Erro 401 (não autenticado) é tratado
- [ ] Erro 403 (não autorizado) é tratado
- [ ] Erro 404 (não encontrado) é tratado
- [ ] Erro 500 (server error) é tratado
- [ ] Network error / timeout é tratado
- [ ] Exceção é lançada quando esperado

---

### Middleware / Guard / Validação

**Fluxo permitido**:
- [ ] Usuário com permissão passa sem bloqueio
- [ ] Requisição válida passa sem bloqueio

**Fluxo bloqueado**:
- [ ] Usuário sem permissão é bloqueado
- [ ] Requisição inválida é bloqueada
- [ ] Redirecionamento correto ocorre

**Edge cases**:
- [ ] Sessão expirada
- [ ] Token inválido
- [ ] Token ausente

---

## Convenções do Projeto (Vitest + Testing Library)

### Estrutura de arquivo de teste

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NomeDoComponente } from "../components/nome.component";

describe("NomeDoComponente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("quando [contexto/estado]", () => {
    it("deve [comportamento] quando [condição]", async () => {
      // arrange: preparar mocks e dados
      // act: executar a ação
      // assert: verificar o resultado
    });
  });
});
```

### Helpers de query mais usados

```typescript
// Texto visível
screen.getByText("Texto")
screen.getByText(/texto parcial/i)

// Label de formulário
screen.getByLabelText("Nome")

// Role semântico
screen.getByRole("button", { name: "Salvar" })
screen.getByRole("textbox", { name: "Email" })
screen.getByRole("alert")

// Placeholder
screen.getByPlaceholderText("Digite seu nome")

// Test ID (último recurso)
screen.getByTestId("meu-elemento")

// Query que não lança erro se não existir
screen.queryByText("Texto")
```

### Simulação de eventos

```typescript
const user = userEvent.setup();

// Digitar em campo
await user.type(screen.getByLabelText("Nome"), "João");

// Clicar em botão
await user.click(screen.getByRole("button", { name: "Salvar" }));

// Limpar e digitar
await user.clear(screen.getByLabelText("Email"));
await user.type(screen.getByLabelText("Email"), "novo@email.com");

// Submit de formulário
await user.click(screen.getByRole("button", { name: /salvar/i }));
```

### Assertions mais usadas

```typescript
// Elemento existe
expect(screen.getByText("Mensagem")).toBeInTheDocument();

// Elemento não existe
expect(screen.queryByText("Erro")).not.toBeInTheDocument();

// Elemento está visível
expect(screen.getByRole("button")).toBeVisible();

// Elemento está desabilitado
expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();

// Mock foi chamado
expect(mockFn).toHaveBeenCalledOnce();
expect(mockFn).toHaveBeenCalledWith({ campo: "valor" });

// Mock não foi chamado
expect(mockFn).not.toHaveBeenCalled();

// Esperar mudança async
await waitFor(() => {
  expect(screen.getByText("Sucesso!")).toBeInTheDocument();
});
```

### Mocks comuns do projeto

```typescript
// Supabase browser client
vi.mock("@/lib/supabase/browser", () => ({
  supabaseBrowser: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: [{ id: 1, nome: "Teste" }],
        error: null,
      }),
      insert: vi.fn().mockReturnValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({ data: null, error: null }),
    }),
  },
}));

// Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
}));

// Sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
```

---

## Nomenclatura dos Testes

**Formato**: `deve [comportamento] quando [condição]`

```typescript
// Sucesso
it("deve submeter o formulário com dados válidos", ...)
it("deve redirecionar para a lista após salvar com sucesso", ...)
it("deve exibir mensagem de sucesso após operação concluída", ...)

// Validação / Impedimento
it("deve exibir erro quando campo obrigatório estiver vazio", ...)
it("deve impedir o envio quando o formulário tiver erros de validação", ...)
it("deve desabilitar o botão de submit durante o carregamento", ...)

// Erro externo
it("deve exibir mensagem de erro quando a API retornar falha", ...)
it("deve exibir mensagem de erro quando o service lançar exceção", ...)

// Edge case
it("deve tratar entrada nula sem lançar exceção", ...)
it("deve retornar valor padrão quando entrada estiver vazia", ...)
it("deve impedir submit duplo ao clicar rapidamente", ...)
```

---

## Prioridade de Cenários

Quando não der para cobrir tudo de uma vez, priorize nesta ordem:

1. Happy path (sucesso principal)
2. Campos obrigatórios vazios (validação básica)
3. Erro da API/service
4. Combinações parciais de campos
5. Dados inválidos
6. Edge cases
7. Regressão de bugs conhecidos
