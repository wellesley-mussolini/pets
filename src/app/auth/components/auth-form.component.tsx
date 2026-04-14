"use client";

import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Field, FieldContent, FieldError, FieldGroup, FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";
import type { FieldError as ErroCampo } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authZod, type LoginValues, type RegisterValues } from "../zod/schemas";

function CampoTexto({
  id, rotulo, erro, bloqueado, ...input
}: {
  id: string;
  rotulo: string;
  erro?: ErroCampo;
  bloqueado?: boolean;
} & ComponentProps<typeof Input>) {
  return (
    <Field data-invalid={!!erro}>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      <FieldContent>
        <Input id={id} aria-invalid={!!erro} disabled={bloqueado} {...input} />
        {erro?.message && <FieldError>{erro.message}</FieldError>}
      </FieldContent>
    </Field>
  );
}

function BotaoSubmit({ enviando, textoEnviando, textoNormal }: {
  enviando: boolean;
  textoEnviando: string;
  textoNormal: string;
}) {
  return (
    <Button className="w-full" disabled={enviando} type="submit">
      {enviando ? <><Spinner className="size-4" />{textoEnviando}</> : textoNormal}
    </Button>
  );
}

async function authAction(
  action: () => Promise<{ error: { message: string } | null }>,
  onSuccess: () => void,
) {
  const { error } = await action();
  if (error) {
    toast.error(error.message);
    return;
  }
  onSuccess();
}

export function AuthForm() {
  const router = useRouter();
  const [aba, setAba] = useState<"entrar" | "cadastrar">("entrar");
  const formOpts = { mode: "onTouched" as const };

  const login = useForm<LoginValues>({
    resolver: zodResolver(authZod.login),
    defaultValues: { email: "", senha: "" },
    ...formOpts,
  });

  const cadastro = useForm<RegisterValues>({
    resolver: zodResolver(authZod.register),
    defaultValues: { email: "", senha: "" },
    ...formOpts,
  });

  const irParaInicio = (msg: string) => {
    toast.success(msg);
    router.push("/");
    router.refresh();
  };

  const aoMudarAba = (valor: string) => {
    setAba(valor as typeof aba);
    login.clearErrors();
    cadastro.clearErrors();
  };

  const enviarLogin = login.handleSubmit((d) =>
    authAction(
      () => createClient().auth.signInWithPassword({ email: d.email, password: d.senha }),
      () => irParaInicio("Bem-vindo de volta!"),
    )
  );

  const enviarCadastro = cadastro.handleSubmit(async (d) => {
    const supabase = createClient();
    const creds = { email: d.email, password: d.senha };

    const { error } = await supabase.auth.signUp({
      ...creds,
      options: { emailRedirectTo: undefined },
    });
    if (error) { toast.error(error.message); return; }

    await authAction(
      () => supabase.auth.signInWithPassword(creds),
      () => irParaInicio("Conta criada com sucesso!"),
    );
  });

  const le = login.formState;
  const ce = cadastro.formState;

  return (
    <Card className="w-full max-w-[420px] border-border/60 shadow-xl shadow-black/5 dark:shadow-black/20">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight">
          Acesso à conta
        </CardTitle>
        <CardDescription>
          Entre com seu e-mail ou cadastre-se para começar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={aba} onValueChange={aoMudarAba} className="gap-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entrar">Entrar</TabsTrigger>
            <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="entrar" className="mt-0">
            <form className="space-y-4" noValidate onSubmit={enviarLogin}>
              <FieldGroup>
                <CampoTexto id="e-email" rotulo="E-mail" erro={le.errors.email}
                  bloqueado={le.isSubmitting} type="email" autoComplete="email"
                  placeholder="voce@exemplo.com" {...login.register("email")} />
                <CampoTexto id="e-senha" rotulo="Senha" erro={le.errors.senha}
                  bloqueado={le.isSubmitting} type="password" autoComplete="current-password"
                  placeholder="••••••••" {...login.register("senha")} />
              </FieldGroup>
              <BotaoSubmit enviando={le.isSubmitting} textoEnviando="Entrando…" textoNormal="Entrar" />
            </form>
          </TabsContent>

          <TabsContent value="cadastrar" className="mt-0">
            <form className="space-y-4" noValidate onSubmit={enviarCadastro}>
              <FieldGroup>
                <CampoTexto id="c-email" rotulo="E-mail" erro={ce.errors.email}
                  bloqueado={ce.isSubmitting} type="email" autoComplete="email"
                  placeholder="voce@exemplo.com" {...cadastro.register("email")} />
                <CampoTexto id="c-senha" rotulo="Senha" erro={ce.errors.senha}
                  bloqueado={ce.isSubmitting} type="password" autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres" {...cadastro.register("senha")} />
              </FieldGroup>
              <BotaoSubmit enviando={ce.isSubmitting} textoEnviando="Criando conta…" textoNormal="Criar conta" />
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
