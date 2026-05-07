"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PropriedadesBotaoAlternarVisibilidadeSenha } from "../types/auth.types";
import { esquemasValidacaoAutenticacao } from "../zod/auth.zod";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { tailwindEstilos } from "../constants/tailwindEstilos.constants";
import { useFormularioAutenticacao } from "../hooks/useFormularioAutenticacao.hook";

function BotaoAlternarVisibilidadeSenha({
  senhaVisivelComoTexto,
  interacaoDesabilitadaDuranteEnvio,
  aoClicarAlternarVisibilidadeSenha,
  textoAcessibilidadeQuandoSenhaVisivel,
  textoAcessibilidadeQuandoSenhaOculta,
}: PropriedadesBotaoAlternarVisibilidadeSenha) {
  return (
    <button
      type="button"
      aria-label={
        senhaVisivelComoTexto
          ? textoAcessibilidadeQuandoSenhaVisivel
          : textoAcessibilidadeQuandoSenhaOculta
      }
      className={tailwindEstilos.botaoAlternarVisibilidadeSenha}
      disabled={interacaoDesabilitadaDuranteEnvio}
      onClick={aoClicarAlternarVisibilidadeSenha}
    >
      {senhaVisivelComoTexto ? (
        <Eye className="size-5" strokeWidth={1.75} />
      ) : (
        <EyeOff className="size-5" strokeWidth={1.75} />
      )}
    </button>
  );
}

export function FormularioAutenticacao() {
  const {
    modoEhEntrar,
    envioAutenticacaoEmAndamento,
    mostrarSenhaLoginEmTextoClaro,
    mostrarSenhaCadastroEmTextoClaro,
    mostrarConfirmacaoSenhaCadastroEmTextoClaro,
    formularioEntrar,
    formularioCadastrar,
    setModoEhEntrar,
    setMostrarSenhaLoginEmTextoClaro,
    setMostrarSenhaCadastroEmTextoClaro,
    setMostrarConfirmacaoSenhaCadastroEmTextoClaro,
    alternarModoEntrarOuCadastrar,
    enviarFormularioEntrar,
    enviarFormularioCadastrar,
  } = useFormularioAutenticacao();

  const {
    formState: { errors: errosValidacaoEntrar },
  } = formularioEntrar;
  const {
    formState: { errors: errosValidacaoCadastrar },
  } = formularioCadastrar;

  const registroCampoLoginEntrar = formularioEntrar.register("login");
  const registroCampoSenhaEntrar = formularioEntrar.register("password");

  return (
    <form
      className="flex w-full max-w-[420px] flex-col gap-8"
      noValidate
      onSubmit={modoEhEntrar ? enviarFormularioEntrar : enviarFormularioCadastrar}
    >
      {modoEhEntrar ? (
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
              <Input
                id="auth-login"
                type="text"
                autoComplete="username"
                placeholder="Digite seu login"
                disabled={envioAutenticacaoEmAndamento}
                aria-invalid={Boolean(errosValidacaoEntrar.login)}
                className={cn(
                  tailwindEstilos.inputAutenticacaoCompartilhado,
                  errosValidacaoEntrar.login
                    ? "border-destructive"
                    : "border-gray-300",
                )}
                {...registroCampoLoginEntrar}
                onChange={(evento) => {
                  registroCampoLoginEntrar.onChange(evento);
                  formularioEntrar.clearErrors("login");
                }}
              />
              {errosValidacaoEntrar.login?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {errosValidacaoEntrar.login.message}
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
                  type={mostrarSenhaLoginEmTextoClaro ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Senha"
                  disabled={envioAutenticacaoEmAndamento}
                  aria-invalid={Boolean(errosValidacaoEntrar.password)}
                  className={cn(
                    tailwindEstilos.inputAutenticacaoCompartilhado,
                    "pr-11",
                    errosValidacaoEntrar.password
                      ? "border-destructive"
                      : "border-gray-300",
                  )}
                  {...registroCampoSenhaEntrar}
                  onChange={(evento) => {
                    registroCampoSenhaEntrar.onChange(evento);
                    formularioEntrar.clearErrors("password");
                  }}
                />
                <BotaoAlternarVisibilidadeSenha
                  senhaVisivelComoTexto={mostrarSenhaLoginEmTextoClaro}
                  interacaoDesabilitadaDuranteEnvio={
                    envioAutenticacaoEmAndamento
                  }
                  aoClicarAlternarVisibilidadeSenha={() =>
                    setMostrarSenhaLoginEmTextoClaro(
                      (valorAnterior) => !valorAnterior,
                    )
                  }
                  textoAcessibilidadeQuandoSenhaVisivel="Ocultar senha"
                  textoAcessibilidadeQuandoSenhaOculta="Mostrar senha"
                />
              </div>
              {errosValidacaoEntrar.password?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {errosValidacaoEntrar.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={envioAutenticacaoEmAndamento}
            size="lg"
            className="h-11 w-full gap-2 rounded-md font-semibold shadow-none"
          >
            {envioAutenticacaoEmAndamento ? (
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
                disabled={envioAutenticacaoEmAndamento}
                aria-invalid={Boolean(errosValidacaoCadastrar.login)}
                className={cn(
                  tailwindEstilos.inputAutenticacaoCompartilhado,
                  errosValidacaoCadastrar.login
                    ? "border-destructive"
                    : "border-gray-300",
                )}
                {...formularioCadastrar.register("login")}
              />
              {errosValidacaoCadastrar.login?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {errosValidacaoCadastrar.login.message}
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
                disabled={envioAutenticacaoEmAndamento}
                aria-invalid={Boolean(errosValidacaoCadastrar.email)}
                className={cn(
                  tailwindEstilos.inputAutenticacaoCompartilhado,
                  errosValidacaoCadastrar.email
                    ? "border-destructive"
                    : "border-gray-300",
                )}
                {...formularioCadastrar.register("email")}
              />
              {errosValidacaoCadastrar.email?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {errosValidacaoCadastrar.email.message}
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
                  type={mostrarSenhaCadastroEmTextoClaro ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Senha"
                  disabled={envioAutenticacaoEmAndamento}
                  aria-invalid={Boolean(errosValidacaoCadastrar.password)}
                  className={cn(
                    tailwindEstilos.inputAutenticacaoCompartilhado,
                    "pr-11",
                    errosValidacaoCadastrar.password
                      ? "border-destructive"
                      : "border-gray-300",
                  )}
                  {...formularioCadastrar.register("password")}
                />
                <BotaoAlternarVisibilidadeSenha
                  senhaVisivelComoTexto={mostrarSenhaCadastroEmTextoClaro}
                  interacaoDesabilitadaDuranteEnvio={
                    envioAutenticacaoEmAndamento
                  }
                  aoClicarAlternarVisibilidadeSenha={() =>
                    setMostrarSenhaCadastroEmTextoClaro(
                      (valorAnterior) => !valorAnterior,
                    )
                  }
                  textoAcessibilidadeQuandoSenhaVisivel="Ocultar senha"
                  textoAcessibilidadeQuandoSenhaOculta="Mostrar senha"
                />
              </div>
              {errosValidacaoCadastrar.password?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {errosValidacaoCadastrar.password.message}
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
                  type={
                    mostrarConfirmacaoSenhaCadastroEmTextoClaro
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Digite a senha novamente"
                  disabled={envioAutenticacaoEmAndamento}
                  aria-invalid={Boolean(
                    errosValidacaoCadastrar.confirmPassword,
                  )}
                  className={cn(
                    tailwindEstilos.inputAutenticacaoCompartilhado,
                    "pr-11",
                    errosValidacaoCadastrar.confirmPassword
                      ? "border-destructive"
                      : "border-gray-300",
                  )}
                  {...formularioCadastrar.register("confirmPassword")}
                />
                <BotaoAlternarVisibilidadeSenha
                  senhaVisivelComoTexto={
                    mostrarConfirmacaoSenhaCadastroEmTextoClaro
                  }
                  interacaoDesabilitadaDuranteEnvio={
                    envioAutenticacaoEmAndamento
                  }
                  aoClicarAlternarVisibilidadeSenha={() =>
                    setMostrarConfirmacaoSenhaCadastroEmTextoClaro(
                      (valorAnterior) => !valorAnterior,
                    )
                  }
                  textoAcessibilidadeQuandoSenhaVisivel="Ocultar confirmação de senha"
                  textoAcessibilidadeQuandoSenhaOculta="Mostrar confirmação de senha"
                />
              </div>
              {errosValidacaoCadastrar.confirmPassword?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {errosValidacaoCadastrar.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={envioAutenticacaoEmAndamento}
            size="lg"
            className="h-11 w-full gap-2 rounded-md font-semibold shadow-none"
          >
            {envioAutenticacaoEmAndamento ? (
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
        disabled={envioAutenticacaoEmAndamento}
        className="cursor-pointer text-left text-sm text-gray-500 underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
        onClick={alternarModoEntrarOuCadastrar}
      >
        {modoEhEntrar
          ? "Não tem uma conta? Cadastre-se"
          : "Já tem uma conta? Faça login"}
      </Button>
    </form>
  );
}
