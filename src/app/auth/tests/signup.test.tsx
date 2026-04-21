import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "../components/auth-form.component";

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

async function abrirModoCadastro(user: ReturnType<typeof userEvent.setup>) {
  render(<AuthForm />);
  await user.click(
    screen.getByRole("button", { name: /cadastre-se/i }),
  );
}

/**
 * AuthForm no modo **Cadastrar** (e-mail, login, senhas).
 */
describe("AuthForm · cadastrar (sign-up)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ data: null, error: null });
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    mockSignInWithPassword.mockResolvedValue({ error: null });
  });

  describe("bloqueio de envio duplicado", () => {
    it("com cadastro pendente, vários cliques em Cadastrar chamam signUp apenas uma vez", async () => {
      mockSignUp.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      await abrirModoCadastro(user);

      await user.type(screen.getByPlaceholderText("Login"), "meulogin");
      await user.type(screen.getByPlaceholderText("E-mail"), "novo@test.com");
      await user.type(screen.getByPlaceholderText("Senha"), "123456");
      await user.type(screen.getByPlaceholderText("Confirme sua senha"), "123456");

      const botao = screen.getByRole("button", { name: /cadastrar/i });
      await user.click(botao);
      await user.click(botao);
      await user.click(botao);

      expect(mockSignUp).toHaveBeenCalledTimes(1);
    });

    it("durante cadastro pendente, o botão mostra estado de espera", async () => {
      mockSignUp.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      await abrirModoCadastro(user);

      await user.type(screen.getByPlaceholderText("Login"), "meulogin");
      await user.type(screen.getByPlaceholderText("E-mail"), "novo@test.com");
      await user.type(screen.getByPlaceholderText("Senha"), "123456");
      await user.type(screen.getByPlaceholderText("Confirme sua senha"), "123456");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /criando conta/i }),
        ).toBeDisabled();
      });
    });
  });

  describe("validação Zod — não dispara RPC nem signUp", () => {
    it("formulário vazio: nenhuma chamada à rede", async () => {
      const user = userEvent.setup();
      await abrirModoCadastro(user);

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("e-mail inválido: não chama signUp", async () => {
      const user = userEvent.setup();
      await abrirModoCadastro(user);

      await user.type(screen.getByPlaceholderText("Login"), "meulogin");
      await user.type(screen.getByPlaceholderText("E-mail"), "nao-e-email");
      await user.type(screen.getByPlaceholderText("Senha"), "123456");
      await user.type(screen.getByPlaceholderText("Confirme sua senha"), "123456");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("senha com menos de 6 caracteres: não chama signUp", async () => {
      const user = userEvent.setup();
      await abrirModoCadastro(user);

      await user.type(screen.getByPlaceholderText("Login"), "meulogin");
      await user.type(screen.getByPlaceholderText("E-mail"), "a@test.com");
      await user.type(screen.getByPlaceholderText("Senha"), "12345");
      await user.type(screen.getByPlaceholderText("Confirme sua senha"), "12345");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("senhas diferentes: não chama signUp", async () => {
      const user = userEvent.setup();
      await abrirModoCadastro(user);

      await user.type(screen.getByPlaceholderText("Login"), "meulogin");
      await user.type(screen.getByPlaceholderText("E-mail"), "a@test.com");
      await user.type(screen.getByPlaceholderText("Senha"), "123456");
      await user.type(screen.getByPlaceholderText("Confirme sua senha"), "999999");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("login com caracteres não permitidos (ex.: dígitos): não chama signUp", async () => {
      const user = userEvent.setup();
      await abrirModoCadastro(user);

      await user.type(screen.getByPlaceholderText("Login"), "abc123");
      await user.type(screen.getByPlaceholderText("E-mail"), "a@test.com");
      await user.type(screen.getByPlaceholderText("Senha"), "123456");
      await user.type(screen.getByPlaceholderText("Confirme sua senha"), "123456");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("login com menos de 3 caracteres: não chama signUp", async () => {
      const user = userEvent.setup();
      await abrirModoCadastro(user);

      await user.type(screen.getByPlaceholderText("Login"), "ab");
      await user.type(screen.getByPlaceholderText("E-mail"), "a@test.com");
      await user.type(screen.getByPlaceholderText("Senha"), "123456");
      await user.type(screen.getByPlaceholderText("Confirme sua senha"), "123456");

      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });
});
