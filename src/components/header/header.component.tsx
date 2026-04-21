"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { BoneIcon } from "@/svgs/bone.svg";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/browser";

export function Header() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  /** Evita vários envios enquanto o signOut ainda está em andamento no cliente. */
  const signOutRequestAlreadyRunningRef = useRef(false);

  const [isSigningOut, setIsSigningOut] = useState(false);

  const stopSigningOutUiAndAllowRetry = () => {
    signOutRequestAlreadyRunningRef.current = false;
    setIsSigningOut(false);
  };

  /**
   * Encerra a sessão no Supabase e atualiza Server Components (`router.refresh`).
   * Sucesso mantém loading até a UI trocar (sem liberar antes do refresh).
   */
  const handleSignOut = useCallback(async () => {
    if (signOutRequestAlreadyRunningRef.current) return;
    signOutRequestAlreadyRunningRef.current = true;
    setIsSigningOut(true);

    try {
      const { error } = await createClient().auth.signOut();

      if (error) {
        toast.error(error.message);
        stopSigningOutUiAndAllowRetry();
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("Não foi possível sair. Tente de novo.");
      stopSigningOutUiAndAllowRetry();
    }
  }, [router, startTransition]);

  return (
    <header className="top-0 flex items-center justify-between px-6 py-4">
      <Link href="/" className="inline-flex" aria-label="Ir para o início">
        <BoneIcon className="w-8 cursor-pointer transition-all duration-300 hover:scale-120" />
      </Link>

      <Button
        variant="default"
        size="sm"
        type="button"
        disabled={isSigningOut}
        aria-busy={isSigningOut}
        aria-label={isSigningOut ? "Encerrando sessão" : "Sair da conta"}
        className="min-w-24 cursor-pointer gap-1.5 rounded-md"
        onClick={handleSignOut}
      >
        {isSigningOut ? (
          <>
            <Spinner className="size-4" />
            <span className="text-xs font-medium">Saindo</span>
          </>
        ) : (
          "SAIR"
        )}
      </Button>
    </header>
  );
}
