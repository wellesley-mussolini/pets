type FormatoDataOptions = Partial<Intl.DateTimeFormatOptions>;

const formatoPadraoData: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
};

/**
 * Conjunto de funções para formatação de datas.
 * Expansível com novos formatos (ISO, com hora, etc).
 */
export const formatadorData = {
    /**
     * Formata data para padrão brasileiro: DD/MM/YYYY
     */
    paraPtBr: (data: Date, opcoes?: FormatoDataOptions): string => {
        return data.toLocaleDateString("pt-BR", {
            ...formatoPadraoData,
            ...opcoes,
        });
    },

    // Futuramente:
    // paraIso: (data: Date) => data.toISOString(),
    // paraComHora: (data: Date) => formatarComHora(data),
    // paraTimestamp: (data: Date) => data.getTime(),
};
