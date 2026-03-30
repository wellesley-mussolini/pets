import { DogSpinningCircle } from "../components/loading/dog-spinning-circle.component";
import { DogWagTail } from "../components/loading/dog-wag-tail.component";

export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col h-screen">
      <DogWagTail />
      <DogSpinningCircle />
    </div>
  );
}
