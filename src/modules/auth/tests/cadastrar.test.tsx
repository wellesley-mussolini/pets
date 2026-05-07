import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormularioAutenticacao } from "../components/formulario-autenticacao.component";

const mockRpc = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();

vi.mock("@/lib/supabase/browser", () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc,
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
    },
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

async function renderizarFormularioAutenticacaoEmModoCadastro(
  user: ReturnType<typeof userEvent.setup>,
) {
  render(<FormularioAutenticacao />);
  await user.click(screen.getByRole("button", { name: /cadastre-se/i }));
}

/**
 * FormularioAutenticacao no modo **Cadastrar** (e-mail, login, senhas).
 */
describe("FormularioAutenticacao · cadastrar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ data: null, error: null });
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    mockSignInWithPassword.mockResolvedValue({ error: null });
  });

  describe("bloqueio de envio duplicado", () => {
    it("deve chamar signUp apenas uma vez mesmo com múltiplos cliques durante cadastro pendente", async () => {
      mockSignUp.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      await renderizarFormularioAutenticacaoEmModoCadastro(user);

      await user.type(screen.getByLabelText(/^login$/i), "meulogin");
      await user.type(screen.getByLabelText(/e-mail/i), "novo@test.com");
      await user.type(screen.getByLabelText(/^senha$/i), "123456");
      await user.type(screen.getByLabelText(/confirme a senha/i), "123456");

      const botao = screen.getByRole("button", { name: /cadastrar/i });
      await user.click(botao);
      await user.click(botao);
      await user.click(botao);

      expect(mockSignUp).toHaveBeenCalledTimes(1);
    });

    it("deve mostrar estado de carregamento durante cadastro pendente", async () => {
      mockSignUp.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      await renderizarFormularioAutenticacaoEmModoCadastro(user);

      await user.type(screen.getByLabelText(/^login$/i), "meulogin");
      await user.type(screen.getByLabelText(/e-mail/i), "novo@test.com");
      await user.type(screen.getByLabelText(/^senha$/i), "123456");
      await user.type(screen.getByLabelText(/confirme a senha/i), "123456");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /criando conta/i }),
        ).toBeDisabled();
      });
    });
  });

  describe("validação Zod — não dispara RPC nem signUp", () => {
    it("deve não chamar rede quando formulário está vazio", async () => {
      const user = userEvent.setup();
      await renderizarFormularioAutenticacaoEmModoCadastro(user);

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("deve não chamar signUp quando e-mail é inválido", async () => {
      const user = userEvent.setup();
      await renderizarFormularioAutenticacaoEmModoCadastro(user);

      await user.type(screen.getByLabelText(/^login$/i), "meulogin");
      await user.type(screen.getByLabelText(/e-mail/i), "nao-e-email");
      await user.type(screen.getByLabelText(/^senha$/i), "123456");
      await user.type(screen.getByLabelText(/confirme a senha/i), "123456");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("deve não chamar signUp quando senha tem menos de 6 caracteres", async () => {
      const user = userEvent.setup();
      await renderizarFormularioAutenticacaoEmModoCadastro(user);

      await user.type(screen.getByLabelText(/^login$/i), "meulogin");
      await user.type(screen.getByLabelText(/e-mail/i), "a@test.com");
      await user.type(screen.getByLabelText(/^senha$/i), "12345");
      await user.type(screen.getByLabelText(/confirme a senha/i), "12345");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("deve não chamar signUp quando senhas não coincidem", async () => {
      const user = userEvent.setup();
      await renderizarFormularioAutenticacaoEmModoCadastro(user);

      await user.type(screen.getByLabelText(/^login$/i), "meulogin");
      await user.type(screen.getByLabelText(/e-mail/i), "a@test.com");
      await user.type(screen.getByLabelText(/^senha$/i), "123456");
      await user.type(screen.getByLabelText(/confirme a senha/i), "999999");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("deve não chamar signUp quando login contém caracteres não permitidos", async () => {
      const user = userEvent.setup();
      await renderizarFormularioAutenticacaoEmModoCadastro(user);

      await user.type(screen.getByLabelText(/^login$/i), "abc123");
      await user.type(screen.getByLabelText(/e-mail/i), "a@test.com");
      await user.type(screen.getByLabelText(/^senha$/i), "123456");
      await user.type(screen.getByLabelText(/confirme a senha/i), "123456");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("deve não chamar signUp quando login tem menos de 3 caracteres", async () => {
      const user = userEvent.setup();
      await renderizarFormularioAutenticacaoEmModoCadastro(user);

      await user.type(screen.getByLabelText(/^login$/i), "ab");
      await user.type(screen.getByLabelText(/e-mail/i), "a@test.com");
      await user.type(screen.getByLabelText(/^senha$/i), "123456");
      await user.type(screen.getByLabelText(/confirme a senha/i), "123456");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });
});
