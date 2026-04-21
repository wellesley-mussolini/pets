"use client";

import React, { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  authZod,
  type SignUpValues,
  type LoginValues,
} from "../zod/auth.zod";

export function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = React.useState<boolean>(true);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  // Evita segundo envio enquanto login ou cadastro ainda está sendo processado no servidor
  const authSubmitAlreadyRunningRef = React.useRef<boolean>(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(authZod.login),
    defaultValues: { login: "", password: "" },
    mode: "onTouched",
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(authZod.signUp),
    defaultValues: {
      email: "",
      login: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  // Só depois de erro: tira o loading e permite tentar de novo (em sucesso não chamamos essa função) 
  const stopLoadingAndAllowNewAuthAttempt = () => {
    authSubmitAlreadyRunningRef.current = false;
    setIsLoading(false);
  };

  // Alterna entre login e cadastro
  const handleToggleAuthMode = () => {
    if (isLoading) return;
    setIsLogin((v) => !v);
    loginForm.clearErrors();
    signUpForm.clearErrors();
  };

  const handleSubmitLogin = loginForm.handleSubmit(async (values) => {
    if (authSubmitAlreadyRunningRef.current) return;
    authSubmitAlreadyRunningRef.current = true;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const loginInLowerCase = values.login.trim().toLowerCase();

      // Supabase busca o e-mail vinculado ao login no banco de dados
      const { data: emailAssociatedWithLogin, error: errorSearchingEmailByLogin } =
        await supabase.rpc("get_email_by_login", { p_login: loginInLowerCase });

      if (errorSearchingEmailByLogin) {
        toast.error(errorSearchingEmailByLogin.message);
        stopLoadingAndAllowNewAuthAttempt();
        return;
      }

      if (!emailAssociatedWithLogin) {
        toast.error("Não foi encontrado uma conta com este login");
        stopLoadingAndAllowNewAuthAttempt();
        return;
      }

      const { error: errorSignIn } = await supabase.auth.signInWithPassword({
        email: emailAssociatedWithLogin,
        password: values.password,
      });

      if (errorSignIn) {
        const signInMessage = errorSignIn.message;
        const wrongPasswordTyped = signInMessage.includes("Invalid login credentials")
        if (wrongPasswordTyped) {
          toast.error("Senha digitada está incorreta.");
        } else {
          toast.error(signInMessage);
        }
        stopLoadingAndAllowNewAuthAttempt();
        return;
      };

      toast.success("Login realizado com sucesso!");
      router.push("/");
      router.refresh();
    } catch {
      stopLoadingAndAllowNewAuthAttempt();
    }
  });

  const handleSubmitSignUp = signUpForm.handleSubmit(async (values) => {
    if (authSubmitAlreadyRunningRef.current) return;
    authSubmitAlreadyRunningRef.current = true;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const loginInLowerCase = values.login.trim().toLowerCase();

      const { data: emailAlreadyInUse, error: errorSearchingEmailByLogin } = await supabase.rpc(
        "get_email_by_login",
        { p_login: loginInLowerCase },
      );

      if (errorSearchingEmailByLogin) {
        toast.error(errorSearchingEmailByLogin.message);
        stopLoadingAndAllowNewAuthAttempt();
        return;
      };

      if (emailAlreadyInUse) {
        toast.error("Este login já está em uso.");
        stopLoadingAndAllowNewAuthAttempt();
        return;
      };

      const { error: errorSignUp } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: { login: loginInLowerCase },
        },
      });

      if (errorSignUp) {
        toast.error(errorSignUp.message);
        stopLoadingAndAllowNewAuthAttempt();
        return;
      }

      const { error: errorLoginAfterSignUp } =
        await supabase.auth.signInWithPassword({
          email: values.email.trim(),
          password: values.password,
        });

      if (errorLoginAfterSignUp) {
        toast.error(
          errorLoginAfterSignUp.message.includes("Email not confirmed")
            ? "Confirme seu e-mail para entrar (ou desative confirmação no Supabase Auth)."
            : errorLoginAfterSignUp.message,
        );
        stopLoadingAndAllowNewAuthAttempt();
        return;
      }

      toast.success("Conta criada com sucesso!");
      router.push("/");
      router.refresh();
    } catch {
      stopLoadingAndAllowNewAuthAttempt();
    }
  });

  return (
    <form
      className="flex w-full max-w-[420px] flex-col gap-4"
      noValidate
      onSubmit={isLogin ? handleSubmitLogin : handleSubmitSignUp}
    >
      {isLogin ? (
        <>
          <h1 className="text-2xl font-bold">Entrar</h1>
          <Input
            type="text"
            placeholder="Login"
            disabled={isLoading}
            {...loginForm.register("login")}
          />
          <Input
            type="password"
            placeholder="Senha"
            disabled={isLoading}
            {...loginForm.register("password")}
          />
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Spinner className="size-4" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Cadastrar</h1>
          <Input
            type="text"
            placeholder="Login"
            disabled={isLoading}
            {...signUpForm.register("login")}
          />
          <Input
            type="email"
            autoComplete="email"
            placeholder="E-mail"
            disabled={isLoading}
            {...signUpForm.register("email")}
          />
          <Input
            type="password"
            placeholder="Senha"
            disabled={isLoading}
            {...signUpForm.register("password")}
          />
          <Input
            type="password"
            placeholder="Confirme sua senha"
            disabled={isLoading}
            {...signUpForm.register("confirmPassword")}
          />
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Spinner className="size-4" />
                Criando conta…
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        disabled={isLoading}
        className="cursor-pointer text-left text-sm text-gray-500 underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
        onClick={handleToggleAuthMode}
      >
        {isLogin
          ? "Não tem uma conta? Cadastre-se"
          : "Já tem uma conta? Faça login"}
      </Button>
    </form>
  );
}
