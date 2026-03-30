import { Button } from "../ui/button";

export const NotFound = () => {
  return (
    <section className="relative isolate overflow-hidden rounded-[32px] border border-stone-200 bg-[linear-gradient(180deg,#fbf6ee_0%,#f7efe3_100%)] px-8 py-14 md:px-14 md:py-20">
      {/* manchas suaves de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-80px] top-[-80px] h-56 w-56 rounded-full bg-orange-200/25 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-60px] h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      {/* <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"> */}
      <div className="flex flex-col">
        {/* lado esquerdo para texto */}
        {/* <div className="max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-800 md:text-6xl">
            Ops... Página não encontrada.
          </h1>
        </div> */}

        {/* lado direito ilustração */}
        <div className="relative mx-auto flex h-[420px] w-full max-w-[520px] items-center justify-center">
          {/* pegadas */}
          <div className="absolute left-6 top-12 h-10 w-10 rounded-full bg-orange-200/70" />
          <div className="absolute left-4 top-8 h-4 w-4 rounded-full bg-orange-200/70" />
          <div className="absolute left-14 top-5 h-4 w-4 rounded-full bg-orange-200/70" />
          <div className="absolute left-20 top-10 h-4 w-4 rounded-full bg-orange-200/70" />

          <div className="absolute right-10 top-20 h-10 w-10 rounded-full bg-stone-300/60" />
          <div className="absolute right-8 top-16 h-4 w-4 rounded-full bg-stone-300/60" />
          <div className="absolute right-18 top-12 h-4 w-4 rounded-full bg-stone-300/60" />
          <div className="absolute right-2 top-18 h-4 w-4 rounded-full bg-stone-300/60" />

          {/* chão */}
          <div className="absolute bottom-10 h-24 w-[88%] rounded-[999px] bg-[#ead8c2]/55 blur-[2px]" />

          {/* ossinho */}
          <div className="absolute bottom-20 right-8 rotate-[-8deg]">
            <div className="relative h-10 w-28">
              <div className="absolute left-0 top-2 h-6 w-6 rounded-full bg-white border border-stone-300" />
              <div className="absolute left-4 top-0 h-6 w-6 rounded-full bg-white border border-stone-300" />
              <div className="absolute left-10 top-2 h-6 w-8 bg-white border-y border-stone-300" />
              <div className="absolute right-4 top-2 h-6 w-6 rounded-full bg-white border border-stone-300" />
              <div className="absolute right-0 top-0 h-6 w-6 rounded-full bg-white border border-stone-300" />
            </div>
          </div>

          {/* coleira */}
          <div className="absolute bottom-24 left-8 rotate-[6deg]">
            <div className="relative h-10 w-28 rounded-full border-[10px] border-orange-500 bg-transparent shadow-sm">
              <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-700 bg-amber-300" />
            </div>
          </div>

          {/* placa 404 */}
          <div className="absolute bottom-8 z-20 flex items-end gap-2">
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
            <div className="absolute left-[32px] bottom-[70px] z-0 origin-[center_bottom] -rotate-30 animate-notfound-tail">
              <div className="relative h-12 w-5 rounded-full bg-[#ece7e1]" />
            </div>

            {/* corpo */}
            <div className="absolute bottom-[28px] left-[50px] z-1 h-[130px] w-[150px] rounded-[50%_50%_46%_46%] bg-white shadow-[inset_0_-14px_0_0_#ece7e1,0_14px_24px_rgba(120,90,60,0.06)] animate-notfound-body">
              <div className="absolute left-[44px] top-[20px] h-[80px] w-[58px] rounded-b-[36px] rounded-t-[24px] bg-[#f5f0ea]" />
            </div>

            {/* patas */}
            <div className="absolute bottom-[14px] left-[74px] z-2 h-16 w-9 rounded-full bg-white shadow-[inset_0_-8px_0_0_#ece7e1]" />
            <div className="absolute bottom-[14px] left-[134px] z-2 h-16 w-9 rounded-full bg-white shadow-[inset_0_-8px_0_0_#ece7e1]" />

            {/* cabeça */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[10px] z-10 h-[168px] w-[168px] rounded-full bg-white shadow-[inset_0_-14px_0_0_#ece7e1,0_14px_24px_rgba(120,90,60,0.06)] animate-notfound-head">
              {/* manchas */}
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
              border border-stone-300
              rounded-full px-5 py-3 text-sm font-semibold dark:text-white text-stone-700 shadow-lg shadow-orange-300/30 transition hover:-translate-y-0.5"
        >
          Voltar ao início
        </Button>
      </div>
    </section>
  );
}