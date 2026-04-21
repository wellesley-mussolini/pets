import { regexUtils } from "@/utils/regex.utils";
import { z } from "zod";

export const authZod = {
  login: z.object({
    login: z.string().trim().min(1, "Informe seu login."),
    password: z.string().min(1, "Informe sua senha."),
  }),

  signUp: z
    .object({
      email: z
        .string()
        .trim()
        .min(1, "Informe seu e-mail.")
        .email("E-mail inválido."),
      login: z
        .string()
        .trim()
        .min(3, "O login deve ter pelo menos 3 caracteres.")
        .max(30, "O login pode ter no máximo 30 caracteres.")
        .refine(
          (value) =>
            value ===
            regexUtils.manterApenasLetrasSemCaracteresEspeciais(value),
          "Use apenas letras, sem caracteres especiais.",
        ),
      password: z
        .string()
        .min(6, "A senha deve ter pelo menos 6 caracteres."),
      confirmPassword: z.string().min(1, "Confirme sua senha."),
    })
    .refine((password) => password.password === password.confirmPassword, {
      message: "As senhas não conferem.",
      path: ["confirmPassword"],
    }),
};

export type LoginValues = z.infer<typeof authZod.login>;
export type SignUpValues = z.infer<typeof authZod.signUp>;