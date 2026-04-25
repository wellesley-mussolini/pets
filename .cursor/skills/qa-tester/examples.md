# Exemplos: Matrizes de Cenários e Testes

Padrões genéricos de como montar a matriz de cenários e implementar testes para qualquer funcionalidade. Use como modelo de raciocínio — não são atrelados a features específicas do projeto.

---

## Padrão 1: Formulário com Campos Obrigatórios

### Matriz de cenários

```
Funcionalidade: Formulário com campos obrigatórios e submit assíncrono
Entradas: campos do formulário (texto, seleção, etc.)
Saídas: chamada ao service, mensagem de sucesso/erro, redirect
Dependências externas: service/API, router (navegação), toast

CENÁRIOS:
  Sucesso:
    - todos os campos válidos → service chamado → mensagem de sucesso → redirect
    - campos opcionais em branco, obrigatórios preenchidos → deve funcionar

  Erros e impedimentos:
    - service retorna erro → mensagem de erro exibida → sem redirect
    - service lança exceção → mensagem de erro exibida

  Campos ausentes / combinações parciais:
    - nenhum campo preenchido → erro(s) de validação visíveis → sem chamada ao service
    - só campo A preenchido → erro no campo B → sem chamada ao service
    - só campo B preenchido → erro no campo A → sem chamada ao service

  Dados inválidos:
    - campo com formato errado (ex: email inválido) → erro de validação
    - campo com valor fora do limite (ex: texto muito longo) → erro de validação

  Edge cases:
    - campos com apenas espaços em branco → tratados como vazios
    - clique duplo no botão submit → service chamado apenas uma vez
    - componente desmontado antes do service responder → sem erro de memória leak

  Regressão:
    - (registrar aqui bugs conhecidos que não devem voltar)
```

### Implementação

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock das dependências externas
vi.mock("@/lib/supabase/browser", () => ({ /* mock do service */ }));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { MeuFormulario } from "../components/meu-formulario.component";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

describe("MeuFormulario", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  });

  describe("Sucesso", () => {
    it("deve submeter o formulário e redirecionar quando todos os campos são válidos", async () => {
      vi.mocked(supabaseBrowser.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      } as any);

      const user = userEvent.setup();
      render(<MeuFormulario />);

      await user.type(screen.getByLabelText("Campo A"), "valor válido");
      await user.type(screen.getByLabelText("Campo B"), "outro valor");
      await user.click(screen.getByRole("button", { name: /salvar/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledOnce();
        expect(mockPush).toHaveBeenCalledWith("/lista");
      });
    });

    it("deve submeter com campos opcionais em branco quando obrigatórios estão preenchidos", async () => {
      // arrange + act + assert
    });
  });

  describe("Erros externos", () => {
    it("deve exibir mensagem de erro quando o service retornar falha", async () => {
      vi.mocked(supabaseBrowser.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: null, error: { message: "Erro interno" } }),
      } as any);

      const user = userEvent.setup();
      render(<MeuFormulario />);

      await user.type(screen.getByLabelText("Campo A"), "valor");
      await user.click(screen.getByRole("button", { name: /salvar/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledOnce();
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe("Campos ausentes / validação", () => {
    it("deve exibir erros de validação quando nenhum campo for preenchido", async () => {
      const user = userEvent.setup();
      render(<MeuFormulario />);

      await user.click(screen.getByRole("button", { name: /salvar/i }));

      expect(screen.getByText(/campo a é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/campo b é obrigatório/i)).toBeInTheDocument();
      expect(supabaseBrowser.from).not.toHaveBeenCalled();
    });

    it("deve exibir erro somente no campo vazio quando apenas um campo for preenchido", async () => {
      const user = userEvent.setup();
      render(<MeuFormulario />);

      await user.type(screen.getByLabelText("Campo A"), "valor");
      await user.click(screen.getByRole("button", { name: /salvar/i }));

      expect(screen.queryByText(/campo a é obrigatório/i)).not.toBeInTheDocument();
      expect(screen.getByText(/campo b é obrigatório/i)).toBeInTheDocument();
      expect(supabaseBrowser.from).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("deve tratar campos com apenas espaços em branco como vazios", async () => {
      const user = userEvent.setup();
      render(<MeuFormulario />);

      await user.type(screen.getByLabelText("Campo A"), "   ");
      await user.click(screen.getByRole("button", { name: /salvar/i }));

      expect(screen.getByText(/campo a é obrigatório/i)).toBeInTheDocument();
    });

    it("deve chamar o service apenas uma vez ao clicar duplo rapidamente", async () => {
      vi.mocked(supabaseBrowser.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      } as any);

      const user = userEvent.setup();
      render(<MeuFormulario />);

      await user.type(screen.getByLabelText("Campo A"), "valor");
      await user.type(screen.getByLabelText("Campo B"), "valor");

      const botao = screen.getByRole("button", { name: /salvar/i });
      await user.dblClick(botao);

      await waitFor(() => {
        expect(supabaseBrowser.from).toHaveBeenCalledOnce();
      });
    });
  });
});
```

---

## Padrão 2: Listagem com React Query

### Matriz de cenários

```
Funcionalidade: Componente de listagem com busca de dados
Entradas: nenhuma (ou filtros opcionais)
Saídas: lista renderizada, estados de loading/erro/vazio
Dependências externas: API/Supabase via React Query

CENÁRIOS:
  Sucesso:
    - dados carregados → lista renderizada corretamente
    - dado único → lista com um item
    - muitos dados → todos renderizados

  Erros:
    - API retorna erro → mensagem de erro exibida
    - network error → mensagem de erro exibida

  Estados especiais:
    - loading → skeleton/spinner visível
    - lista vazia → estado vazio exibido (sem items)
    - dados parciais → itens existentes renderizados

  Edge cases:
    - refetch manual → dados atualizados
    - componente desmontado durante loading → sem erro
```

### Implementação

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MinhaListagem } from "../components/minha-listagem.component";

vi.mock("@/lib/supabase/browser", () => ({
  supabaseBrowser: { from: vi.fn() },
}));

import { supabaseBrowser } from "@/lib/supabase/browser";

const renderWithQuery = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe("MinhaListagem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Sucesso", () => {
    it("deve renderizar os itens quando os dados são carregados com sucesso", async () => {
      vi.mocked(supabaseBrowser.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            { id: 1, nome: "Item A" },
            { id: 2, nome: "Item B" },
          ],
          error: null,
        }),
      } as any);

      renderWithQuery(<MinhaListagem />);

      await waitFor(() => {
        expect(screen.getByText("Item A")).toBeInTheDocument();
        expect(screen.getByText("Item B")).toBeInTheDocument();
      });
    });
  });

  describe("Estados especiais", () => {
    it("deve exibir indicador de carregamento enquanto os dados são buscados", () => {
      vi.mocked(supabaseBrowser.from).mockReturnValue({
        select: vi.fn().mockReturnValue(new Promise(() => {})), // nunca resolve
      } as any);

      renderWithQuery(<MinhaListagem />);

      expect(screen.getByRole("status")).toBeInTheDocument(); // skeleton/spinner
    });

    it("deve exibir estado vazio quando não há itens na lista", async () => {
      vi.mocked(supabaseBrowser.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      renderWithQuery(<MinhaListagem />);

      await waitFor(() => {
        expect(screen.getByText(/nenhum item encontrado/i)).toBeInTheDocument();
      });
    });
  });

  describe("Erros", () => {
    it("deve exibir mensagem de erro quando a API falha", async () => {
      vi.mocked(supabaseBrowser.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Erro ao buscar dados" },
        }),
      } as any);

      renderWithQuery(<MinhaListagem />);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });
  });
});
```

---

## Padrão 3: Função Utilitária Pura

### Matriz de cenários

```
Funcionalidade: Função utilitária pura (sem efeitos colaterais)
Entradas: valor(es) de entrada (string, number, array, objeto...)
Saídas: valor transformado/calculado/validado
Dependências externas: nenhuma (pura)

CENÁRIOS:
  Sucesso:
    - entrada válida padrão → retorno esperado
    - variação de formato válida → retorno esperado
    - limite mínimo → retorno correto
    - limite máximo → retorno correto

  Entradas inválidas:
    - null → não quebra, retorna valor esperado
    - undefined → não quebra
    - string vazia → comportamento definido
    - tipo incorreto → comportamento definido

  Edge cases:
    - caracteres especiais e acentos
    - números zero e negativos
    - arrays e objetos vazios
    - strings com apenas espaços

  Pureza:
    - entrada não é modificada
    - sem chamadas externas
    - retorno determinístico
```

### Implementação

```typescript
import { describe, it, expect } from "vitest";
import { minhaUtil } from "../utils/minha.utils";

describe("minhaUtil", () => {
  describe("Sucesso — entradas válidas", () => {
    it("deve retornar [valor esperado] para entrada padrão", () => {
      expect(minhaUtil("entrada válida")).toBe("saída esperada");
    });

    it("deve lidar com variações de formato válido", () => {
      expect(minhaUtil("VARIAÇÃO")).toBe("saída esperada");
      expect(minhaUtil("variação")).toBe("saída esperada");
    });

    it("deve respeitar o limite mínimo de entrada", () => {
      expect(minhaUtil("a")).toBe("saída para mínimo");
    });
  });

  describe("Entradas inválidas", () => {
    it("deve retornar valor padrão quando entrada for null", () => {
      expect(minhaUtil(null as any)).toBe("valor padrão");
    });

    it("deve retornar valor padrão quando entrada for undefined", () => {
      expect(minhaUtil(undefined as any)).toBe("valor padrão");
    });

    it("deve retornar valor padrão quando entrada for string vazia", () => {
      expect(minhaUtil("")).toBe("valor padrão");
    });
  });

  describe("Edge cases", () => {
    it("deve tratar caracteres especiais corretamente", () => {
      expect(minhaUtil("café-com-leite")).toBe("saída esperada");
    });

    it("deve tratar string com apenas espaços como vazia", () => {
      expect(minhaUtil("   ")).toBe("valor padrão");
    });
  });

  describe("Pureza", () => {
    it("não deve modificar o valor de entrada", () => {
      const entrada = { campo: "valor" };
      const entradaOriginal = { ...entrada };
      minhaUtil(entrada as any);
      expect(entrada).toEqual(entradaOriginal);
    });

    it("deve retornar o mesmo resultado para a mesma entrada", () => {
      expect(minhaUtil("entrada")).toBe(minhaUtil("entrada"));
    });
  });
});
```

---

## Padrão 4: Hook Customizado

### Matriz de cenários

```
Funcionalidade: Hook customizado com estado e operações assíncronas
Entradas: parâmetros do hook (opcional)
Saídas: estado, funções, loading, error
Dependências externas: service, API, contexto

CENÁRIOS:
  Estado inicial:
    - valores iniciais corretos antes de qualquer ação

  Sucesso:
    - operação assíncrona conclui → estado atualizado
    - loading fica true durante, false após

  Erro:
    - operação falha → error setado
    - loading fica false mesmo em erro

  Edge cases:
    - hook desmontado durante operação async
    - múltiplas chamadas rápidas
    - parâmetros nulos/undefined
```

### Implementação

```typescript
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/browser", () => ({ /* mock */ }));
import { useMeuHook } from "../hooks/use-meu-hook";

describe("useMeuHook", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("Estado inicial", () => {
    it("deve iniciar com valores padrão antes de qualquer ação", () => {
      const { result } = renderHook(() => useMeuHook());

      expect(result.current.dados).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.erro).toBeNull();
    });
  });

  describe("Sucesso", () => {
    it("deve atualizar o estado com os dados após operação bem-sucedida", async () => {
      // mock de sucesso

      const { result } = renderHook(() => useMeuHook());

      act(() => {
        result.current.executar("parâmetro");
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.dados).toEqual({ /* dado esperado */ });
        expect(result.current.erro).toBeNull();
      });
    });
  });

  describe("Erro", () => {
    it("deve setar o erro e parar o loading quando a operação falhar", async () => {
      // mock de erro

      const { result } = renderHook(() => useMeuHook());

      act(() => {
        result.current.executar("parâmetro");
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.erro).toBeTruthy();
        expect(result.current.dados).toBeNull();
      });
    });
  });
});
```

---

## Checklist Rápida Antes de Submeter os Testes

- [ ] Matriz de cenários foi montada antes de escrever os testes?
- [ ] Há pelo menos um teste de sucesso (happy path)?
- [ ] Todos os campos obrigatórios têm teste de ausência?
- [ ] Combinações parciais foram testadas quando aplicável?
- [ ] Erros da API/service foram testados?
- [ ] Edge cases relevantes estão cobertos?
- [ ] Mocks representam cenários reais (não são irreais para passar)?
- [ ] Nomes dos `it()` estão em português e descritivos?
- [ ] Os testes são independentes (cada um funciona sozinho)?
- [ ] O output de cobertura foi apresentado ao final?
