import { z } from "zod";
import { esquemasValidacaoAutenticacao } from "../zod/auth.zod";

/**
 * Tipos de formulário — inferidos dos schemas Zod.
 * Tipagem para os valores dos formulários de autenticação.
 */
export type ValoresFormularioEntrar = z.infer<
  typeof esquemasValidacaoAutenticacao.entrar
>;
export type ValoresFormularioCadastrar = z.infer<
  typeof esquemasValidacaoAutenticacao.cadastrar
>;

/**
 * Props do componente botão alternador de visibilidade de senha.
 */
export type PropriedadesBotaoAlternarVisibilidadeSenha = {
  senhaVisivelComoTexto: boolean;
  interacaoDesabilitadaDuranteEnvio: boolean;
  aoClicarAlternarVisibilidadeSenha: () => void;
  textoAcessibilidadeQuandoSenhaVisivel: string;
  textoAcessibilidadeQuandoSenhaOculta: string;
};
