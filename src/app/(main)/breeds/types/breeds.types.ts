export type BreedSize = "toy" | "small" | "medium" | "large" | "giant";

/** Linha retornada de `public.breeds`. */
export type SupabaseBreedRows = {
  id: string;
  breed_group: string;
  size: BreedSize;
  weight_min: number;
  weight_max: number;
  life_span_min: number;
  life_span_max: number;
  created_at: string;
};

/** Rótulos PT-BR para cada valor de `BreedSize` persistido no Supabase. */
export const BREED_SIZE_LABELS_PT_BR: Record<BreedSize, string> = {
  toy: "Miniatura",
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  giant: "Gigante",
};