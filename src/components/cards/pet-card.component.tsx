interface PetCardProps {
  image: string;
  name: string;
  description: string;
  buttonText: string;
  onClickDetails: () => void;
}

export function PetCard({ image, name, description, buttonText, onClickDetails }: PetCardProps) {
  return (
    <div className="group relative flex items-end h-[325px] w-[250px] p-6 bg-white rounded shadow-[1px_0px_5px_1px_rgba(0,0,0,0.45)] overflow-hidden">
      {/* Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat select-none touch-none transition-transform duration-400 group-hover:scale-[1.08]"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[2]" />

      {/* Info */}
      <div className="relative z-10 flex flex-col gap-4 text-white opacity-0 translate-y-[30px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-[15px] tracking-wide mt-2">{description}</p>
        <button
          onClick={onClickDetails}
          className="flex justify-center items-center p-3 w-full rounded-[7px] border-none outline-none font-bold bg-[#fefefe] text-[#626262] cursor-pointer transition-all duration-500 hover:bg-[#009DFF] hover:text-white"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
