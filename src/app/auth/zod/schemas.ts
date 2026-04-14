import { z } from "zod";

export const authZod = {
  login: z.object({
    email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
    senha: z.string().min(1, "Informe sua senha."),
  }),
  register: z.object({
    email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
    senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  }),
};

export type LoginValues = z.infer<typeof authZod.login>;
export type RegisterValues = z.infer<typeof authZod.register>;