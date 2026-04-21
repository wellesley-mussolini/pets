import type { BreedSize } from "../types/breeds.types";

export function classifyBreedSize(kg: number): BreedSize {
  if (!(kg > 0)) throw new RangeError("A média de peso deve ser maior que zero");

  if (kg < 5) return "toy";
  if (kg < 10) return "small";
  if (kg < 25) return "medium";
  if (kg < 45) return "large";
  return "giant";
};