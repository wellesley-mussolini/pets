"use client";

import React from "react";
import { createClient } from "@/lib/supabase/browser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import {
  BREED_SIZE_LABELS_PT_BR,
  type BreedSize,
} from "../types/breeds.types";
import { classifyBreedSize } from "../utils/classify-breed-size.utils";
import {
  breedsFormZod,
  type BreedsFormValues,
} from "../zod/breeds-form.zod";

const WEIGHT_SLIDER_MIN_KG = 0;
const WEIGHT_SLIDER_MAX_KG = 90;

export function BreedForm({ onRegistered }: { onRegistered: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<BreedsFormValues>({
    resolver: zodResolver(breedsFormZod),
    defaultValues: {
      breed_group: "",
      weight_min: 10,
      weight_max: 25,
      life_span_min: 1,
      life_span_max: 1,
    },
    mode: "onTouched",
  });

  /** Evita renders desnecessários no restante do formulário; só “submitting” interessa aqui. */
  const { isSubmitting } = useFormState({ control: form.control });

  const weightRangeMinKg = form.watch("weight_min");
  const weightRangeMaxKg = form.watch("weight_max");

  /**
   * Peso médio entre os dois thumbs do slider (kg). Mesma fórmula que na gravação.
   * Null quando a soma dos pesos não for positiva — nada sensível para classificar.
   */
  const sliderWeightRangeClassification = React.useMemo(() => {
    const sumOfSelectedWeightsKg = weightRangeMinKg + weightRangeMaxKg;
    if (sumOfSelectedWeightsKg <= 0) return null;

    const averageKgOfSelectedWeightRange = sumOfSelectedWeightsKg / 2;
    const breedSizeCategory: BreedSize = classifyBreedSize(
      averageKgOfSelectedWeightRange,
    );

    return {
      averageKgOfSelectedWeightRange,
      breedSizeCategory,
    };
  }, [weightRangeMinKg, weightRangeMaxKg]);

  const handleSubmit = form.handleSubmit(async (values) => {
    /** Arithmetic mean of min/max kg from the submitted form — drives size rules. */
    const averageKgOfSubmittedWeightRange =
      (values.weight_min + values.weight_max) / 2;

    /** `BreedSize` enum stored in Supabase (`toy`, `small`, …). */
    const breedSizeCategoryToPersist: BreedSize = classifyBreedSize(
      averageKgOfSubmittedWeightRange,
    );

    try {
      const { error } = await createClient().from("breeds").insert({
        breed_group: values.breed_group.trim(),
        size: breedSizeCategoryToPersist,
        weight_min: values.weight_min,
        weight_max: values.weight_max,
        life_span_min: values.life_span_min,
        life_span_max: values.life_span_max,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Raça salva com sucesso.");
      form.reset({
        breed_group: "",
        weight_min: 10,
        weight_max: 25,
        life_span_min: 1,
        life_span_max: 1,
      });
      await queryClient.invalidateQueries({ queryKey: ["breeds"] });
      onRegistered();
    } catch {
      toast.error("Não foi possível salvar. Tente de novo.");
    }
  });

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="breed_group">Grupo da raça</Label>
        <Input
          id="breed_group"
          placeholder="Ex.: pastoreiro, caça, companhia"
          disabled={isSubmitting}
          {...form.register("breed_group")}
        />
        {form.formState.errors.breed_group && (
          <p className="text-sm text-destructive">
            {form.formState.errors.breed_group.message}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-base">Faixa de peso adulto (kg)</Label>
          <span className="text-muted-foreground text-sm tabular-nums">
            {weightRangeMinKg}–{weightRangeMaxKg} kg
          </span>
        </div>
        <Slider
          min={WEIGHT_SLIDER_MIN_KG}
          max={WEIGHT_SLIDER_MAX_KG}
          step={1}
          disabled={isSubmitting}
          value={[weightRangeMinKg, weightRangeMaxKg]}
          onValueChange={(sliderValues) => {
            const [rangeMinKg, rangeMaxKg] = sliderValues as number[];
            form.setValue("weight_min", rangeMinKg, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
            form.setValue("weight_max", rangeMaxKg, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }}
          aria-label="Faixa de peso em quilogramas"
        />
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <span>Média da faixa:</span>
          {sliderWeightRangeClassification ? (
            <>
              <span className="text-foreground font-medium tabular-nums">
                {sliderWeightRangeClassification.averageKgOfSelectedWeightRange.toLocaleString(
                  "pt-BR",
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 1,
                  },
                )}{" "}
                kg
              </span>
              <span>→</span>
              <Badge variant="secondary">
                {
                  BREED_SIZE_LABELS_PT_BR[
                    sliderWeightRangeClassification.breedSizeCategory
                  ]
                }
              </Badge>
            </>
          ) : (
            <span>Ajuste a faixa para ver a média.</span>
          )}
        </div>
        {(form.formState.errors.weight_min ||
          form.formState.errors.weight_max) && (
          <p className="text-sm text-destructive">
            {form.formState.errors.weight_min?.message ??
              form.formState.errors.weight_max?.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="life_span_min">Vida mín. (anos)</Label>
          <Input
            id="life_span_min"
            type="number"
            min={1}
            disabled={isSubmitting}
            {...form.register("life_span_min", { valueAsNumber: true })}
          />
          {form.formState.errors.life_span_min && (
            <p className="text-sm text-destructive">
              {form.formState.errors.life_span_min.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="life_span_max">Vida máx. (anos)</Label>
          <Input
            id="life_span_max"
            type="number"
            min={1}
            disabled={isSubmitting}
            {...form.register("life_span_max", { valueAsNumber: true })}
          />
          {form.formState.errors.life_span_max && (
            <p className="text-sm text-destructive">
              {form.formState.errors.life_span_max.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? (
          <>
            <Spinner className="size-4" />
            Salvando…
          </>
        ) : (
          "Registrar"
        )}
      </Button>
    </form>
  );
}
