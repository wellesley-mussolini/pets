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

/**
 * FormularioAutenticacao no modo **Entrar** (login + senha).
 * Estado inicial: modoEhEntrar === true.
 */
describe("FormularioAutenticacao · entrar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ data: "user@test.com", error: null });
    mockSignInWithPassword.mockResolvedValue({ error: null });
  });

  describe("bloqueio de envio duplicado e chamadas à rede", () => {
    it("deve chamar signInWithPassword apenas uma vez quando há vários cliques durante autenticação pendente", async () => {
      mockSignInWithPassword.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      render(<FormularioAutenticacao />);

      await user.type(screen.getByLabelText(/^login$/i), "meulogin");
      await user.type(screen.getByLabelText(/^senha$/i), "secret12");

      const botaoEntrar = screen.getByRole("button", { name: /entrar/i });
      await user.click(botaoEntrar);
      await user.click(botaoEntrar);
      await user.click(botaoEntrar);

      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    });

    it("deve liberar nova tentativa quando RPC falha e permitir segundo envio", async () => {
      mockRpc
        .mockResolvedValueOnce({
          data: null,
          error: { message: "falha na função" },
        })
        .mockResolvedValueOnce({ data: "user@test.com", error: null });

      const user = userEvent.setup();
      render(<FormularioAutenticacao />);

      await user.type(screen.getByLabelText(/^login$/i), "meulogin");
      await user.type(screen.getByLabelText(/^senha$/i), "secret12");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(mockSignInWithPassword).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    });

    it("deve não chamar RPC nem signIn quando login e senha estão vazios", async () => {
      const user = userEvent.setup();
      render(<FormularioAutenticacao />);

      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(mockRpc).not.toHaveBeenCalled();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe("UI de carregamento", () => {
    it("deve desabilitar o botão durante autenticação pendente", async () => {
      mockSignInWithPassword.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      render(<FormularioAutenticacao />);

      await user.type(screen.getByLabelText(/^login$/i), "meulogin");
      await user.type(screen.getByLabelText(/^senha$/i), "secret12");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /entrando/i }),
        ).toBeDisabled();
      });
    });
  });
});
