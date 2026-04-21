"use client";

import React from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Padding, cantos e tipografia iguais; borda ok/vermelha combina em `cn(...)` no campo. */
const SHARED_AUTH_INPUT_CLASS_NAMES =
  "h-auto rounded-md bg-white px-3 py-3 text-base shadow-none md:text-sm";

export function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = React.useState<boolean>(true);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showLoginPassword, setShowLoginPassword] = React.useState<boolean>(false);
  const [showSignUpPassword, setShowSignUpPassword] = React.useState<boolean>(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = React.useState<boolean>(false);
  // Evita segundo envio enquanto login ou cadastro ainda está sendo processado no servidor
  const authSubmitAlreadyRunningRef = React.useRef<boolean>(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(authZod.login),
    defaultValues: { login: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(authZod.signUp),
    defaultValues: {
      email: "",
      login: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const { formState: { errors: loginFieldErrors } } = loginForm;
  const { formState: { errors: signUpFieldErrors } } = signUpForm;

  /** `register` devolve name, ref, onBlur e onChange para ligar o input ao formulário. */
  const loginInputRegistration = loginForm.register("login");
  const passwordInputRegistration = loginForm.register("password");

  // Após falha de rede ou credenciais: libera novo clique em Entrar/Cadastrar.
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
    if (!values.login || !values.password) {
      return;
    }
    authSubmitAlreadyRunningRef.current = true;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const loginInLowerCase = values.login.toLowerCase();

      // Supabase busca o e-mail vinculado ao login no banco de dados
      const { data: emailAssociatedWithLogin, error: errorSearchingEmailByLogin } =
        await supabase.rpc("get_email_by_login", { p_login: loginInLowerCase });

      if (errorSearchingEmailByLogin) {
        toast.error(errorSearchingEmailByLogin.message);
        stopLoadingAndAllowNewAuthAttempt();
        return;
      }

      if (!emailAssociatedWithLogin) {
        loginForm.setError("login", {
          type: "server",
          message: "Não foi encontrado uma conta com este login",
        });
        loginForm.setError("password", { type: "server" });
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
          loginForm.setError("password", {
            type: "server",
            message: "Senha digitada está incorreta.",
          });
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
      className="flex w-full max-w-[420px] flex-col gap-8"
      noValidate
      onSubmit={isLogin ? handleSubmitLogin : handleSubmitSignUp}
    >
      {isLogin ? (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Entrar
          </h1>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-login"
                className="text-sm font-medium text-gray-900"
              >
                Login
              </label>
              {/* autoComplete="username": no HTML é o identificador do “campo usuário” para autofill (pareia com a senha). */}
              <Input
                id="auth-login"
                type="text"
                autoComplete="username"
                placeholder="Digite seu login"
                disabled={isLoading}
                aria-invalid={Boolean(loginFieldErrors.login)}
                className={cn(
                  SHARED_AUTH_INPUT_CLASS_NAMES,
                  loginFieldErrors.login ? "border-destructive" : "border-gray-300",
                )}
                {...loginInputRegistration}
                onChange={(e) => {
                  loginInputRegistration.onChange(e);
                  loginForm.clearErrors("login");
                }}
              />
              {loginFieldErrors.login?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {loginFieldErrors.login.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-password"
                className="text-sm font-medium text-gray-900"
              >
                Senha
              </label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showLoginPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Senha"
                  disabled={isLoading}
                  aria-invalid={Boolean(loginFieldErrors.password)}
                  className={cn(
                    SHARED_AUTH_INPUT_CLASS_NAMES,
                    "pr-11",
                    loginFieldErrors.password
                      ? "border-destructive"
                      : "border-gray-300",
                  )}
                  {...passwordInputRegistration}
                  onChange={(e) => {
                    passwordInputRegistration.onChange(e);
                    loginForm.clearErrors("password");
                  }}
                />
                <button
                  type="button"
                  aria-label={
                    showLoginPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none"
                  disabled={isLoading}
                  onClick={() => setShowLoginPassword((v) => !v)}
                >
                  {showLoginPassword ? (
                    <Eye className="size-5" strokeWidth={1.75} />
                  ) : (
                    <EyeOff className="size-5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {loginFieldErrors.password?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {loginFieldErrors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="h-11 w-full gap-2 rounded-md font-semibold shadow-none"
          >
            {isLoading ? (
              <>
                <Spinner className="size-4 text-primary-foreground" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Cadastrar
          </h1>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-signup-login"
                className="text-sm font-medium text-gray-900"
              >
                Login
              </label>
              <Input
                id="auth-signup-login"
                type="text"
                autoComplete="username"
                placeholder="Escolha um login"
                disabled={isLoading}
                aria-invalid={Boolean(signUpFieldErrors.login)}
                className={cn(
                  SHARED_AUTH_INPUT_CLASS_NAMES,
                  signUpFieldErrors.login ? "border-destructive" : "border-gray-300",
                )}
                {...signUpForm.register("login")}
              />
              {signUpFieldErrors.login?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {signUpFieldErrors.login.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-signup-email"
                className="text-sm font-medium text-gray-900"
              >
                E-mail
              </label>
              <Input
                id="auth-signup-email"
                type="email"
                autoComplete="email"
                placeholder="nome@exemplo.com"
                disabled={isLoading}
                aria-invalid={Boolean(signUpFieldErrors.email)}
                className={cn(
                  SHARED_AUTH_INPUT_CLASS_NAMES,
                  signUpFieldErrors.email ? "border-destructive" : "border-gray-300",
                )}
                {...signUpForm.register("email")}
              />
              {signUpFieldErrors.email?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {signUpFieldErrors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-signup-password"
                className="text-sm font-medium text-gray-900"
              >
                Senha
              </label>
              <div className="relative">
                <Input
                  id="auth-signup-password"
                  type={showSignUpPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Senha"
                  disabled={isLoading}
                  aria-invalid={Boolean(signUpFieldErrors.password)}
                  className={cn(
                    SHARED_AUTH_INPUT_CLASS_NAMES,
                    "pr-11",
                    signUpFieldErrors.password
                      ? "border-destructive"
                      : "border-gray-300",
                  )}
                  {...signUpForm.register("password")}
                />
                <button
                  type="button"
                  aria-label={
                    showSignUpPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none"
                  disabled={isLoading}
                  onClick={() => setShowSignUpPassword((v) => !v)}
                >
                  {showSignUpPassword ? (
                    <Eye className="size-5" strokeWidth={1.75} />
                  ) : (
                    <EyeOff className="size-5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {signUpFieldErrors.password?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {signUpFieldErrors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-signup-confirm"
                className="text-sm font-medium text-gray-900"
              >
                Confirme a senha
              </label>
              <div className="relative">
                <Input
                  id="auth-signup-confirm"
                  type={showSignUpConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Digite a senha novamente"
                  disabled={isLoading}
                  aria-invalid={Boolean(signUpFieldErrors.confirmPassword)}
                  className={cn(
                    SHARED_AUTH_INPUT_CLASS_NAMES,
                    "pr-11",
                    signUpFieldErrors.confirmPassword
                      ? "border-destructive"
                      : "border-gray-300",
                  )}
                  {...signUpForm.register("confirmPassword")}
                />
                <button
                  type="button"
                  aria-label={
                    showSignUpConfirmPassword
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none"
                  disabled={isLoading}
                  onClick={() =>
                    setShowSignUpConfirmPassword((v) => !v)
                  }
                >
                  {showSignUpConfirmPassword ? (
                    <Eye className="size-5" strokeWidth={1.75} />
                  ) : (
                    <EyeOff className="size-5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {signUpFieldErrors.confirmPassword?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {signUpFieldErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="h-11 w-full gap-2 rounded-md font-semibold shadow-none"
          >
            {isLoading ? (
              <>
                <Spinner className="size-4 text-primary-foreground" />
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