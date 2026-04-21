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

/**
 * AuthForm no modo **Entrar** (login + senha).
 * Default do componente: isLogin === true.
 */
describe("AuthForm · entrar (sign-in)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ data: "user@test.com", error: null });
    mockSignInWithPassword.mockResolvedValue({ error: null });
  });

  describe("bloqueio de envio duplicado e chamadas à rede", () => {
    it("com sign-in pendente, vários cliques em Entrar chamam signInWithPassword apenas uma vez", async () => {
      mockSignInWithPassword.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      render(<AuthForm />);

      await user.type(screen.getByPlaceholderText("Login"), "meulogin");
      await user.type(screen.getByPlaceholderText("Senha"), "secret12");

      const botaoEntrar = screen.getByRole("button", { name: /entrar/i });
      await user.click(botaoEntrar);
      await user.click(botaoEntrar);
      await user.click(botaoEntrar);

      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    });

    it("com RPC em erro, libera nova tentativa e o segundo envio chama signInWithPassword", async () => {
      mockRpc
        .mockResolvedValueOnce({
          data: null,
          error: { message: "falha na função" },
        })
        .mockResolvedValueOnce({ data: "user@test.com", error: null });

      const user = userEvent.setup();
      render(<AuthForm />);

      await user.type(screen.getByPlaceholderText("Login"), "meulogin");
      await user.type(screen.getByPlaceholderText("Senha"), "secret12");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(mockSignInWithPassword).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    });

    it("não chama RPC nem signIn quando login e senha estão vazios", async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe("UI de carregamento", () => {
    it("durante sign-in pendente, o botão mostra estado de espera e fica desabilitado", async () => {
      mockSignInWithPassword.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      render(<AuthForm />);

      await user.type(screen.getByPlaceholderText("Login"), "meulogin");
      await user.type(screen.getByPlaceholderText("Senha"), "secret12");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /entrando/i }),
        ).toBeDisabled();
      });
    });
  });
});
