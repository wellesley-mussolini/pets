"use client";

import React from "react";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { mensagensErroSupabaseAuth } from "../constants/mensagensErrorSupabase.constants";
import type {
  ValoresFormularioCadastrar,
  ValoresFormularioEntrar,
} from "../types/auth.types";
import { esquemasValidacaoAutenticacao } from "../zod/auth.zod";

export const useFormularioAutenticacao = () => {
  const roteador = useRouter();
  const [modoEhEntrar, setModoEhEntrar] = React.useState<boolean>(true);
  const [envioAutenticacaoEmAndamento, setEnvioAutenticacaoEmAndamento] =
    React.useState<boolean>(false);
  const [mostrarSenhaLoginEmTextoClaro, setMostrarSenhaLoginEmTextoClaro] =
    React.useState<boolean>(false);
  const [
    mostrarSenhaCadastroEmTextoClaro,
    setMostrarSenhaCadastroEmTextoClaro,
  ] = React.useState<boolean>(false);
  const [
    mostrarConfirmacaoSenhaCadastroEmTextoClaro,
    setMostrarConfirmacaoSenhaCadastroEmTextoClaro,
  ] = React.useState<boolean>(false);
  const referenciaEvitarEnvioDuplicadoAutenticacao =
    React.useRef<boolean>(false);

  const formularioEntrar = useForm<ValoresFormularioEntrar>({
    resolver: (valores) => {
      const resultado = esquemasValidacaoAutenticacao.entrar.safeParse(valores);
      if (!resultado.success) {
        const erros = resultado.error.flatten().fieldErrors;
        return {
          values: {},
          errors: erros as Record<string, { message: string }>,
        };
      }
      return { values: resultado.data, errors: {} };
    },
    defaultValues: { login: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const formularioCadastrar = useForm<ValoresFormularioCadastrar>({
    resolver: (valores) => {
      const resultado =
        esquemasValidacaoAutenticacao.cadastrar.safeParse(valores);
      if (!resultado.success) {
        const erros = resultado.error.flatten().fieldErrors;
        return {
          values: {},
          errors: erros as Record<string, { message: string }>,
        };
      }
      return { values: resultado.data, errors: {} };
    },
    defaultValues: {
      email: "",
      login: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const liberarNovoEnvioEPararCarregamento = () => {
    referenciaEvitarEnvioDuplicadoAutenticacao.current = false;
    setEnvioAutenticacaoEmAndamento(false);
  };

  const alternarModoEntrarOuCadastrar = () => {
    if (envioAutenticacaoEmAndamento) return;
    setModoEhEntrar((valorAnterior) => !valorAnterior);
    formularioEntrar.clearErrors();
    formularioCadastrar.clearErrors();
  };

  const enviarFormularioEntrar = formularioEntrar.handleSubmit(
    async (valores) => {
      if (referenciaEvitarEnvioDuplicadoAutenticacao.current) return;
      if (!valores.login || !valores.password) {
        return;
      }
      referenciaEvitarEnvioDuplicadoAutenticacao.current = true;
      setEnvioAutenticacaoEmAndamento(true);
      try {
        const supabase = createClient();
        const loginEmMinusculas = valores.login.toLowerCase();

        const {
          data: emailVinculadoAoLogin,
          error: erroRpcBuscarEmailPorLogin,
        } = await supabase.rpc("get_email_by_login", {
          p_login: loginEmMinusculas,
        });

        if (erroRpcBuscarEmailPorLogin) {
          toast.error(erroRpcBuscarEmailPorLogin.message);
          liberarNovoEnvioEPararCarregamento();
          return;
        }

        if (!emailVinculadoAoLogin) {
          const mensagemContaNaoEncontrada =
            "Não foi encontrada uma conta com este login.";
          formularioEntrar.setError("login", {
            type: "server",
            message: mensagemContaNaoEncontrada,
          });
          formularioEntrar.setError("password", { type: "server" });
          toast.error(mensagemContaNaoEncontrada);
          liberarNovoEnvioEPararCarregamento();
          return;
        }

        const { error: erroAutenticacaoEntrar } =
          await supabase.auth.signInWithPassword({
            email: emailVinculadoAoLogin,
            password: valores.password,
          });

        if (erroAutenticacaoEntrar) {
          const mensagemErroEntrar = erroAutenticacaoEntrar.message;
          const erroSupabaseIndicaCredenciaisInvalidas =
            mensagemErroEntrar.includes(
              mensagensErroSupabaseAuth.credenciaisInvalidas,
            );
          if (erroSupabaseIndicaCredenciaisInvalidas) {
            formularioEntrar.setError("password", {
              type: "server",
              message: "Senha digitada está incorreta.",
            });
            toast.error("Senha digitada está incorreta.");
          } else {
            toast.error(mensagemErroEntrar);
          }
          liberarNovoEnvioEPararCarregamento();
          return;
        }

        toast.success("Login realizado com sucesso!");
        roteador.push("/");
        roteador.refresh();
      } catch {
        liberarNovoEnvioEPararCarregamento();
      }
    },
  );

  const enviarFormularioCadastrar = formularioCadastrar.handleSubmit(
    async (valores) => {
      if (referenciaEvitarEnvioDuplicadoAutenticacao.current) return;
      referenciaEvitarEnvioDuplicadoAutenticacao.current = true;
      setEnvioAutenticacaoEmAndamento(true);
      try {
        const supabase = createClient();
        const loginEmMinusculas = valores.login.trim().toLowerCase();

        const {
          data: emailRetornadoPorLoginJaCadastrado,
          error: erroRpcBuscarEmailPorLogin,
        } = await supabase.rpc("get_email_by_login", {
          p_login: loginEmMinusculas,
        });

        if (erroRpcBuscarEmailPorLogin) {
          toast.error(erroRpcBuscarEmailPorLogin.message);
          liberarNovoEnvioEPararCarregamento();
          return;
        }

        if (emailRetornadoPorLoginJaCadastrado) {
          toast.error("Este login já está em uso.");
          liberarNovoEnvioEPararCarregamento();
          return;
        }

        const { error: erroCadastro } = await supabase.auth.signUp({
          email: valores.email.trim(),
          password: valores.password,
          options: {
            data: { login: loginEmMinusculas },
          },
        });

        if (erroCadastro) {
          toast.error(erroCadastro.message);
          liberarNovoEnvioEPararCarregamento();
          return;
        }

        const { error: erroEntrarAposCadastro } =
          await supabase.auth.signInWithPassword({
            email: valores.email.trim(),
            password: valores.password,
          });

        if (erroEntrarAposCadastro) {
          toast.error(
            erroEntrarAposCadastro.message.includes(
              mensagensErroSupabaseAuth.emailNaoConfirmado,
            )
              ? "Confirme seu e-mail para entrar (ou desative confirmação no Supabase Auth)."
              : erroEntrarAposCadastro.message,
          );
          liberarNovoEnvioEPararCarregamento();
          return;
        }

        toast.success("Conta criada com sucesso!");
        roteador.push("/");
        roteador.refresh();
      } catch {
        liberarNovoEnvioEPararCarregamento();
      }
    },
  );

  return {
    modoEhEntrar,
    envioAutenticacaoEmAndamento,
    mostrarSenhaLoginEmTextoClaro,
    mostrarSenhaCadastroEmTextoClaro,
    mostrarConfirmacaoSenhaCadastroEmTextoClaro,
    formularioEntrar,
    formularioCadastrar,
    setModoEhEntrar,
    setEnvioAutenticacaoEmAndamento,
    setMostrarSenhaLoginEmTextoClaro,
    setMostrarSenhaCadastroEmTextoClaro,
    setMostrarConfirmacaoSenhaCadastroEmTextoClaro,
    alternarModoEntrarOuCadastrar,
    enviarFormularioEntrar,
    enviarFormularioCadastrar,
  };
};
