import { z } from "zod";

export const breedsFormZod = z
  .object({
    breed_group: z
      .string()
      .trim()
      .min(1, "Informe o grupo (ex.: pastoreiro, caça, corrida).")
      .max(50, "No máximo 50 caracteres."),
    weight_min: z
      .number({ message: "Peso mínimo inválido." })
      .int()
      .min(0, "Fora do intervalo.")
      .max(90, "Fora do intervalo."),
    weight_max: z
      .number({ message: "Peso máximo inválido." })
      .int()
      .min(0, "Fora do intervalo.")
      .max(90, "Fora do intervalo."),
    life_span_min: z
      .number({ message: "Expectativa de vida mínima inválida." })
      .int("Use anos inteiros.")
      .min(1, "Informe pelo menos 1 ano."),
    life_span_max: z
      .number({ message: "Expectativa de vida máxima inválida." })
      .int("Use anos inteiros.")
      .min(1, "Informe pelo menos 1 ano."),
  })
  .refine((d) => d.weight_max > d.weight_min, {
    message: "O máximo deve ser maior que o mínimo.",
    path: ["weight_max"],
  })
  .refine((d) => (d.weight_min + d.weight_max) / 2 > 0, {
    message: "A média da faixa de peso deve ser maior que zero.",
    path: ["weight_min"],
  })
  .refine((d) => d.life_span_max > d.life_span_min, {
    message: "A vida máxima deve ser maior que a mínima.",
    path: ["life_span_max"],
  });

export type BreedsFormValues = z.infer<typeof breedsFormZod>;