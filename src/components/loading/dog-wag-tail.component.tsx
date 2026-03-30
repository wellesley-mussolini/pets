function TailSegment({ depth = 0 }: { depth?: number }) {
  if (depth >= 7) return null;
  return (
    <div className="w-[22px] h-[24.2px] bg-white bottom-[40%] rounded-[11px] left-[calc(50%-11px)] origin-[center_bottom] animate-dog-tail-segment">
      <TailSegment depth={depth + 1} />
    </div>
  );
}

export const DogWagTail = () => (
  <div className="relative box-border">
    {/* Dog container */}
    <div
      className={[
        "relative w-[100px] h-[100px] z-1 **:absolute",
        "before:content-[''] before:block before:absolute before:w-full before:h-full",
        "before:rounded-full before:bg-black/3 before:-translate-y-[30%] before:scale-150",
      ].join(" ")}
    >
      {/* Body */}
      <div
        className={[
          "rounded-full bg-white absolute h-full w-full -top-1/2",
          "animate-dog-body shadow-[inset_0_-15px_0_0_#eaebec]",
          "before:content-[''] before:absolute before:bottom-[90%] before:right-1/2",
          "before:w-[90%] before:h-[90%] before:bg-white/40",
          "before:rounded-tl-[100%] before:rounded-bl-[10%] before:rounded-tr-[10%]",
          "before:origin-[right_bottom] before:animate-dog-tail-blur",
        ].join(" ")}
      >
        {/* Root tail */}
        <div className="w-[22px] h-[24.2px] bg-white bottom-[90%] rounded-[11px] left-[calc(50%-11px)] origin-[center_bottom] animate-dog-tail">
          <TailSegment />
        </div>
      </div>

      {/* Torso */}
      <div className="rounded-full bg-white absolute h-full w-full -top-[20%] animate-dog-torso shadow-[inset_0_-15px_0_0_#eaebec]" />

      {/* Head */}
      <div className="rounded-full bg-white absolute h-full w-full animate-dog-head">
        {/* Ears */}
        <div className="w-[40%] top-[25%] left-[30%] animate-dog-ears">
          <div className="bottom-[-10px] h-[50px] w-[50px] bg-[#eaebec] rounded-bl-[80%] rounded-tr-[80%] right-full shadow-[inset_-15px_15px_0_1px_white] origin-[right_bottom] rotate-10" />
          <div className="bottom-[-10px] h-[50px] w-[50px] bg-[#eaebec] rounded-tl-[80%] rounded-br-[80%] left-full shadow-[inset_15px_15px_0_0_white] origin-[left_bottom] -rotate-10" />
        </div>

        {/* Eyes */}
        <div
          className={[
            "w-[60%] top-[55%] left-[20%] z-1",
            "before:content-[''] before:block before:h-[40px] before:w-[40px] before:rounded-[40px]",
            "before:absolute before:bg-[#ffc300] before:-top-[10px] before:-left-[10px]",
            "before:z-0 before:border-r-4 before:border-white before:-rotate-45",
          ].join(" ")}
        >
          <div className="w-[10px] h-[10px] rounded-full bg-black z-1 animate-dog-eye-blink left-0" />
          <div className="w-[10px] h-[10px] rounded-full bg-black z-1 animate-dog-eye-blink right-0" />
        </div>

        {/* Muzzle */}
        <div
          className={[
            "w-[60%] left-[20%] h-1/2 bg-white -bottom-[15%]",
            "rounded-bl-[100%] rounded-br-[100%]",
            "before:content-[''] before:block before:absolute before:w-[6px] before:h-[20px]",
            "before:bottom-0 before:left-[calc(50%-3px)] before:bg-[#eaebec]",
            "after:content-[''] after:block after:absolute after:bg-black",
            "after:w-[20px] after:h-[15px] after:bottom-[12px] after:left-[calc(50%-10px)]",
            "after:rounded-bl-[60%_60%] after:rounded-br-[60%_60%]",
            "after:rounded-tl-[50%_40%] after:rounded-tr-[50%_40%]",
          ].join(" ")}
        >
          {/* Tongue */}
          <div
            className={[
              "w-[40px] h-full left-[calc(50%-20px)] -z-1",
              "origin-[center_top] animate-dog-tongue",
              "before:content-[''] before:absolute before:block",
              "before:w-full before:h-full before:rounded-[40px]",
              "before:bg-[#fd3163] before:animate-dog-tongue-inner",
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  </div>
);