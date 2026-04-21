import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/header/header.component";

const mockSignOut = vi.fn();

vi.mock("@/lib/supabase/browser", () => ({
  createClient: vi.fn(() => ({
    auth: { signOut: mockSignOut },
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
 * Header — botão de encerrar sessão (Supabase signOut + refresh).
 */
describe("Header · deslogar (sign-out)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
  });

  it("vários cliques rápidos chamam signOut apenas uma vez", async () => {
    mockSignOut.mockImplementation(() => new Promise(() => {}));

    const user = userEvent.setup();
    render(<Header />);

    const botaoSair = screen.getByRole("button", { name: /sair da conta/i });
    await user.click(botaoSair);
    await user.click(botaoSair);
    await user.click(botaoSair);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("enquanto sign-out pendente, o botão mostra estado de espera", async () => {
    mockSignOut.mockImplementation(() => new Promise(() => {}));

    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole("button", { name: /sair da conta/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /encerrando sessão/i }),
      ).toBeDisabled();
    });
  });
});
