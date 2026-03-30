import { Button } from "../ui/button";
// bg-[linear-gradient(180deg,#fbf6ee_0%,#f7efe3_100%)]
export const NotFound = () => {
  return (
    <section className="bg-background relative">
      {/* manchas suaves de fundo */}


      <div className="relative mx-auto flex h-[420px] w-full max-w-[520px] items-center justify-center">

        {/* chão */}
        <div className="absolute bottom-10 h-24 w-[88%] rounded-[999px] bg-[#ead8c2]/55 blur-[2px]" />

        {/* coleira */}
        <div className="absolute left-1/2 top-[205px] z-20 -translate-x-1/2">
          <svg
            width="124"
            height="52"
            viewBox="0 0 124 52"
            className="overflow-visible"
            aria-hidden="true"
          >
            {/* sombra suave da coleira */}
            <path
              d="M14 14 Q62 48 110 14"
              fill="none"
              stroke="rgba(0,0,0,0.10)"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* faixa principal */}
            <path
              d="M14 12 Q62 44 110 12"
              fill="none"
              stroke="#ff6a00"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* brilho interno */}
            <path
              d="M22 14 Q62 38 102 14"
              fill="none"
              stroke="#ff9a1f"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* medalha */}
            <circle
              cx="62"
              cy="36"
              r="8"
              fill="#facc15"
              stroke="#b45309"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* placa 404 */}
        <div className="absolute top-72 z-20 flex items-end gap-2">
          <div className="relative h-28 w-24 -translate-y-3 rounded-2xl border-2 border-stone-300 bg-white shadow-md">
            <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-stone-700">
              4
            </span>
          </div>
          <div className="relative h-28 w-24 translate-y-2 rounded-2xl border-2 border-stone-300 bg-white shadow-md">
            <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-stone-700">
              0
            </span>
          </div>
          <div className="relative h-28 w-24 -translate-y-3 rounded-2xl border-2 border-stone-300 bg-white shadow-md">
            <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-stone-700">
              4
            </span>
          </div>
        </div>

        {/* cachorro */}
        <div className="relative z-10 h-[310px] w-[250px]">
          {/* cauda (atrás do corpo, saindo pela esquerda embaixo) */}
          <div className="absolute left-[42px] bottom-[96px] z-0 origin-[right_bottom] -rotate-62 animate-notfound-tail">
            <div className="relative h-[64px] w-[24px] rounded-full bg-white shadow-[inset_-2px_-4px_0_0_#ece7e1]" />
          </div>
          {/* corpo */}
          <div className="absolute bottom-[42px] left-[44px] z-[1] h-[142px] w-[162px] rounded-[48%_48%_42%_42%] bg-white shadow-[inset_0_-14px_0_0_#ece7e1,0_16px_28px_rgba(120,90,60,0.08)] animate-notfound-body">
            <div className="absolute left-1/2 top-[18px] h-[88px] w-[64px] -translate-x-1/2 rounded-[28px] bg-[#f3efe9]" />
            <div className="absolute left-1/2 bottom-[18px] h-[26px] w-[46px] -translate-x-1/2 rounded-full bg-[#f3efe9]" />
          </div>

          {/* patas */}
          <div className="absolute bottom-[14px] left-[74px] z-2 h-16 w-9 rounded-full bg-white shadow-[inset_0_-8px_0_0_#ece7e1]" />
          <div className="absolute bottom-[14px] left-[134px] z-2 h-16 w-9 rounded-full bg-white shadow-[inset_0_-8px_0_0_#ece7e1]" />

          {/* cabeça */}
          <div className="absolute left-1/2 top-[20px] z-10 h-[168px] w-[168px] -translate-x-1/2 rounded-full bg-white shadow-[inset_0_-14px_0_0_#ece7e1,0_14px_24px_rgba(120,90,60,0.06)] animate-notfound-head">              {/* manchas */}
            <div className="absolute left-[18px] top-[26px] h-[88px] w-[54px] rounded-[45%] bg-[#c97b36]" />
            <div className="absolute right-[22px] top-[24px] h-[82px] w-[50px] rounded-[45%] bg-[#c97b36]" />
            <div className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 rounded-full bg-[#fff7ef]/70" />

            {/* orelhas */}
            <div className="absolute left-[-8px] top-[46px] h-[74px] w-[56px] origin-top-right rounded-b-[44px] rounded-tl-[30px] rounded-tr-[26px] bg-[#8c4b22] shadow-[inset_-6px_-8px_0_0_#a85e2f] animate-notfound-ears" />
            <div className="absolute right-[-8px] top-[42px] h-[74px] w-[56px] origin-top-left rounded-b-[44px] rounded-tl-[26px] rounded-tr-[30px] bg-[#8c4b22] shadow-[inset_6px_-8px_0_0_#a85e2f] animate-notfound-ears" />

            {/* olhos */}
            <div className="absolute left-[42px] top-[74px] h-7 w-7 rounded-full bg-[#2f241e] shadow-[0_0_0_6px_white]">
              <div className="absolute left-[6px] top-[5px] h-2.5 w-2.5 rounded-full bg-white animate-notfound-blink" />
            </div>
            <div className="absolute right-[42px] top-[74px] h-7 w-7 rounded-full bg-[#2f241e] shadow-[0_0_0_6px_white]">
              <div className="absolute left-[6px] top-[5px] h-2.5 w-2.5 rounded-full bg-white animate-notfound-blink" />
            </div>

            {/* focinho */}
            <div className="absolute bottom-[22px] left-1/2 h-[68px] w-[86px] -translate-x-1/2 rounded-[999px] bg-[#fffaf5] shadow-[inset_0_-8px_0_0_#efe8de]">
              <div className="absolute left-1/2 top-[14px] h-5 w-7 -translate-x-1/2 rounded-[50%_50%_60%_60%] bg-[#3b2b22]" />
              <div className="absolute left-1/2 top-[30px] h-5 w-px -translate-x-1/2 bg-stone-400" />
              <div className="absolute left-[23px] top-[38px] h-3 w-5 rounded-b-full border-b-2 border-stone-600" />
              <div className="absolute right-[23px] top-[38px] h-3 w-5 rounded-b-full border-b-2 border-stone-600" />
            </div>
          </div>

          {/* ponto de interrogação */}
          <div className="absolute right-[-4px] top-[-10px] text-5xl font-black text-[#8c4b22]/85">
            ?
          </div>
        </div>
      </div>

      <Button
        variant="secondary"
        className="
            w-40
            mx-auto
              border 
              rounded-full px-5 py-3 text-sm font-semibold dark:text-white text-stone-700 shadow-lg shadow-orange-300/30 transition hover:-translate-y-0.5"
      >
        Voltar ao início
      </Button>
    </section>
  );
}