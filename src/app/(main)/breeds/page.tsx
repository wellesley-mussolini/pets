"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/browser";
import { BreedForm } from "./components/breed-form.component";
import {
  BREED_SIZE_LABELS_PT_BR,
  type SupabaseBreedRows,
} from "./types/breeds.types";
import { dataUtils } from "@/utils/data.utils";

export default function BreedsPage() {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const {
    data: breeds = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<SupabaseBreedRows[]>({
    queryKey: ["breeds"],
    queryFn: async () => {
      const { data, error } = await createClient()
        .from("breeds")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data as SupabaseBreedRows[]) ?? [];
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4 py-8">
      <div className="flex w-full flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Raças</h1>
        <p className="text-muted-foreground text-sm">
          Grupos e portes cadastrados no sistema.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setDialogOpen(true)}
        >
          Adicionar registro
        </Button>
      </div>

      {isPending ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner className="size-4" />
          Carregando lista…
        </div>
      ) : isError ? (
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <p className="text-destructive text-sm">{error.message}</p>
          <p className="text-muted-foreground text-xs">
            Se a tabela ainda não existir no Supabase, rode a migração em{" "}
            <code className="rounded bg-muted px-1">
              supabase/migrations/002_breeds.sql
            </code>{" "}
            e recarregue o cache da API no dashboard.
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </div>
      ) : breeds.length === 0 ? (
        <p className="text-muted-foreground max-w-xl text-center text-sm">
          Nenhum registro ainda. Use &quot;Adicionar&quot; para criar o primeiro.
        </p>
      ) : (
        <ul className="divide-border max-w-3xl divide-y rounded-lg border">
          {breeds.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
            >
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex flex-row items-center gap-2 justify-between">
                  <p className="font-medium text-base mb-2">{row.breed_group}</p>
                  <time
                    className="text-muted-foreground shrink-0 text-xs tabular-nums"
                    dateTime={row.created_at}
                  >
                    {dataUtils.formatarDataParaPtBr(new Date(row.created_at))}
                  </time>
                </div>
                <p className="text-muted-foreground">
                  Porte {BREED_SIZE_LABELS_PT_BR[row.size]}
                </p>
                <p>Peso médio: {row.weight_min}–{row.weight_max} kg</p>
                <p>Expectativa de vida: {row.life_span_min}–{row.life_span_max} anos</p>
              </div>

            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo registro de raça</DialogTitle>
            <DialogDescription>
              Preencha grupo, faixa de peso e expectativa de vida. O porte é
              calculado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <BreedForm onRegistered={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
