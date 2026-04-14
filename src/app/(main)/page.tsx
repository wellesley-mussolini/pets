"use client";

import { DogSpinningCircle } from "@/components/loading/dog-spinning-circle.component";
import { DogWagTail } from "@/components/loading/dog-wag-tail.component";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { NotFound } from "@/components/not-found/not-found.component";
import { BoneIcon } from "@/svgs/bone.svg";

export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col">
      {/* <BoneIcon />
      <NotFound /> */}
    </div>
  );
}
