"use client";

import { DogSpinningCircle } from "@/components/loading/dog-spinning-circle.component";
import { DogWagTail } from "@/components/loading/dog-wag-tail.component";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { NotFound } from "@/components/not-found/not-found.component";
import { BoneIcon } from "@/svgs/bone.svg";
import { PetCard } from "@/components/cards/pet-card.component";

export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col">
      {/* <BoneIcon />
      <NotFound /> */}
      {/* <PetCard
        image="https://cdn.pixabay.com/photo/2023/10/01/02/18/border-collie-8286676_1280.jpg"
        name="Border Collie"
        onClickDetails={() => { }}
        buttonText="vER DETALHES"
        description="EAEAEAEAE"
      /> */}
    </div>
  );
}
